import type { DecoderFeeds } from "./types.js";

const ABS_FRAME_BINS = 512;
const MAX_FRAMES = 1400;

/**
 * Host-side length regulator between acoustic encoder and decoder ONNX sessions.
 * Ported from Luigi/Inflect-Nano-v1-ONNX inflect_onnx_infer.py.
 */
export function hostRegulate(
  conditioned: Float32Array,
  durations: Int32Array,
  pitch: Float32Array,
  timeSteps: number,
  hiddenSize: number,
): DecoderFeeds {
  const d = new Int32Array(timeSteps);
  for (let i = 0; i < timeSteps; i++) d[i] = Math.max(0, durations[i]);

  const frames: number[] = [];
  const tokenIndices: number[] = [];
  const starts: number[] = [];
  let frameCount = 0;

  for (let t = 0; t < timeSteps; t++) {
    starts[t] = frameCount;
    for (let r = 0; r < d[t]; r++) {
      const offset = t * hiddenSize;
      for (let h = 0; h < hiddenSize; h++) frames.push(conditioned[offset + h]);
      tokenIndices.push(t);
      frameCount++;
    }
  }

  const F = frameCount;
  const frameMeta = new Float32Array(F * 8);
  const localCtxRaw = new Float32Array(F * hiddenSize * 3);
  const absPos = new BigInt64Array(F);
  const pitchFrame = new Float32Array(F * 2);
  const frameMask = new Uint8Array(F);

  const tokenCount = Math.max(1, d.reduce((acc, value) => acc + (value > 0 ? 1 : 0), 0));

  for (let f = 0; f < F; f++) {
    const tok = tokenIndices[f];
    const within = f - starts[tok];
    const dpf = d[tok];
    const rel = within / Math.max(dpf - 1, 1);
    const tokenPos = tok / Math.max(1, tokenCount - 1);
    const logDurF = Math.log1p(dpf) / 6;
    const center = 1 - Math.abs(rel * 2 - 1);

    const metaBase = f * 8;
    frameMeta[metaBase] = rel;
    frameMeta[metaBase + 1] = 1 - rel;
    frameMeta[metaBase + 2] = center;
    frameMeta[metaBase + 3] = Math.sin(rel * Math.PI);
    frameMeta[metaBase + 4] = Math.cos(rel * Math.PI);
    frameMeta[metaBase + 5] = tokenPos;
    frameMeta[metaBase + 6] = logDurF;
    frameMeta[metaBase + 7] = dpf / 40;

    const prevOffset = Math.max(0, tok - 1) * hiddenSize;
    const curOffset = tok * hiddenSize;
    const nextOffset = Math.min(timeSteps - 1, tok + 1) * hiddenSize;
    const localBase = f * hiddenSize * 3;
    for (let h = 0; h < hiddenSize; h++) {
      localCtxRaw[localBase + h] = conditioned[prevOffset + h];
      localCtxRaw[localBase + hiddenSize + h] = conditioned[curOffset + h];
      localCtxRaw[localBase + hiddenSize * 2 + h] = conditioned[nextOffset + h];
    }

    absPos[f] = BigInt(Math.min(Math.floor((f * ABS_FRAME_BINS) / Math.max(1, MAX_FRAMES)), ABS_FRAME_BINS - 1));
    pitchFrame[f * 2] = pitch[tok * 2];
    pitchFrame[f * 2 + 1] = pitch[tok * 2 + 1];
    frameMask[f] = 1;
  }

  return {
    frames: new Float32Array(frames),
    frame_meta: frameMeta,
    local_ctx_raw: localCtxRaw,
    abs_pos: absPos,
    pitch_frame: pitchFrame,
    frame_mask: frameMask,
    frameCount: F,
  };
}
