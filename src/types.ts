export const SAMPLE_RATE = 24_000;

export const DEFAULT_MODEL_REPO = "Luigi/Inflect-Nano-v1-ONNX";

export const HF_BASE = "https://huggingface.co";

export const DEFAULT_ASSET_URLS = {
  acousticEncoder: `${HF_BASE}/${DEFAULT_MODEL_REPO}/resolve/main/acoustic_encoder.onnx`,
  acousticDecoder: `${HF_BASE}/${DEFAULT_MODEL_REPO}/resolve/main/acoustic_decoder.onnx`,
  vocoder: `${HF_BASE}/${DEFAULT_MODEL_REPO}/resolve/main/vocoder.onnx`,
  cmudict: "https://cdn.jsdelivr.net/npm/tiny-tts@5.0.1/cmudict.json",
  g2pModel: "https://cdn.jsdelivr.net/npm/tiny-tts@5.0.1/g2p_model.json",
} as const;

export type Device = "wasm";

export interface InflectNanoOptions {
  device?: Device;
  wasmPaths?: string;
  modelUrls?: Partial<typeof DEFAULT_ASSET_URLS>;
  progressCallback?: (progress: LoadProgress) => void;
}

export interface LoadProgress {
  file: string;
  loaded: number;
  total: number | null;
}

export interface GenerateOptions {
  /** Reserved for future ONNX export with prosody controls. */
  lengthScale?: number;
  pitchScale?: number;
  energyScale?: number;
}

export interface TokenIds {
  phoneIds: number[];
  toneIds: number[];
  langIds: number[];
}

export interface DecoderFeeds {
  frames: Float32Array;
  frame_meta: Float32Array;
  local_ctx_raw: Float32Array;
  abs_pos: Int32Array;
  pitch_frame: Float32Array;
  frame_mask: Uint8Array;
  frameCount: number;
}
