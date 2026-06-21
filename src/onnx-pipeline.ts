import * as ort from "onnxruntime-web";
import { hostRegulate } from "./host-regulate.js";
import { fetchArrayBuffer } from "./model-loader.js";
import type { DecoderFeeds, GenerateOptions, LoadProgress, TokenIds } from "./types.js";

export interface OnnxPipelineOptions {
  wasmPaths?: string;
  modelUrls: {
    acousticEncoder: string;
    acousticDecoder: string;
    vocoder: string;
  };
  progressCallback?: (progress: LoadProgress) => void;
}

function int64Tensor(data: ArrayLike<number>, dims: number[]): ort.Tensor {
  const values = new BigInt64Array(data.length);
  for (let i = 0; i < data.length; i++) values[i] = BigInt(data[i]);
  return new ort.Tensor("int64", values, dims);
}

function normalizeAudio(audio: Float32Array, targetRmsDb = -20, peakDb = -1): Float32Array {
  if (!audio.length) return new Float32Array([0]);

  const out = new Float32Array(audio.length);
  let mean = 0;
  for (const sample of audio) mean += sample;
  mean /= audio.length;

  let sumSq = 0;
  for (let i = 0; i < audio.length; i++) {
    const centered = audio[i] - mean;
    out[i] = centered;
    sumSq += centered * centered;
  }

  const rms = Math.sqrt(sumSq / audio.length) + 1e-9;
  const rmsDb = 20 * Math.log10(rms);
  const gain = 10 ** ((targetRmsDb - rmsDb) / 20);
  let peak = 0;
  for (let i = 0; i < out.length; i++) {
    out[i] *= gain;
    peak = Math.max(peak, Math.abs(out[i]));
  }

  const peakLimit = 10 ** (peakDb / 20);
  if (peak > peakLimit) {
    const scale = peakLimit / peak;
    for (let i = 0; i < out.length; i++) out[i] *= scale;
  }

  for (let i = 0; i < out.length; i++) {
    out[i] = Math.max(-1, Math.min(1, out[i]));
  }
  return out;
}

export class OnnxPipeline {
  private encoder: ort.InferenceSession | null = null;
  private decoder: ort.InferenceSession | null = null;
  private vocoder: ort.InferenceSession | null = null;

  static async create(options: OnnxPipelineOptions): Promise<OnnxPipeline> {
    if (options.wasmPaths) {
      ort.env.wasm.wasmPaths = options.wasmPaths;
    }

    const progress = options.progressCallback;
    const [encoderBuf, decoderBuf, vocoderBuf] = await Promise.all([
      fetchArrayBuffer(options.modelUrls.acousticEncoder, progress),
      fetchArrayBuffer(options.modelUrls.acousticDecoder, progress),
      fetchArrayBuffer(options.modelUrls.vocoder, progress),
    ]);

    const sessionOptions: ort.InferenceSession.SessionOptions = {
      executionProviders: ["wasm"],
    };

    const pipeline = new OnnxPipeline();
    pipeline.encoder = await ort.InferenceSession.create(encoderBuf, sessionOptions);
    pipeline.decoder = await ort.InferenceSession.create(decoderBuf, sessionOptions);
    pipeline.vocoder = await ort.InferenceSession.create(vocoderBuf, sessionOptions);
    return pipeline;
  }

  async synthesize(tokens: TokenIds, _options: GenerateOptions = {}): Promise<Float32Array> {
    if (!this.encoder || !this.decoder || !this.vocoder) {
      throw new Error("ONNX pipeline not initialized");
    }

    const seqLen = tokens.phoneIds.length;
    const speaker = int64Tensor([0], [1]);
    const phone = int64Tensor(tokens.phoneIds, [1, seqLen]);
    const tone = int64Tensor(tokens.toneIds, [1, seqLen]);
    const lang = int64Tensor(tokens.langIds, [1, seqLen]);

    const encoderOut = await this.encoder.run({
      phone,
      tone,
      lang,
      speaker,
    });

    const conditioned = encoderOut.conditioned?.data as Float32Array;
    const durations = encoderOut.durations?.data as Float32Array;
    const pitch = encoderOut.pitch?.data as Float32Array;
    if (!conditioned || !durations || !pitch) {
      throw new Error("Unexpected acoustic encoder outputs");
    }

    const intDurations = new Int32Array(durations.length);
    for (let i = 0; i < durations.length; i++) intDurations[i] = Math.round(durations[i]);

    const hiddenSize = conditioned.length / seqLen;
    const feeds = hostRegulate(conditioned, intDurations, pitch, seqLen, hiddenSize);
    const decoderOut = await this.decoder.run(decoderFeedsToOrt(feeds));
    const mel = decoderOut.mel?.data as Float32Array;
    if (!mel) throw new Error("Unexpected acoustic decoder output");

    const vocoderOut = await this.vocoder.run({
      mel: new ort.Tensor("float32", mel, [1, 80, feeds.frameCount]),
    });
    const wav = vocoderOut.wav?.data as Float32Array;
    if (!wav) throw new Error("Unexpected vocoder output");

    return normalizeAudio(wav);
  }

  async dispose(): Promise<void> {
    await Promise.all([
      this.encoder?.release(),
      this.decoder?.release(),
      this.vocoder?.release(),
    ]);
    this.encoder = null;
    this.decoder = null;
    this.vocoder = null;
  }
}

function decoderFeedsToOrt(feeds: DecoderFeeds): Record<string, ort.Tensor> {
  const F = feeds.frameCount;
  return {
    frames: new ort.Tensor("float32", feeds.frames, [1, F, feeds.frames.length / F]),
    frame_meta: new ort.Tensor("float32", feeds.frame_meta, [1, F, 8]),
    local_ctx_raw: new ort.Tensor("float32", feeds.local_ctx_raw, [1, F, feeds.local_ctx_raw.length / F]),
    abs_pos: new ort.Tensor("int64", feeds.abs_pos, [1, F]),
    pitch_frame: new ort.Tensor("float32", feeds.pitch_frame, [1, F, 2]),
    frame_mask: new ort.Tensor("bool", feeds.frame_mask, [1, F]),
  };
}
