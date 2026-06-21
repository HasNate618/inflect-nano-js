import { RawAudio } from "./audio/raw-audio.js";
import { hfRepoFileUrl } from "./model-loader.js";
import { OnnxPipeline } from "./onnx-pipeline.js";
import {
  iterateSplitter,
  TextSplitterStream,
} from "./streaming/text-splitter-stream.js";
import type { StreamChunk } from "./streaming/text-splitter-stream.js";
import { loadTextFrontend, textToTokens } from "./text-frontend/index.js";
import {
  DEFAULT_ASSET_URLS,
  DEFAULT_MODEL_REPO,
  type GenerateOptions,
  type InflectNanoOptions,
} from "./types.js";

export class InflectNanoTTS {
  private constructor(private readonly pipeline: OnnxPipeline) {}

  static async from_pretrained(
    modelId: string = DEFAULT_MODEL_REPO,
    options: InflectNanoOptions = {},
  ): Promise<InflectNanoTTS> {
    const urls = {
      ...DEFAULT_ASSET_URLS,
      acousticEncoder: hfRepoFileUrl(modelId, "acoustic_encoder.onnx"),
      acousticDecoder: hfRepoFileUrl(modelId, "acoustic_decoder.onnx"),
      vocoder: hfRepoFileUrl(modelId, "vocoder.onnx"),
      ...options.modelUrls,
    };

    await loadTextFrontend({ cmudict: urls.cmudict, g2pModel: urls.g2pModel });
    const pipeline = await OnnxPipeline.create({
      wasmPaths: options.wasmPaths ?? "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.27.0/dist/",
      modelUrls: {
        acousticEncoder: urls.acousticEncoder,
        acousticDecoder: urls.acousticDecoder,
        vocoder: urls.vocoder,
      },
      progressCallback: options.progressCallback,
    });

    return new InflectNanoTTS(pipeline);
  }

  async generate(text: string, options: GenerateOptions = {}): Promise<RawAudio> {
    const tokens = textToTokens(text);
    const audio = await this.pipeline.synthesize(tokens, options);
    return new RawAudio(audio);
  }

  stream(splitter: TextSplitterStream): AsyncGenerator<StreamChunk> {
    const self = this;
    return (async function* () {
      for await (const text of iterateSplitter(splitter)) {
        const audio = await self.generate(text);
        yield { text, audio };
      }
    })();
  }

  async dispose(): Promise<void> {
    await this.pipeline.dispose();
  }
}

export { RawAudio } from "./audio/raw-audio.js";
export { TextSplitterStream } from "./streaming/text-splitter-stream.js";
export { textToTokens, graphemeToPhoneme, normalizeText } from "./text-frontend/index.js";
export type { GenerateOptions, InflectNanoOptions, LoadProgress } from "./types.js";
export type { StreamChunk } from "./streaming/text-splitter-stream.js";
