interface G2pModel {
  enc_emb: Float32Array[];
  enc_w_ih: Float32Array[];
  enc_w_hh: Float32Array[];
  enc_b_ih: Float32Array;
  enc_b_hh: Float32Array;
  dec_emb: Float32Array[];
  dec_w_ih: Float32Array[];
  dec_w_hh: Float32Array[];
  dec_b_ih: Float32Array;
  dec_b_hh: Float32Array;
  fc_w: Float32Array[];
  fc_b: Float32Array;
  graphemes: string[];
  phonemes: string[];
  g2idx: Record<string, number>;
  idx2p: Record<number, string>;
  hiddenDim: number;
}

let model: G2pModel | null = null;

function b64ToFloat32(b64: string): Float32Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Float32Array(bytes.buffer);
}

function reshape2D(flat: Float32Array, rows: number, cols: number): Float32Array[] {
  const result: Float32Array[] = [];
  for (let i = 0; i < rows; i++) {
    result.push(flat.subarray(i * cols, (i + 1) * cols));
  }
  return result;
}

export async function loadG2pModel(url: string): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to load G2P model: ${response.status} ${url}`);
  const raw = await response.json();

  const tensors: Record<string, Float32Array | Float32Array[]> = {};
  for (const name of [
    "enc_emb", "enc_w_ih", "enc_w_hh", "enc_b_ih", "enc_b_hh",
    "dec_emb", "dec_w_ih", "dec_w_hh", "dec_b_ih", "dec_b_hh",
    "fc_w", "fc_b",
  ] as const) {
    const { shape, data } = raw[name];
    const flat = b64ToFloat32(data);
    tensors[name] = shape.length === 2 ? reshape2D(flat, shape[0], shape[1]) : flat;
  }

  const g2idx: Record<string, number> = {};
  for (let i = 0; i < raw.graphemes.length; i++) g2idx[raw.graphemes[i]] = i;
  const idx2p: Record<number, string> = {};
  for (let i = 0; i < raw.phonemes.length; i++) idx2p[i] = raw.phonemes[i];

  model = {
    enc_emb: tensors.enc_emb as Float32Array[],
    enc_w_ih: tensors.enc_w_ih as Float32Array[],
    enc_w_hh: tensors.enc_w_hh as Float32Array[],
    enc_b_ih: tensors.enc_b_ih as Float32Array,
    enc_b_hh: tensors.enc_b_hh as Float32Array,
    dec_emb: tensors.dec_emb as Float32Array[],
    dec_w_ih: tensors.dec_w_ih as Float32Array[],
    dec_w_hh: tensors.dec_w_hh as Float32Array[],
    dec_b_ih: tensors.dec_b_ih as Float32Array,
    dec_b_hh: tensors.dec_b_hh as Float32Array,
    fc_w: tensors.fc_w as Float32Array[],
    fc_b: tensors.fc_b as Float32Array,
    graphemes: raw.graphemes,
    phonemes: raw.phonemes,
    g2idx,
    idx2p,
    hiddenDim: raw.enc_w_hh_shape?.[1] ?? raw.enc_w_hh.shape[1],
  };
}

function gruCell(
  x: Float32Array,
  h: Float32Array,
  wIh: Float32Array[],
  wHh: Float32Array[],
  bIh: Float32Array,
  bHh: Float32Array,
  hiddenDim: number,
): Float32Array {
  const dim3 = hiddenDim * 3;
  const rznIh = new Float32Array(dim3);
  const rznHh = new Float32Array(dim3);

  for (let i = 0; i < dim3; i++) {
    let sumIh = bIh[i];
    let sumHh = bHh[i];
    const rowIh = wIh[i];
    const rowHh = wHh[i];
    for (let j = 0; j < x.length; j++) sumIh += x[j] * rowIh[j];
    for (let j = 0; j < h.length; j++) sumHh += h[j] * rowHh[j];
    rznIh[i] = sumIh;
    rznHh[i] = sumHh;
  }

  const dim2 = hiddenDim * 2;
  const rz = new Float32Array(dim2);
  for (let i = 0; i < dim2; i++) {
    rz[i] = 1 / (1 + Math.exp(-(rznIh[i] + rznHh[i])));
  }

  const r = rz.subarray(0, hiddenDim);
  const z = rz.subarray(hiddenDim, dim2);
  const newH = new Float32Array(hiddenDim);
  for (let i = 0; i < hiddenDim; i++) {
    const n = Math.tanh(rznIh[dim2 + i] + r[i] * rznHh[dim2 + i]);
    newH[i] = (1 - z[i]) * n + z[i] * h[i];
  }
  return newH;
}

function gruEncode(
  embeds: Float32Array[],
  steps: number,
  wIh: Float32Array[],
  wHh: Float32Array[],
  bIh: Float32Array,
  bHh: Float32Array,
  hiddenDim: number,
): Float32Array {
  let h = new Float32Array(hiddenDim);
  for (let t = 0; t < steps; t++) {
    h = gruCell(embeds[t], h, wIh, wHh, bIh, bHh, hiddenDim) as Float32Array<ArrayBuffer>;
  }
  return h;
}

/** Neural G2P fallback — ported from tiny-tts/g2p_predict.js (Apache-2.0). */
export function predictG2p(word: string): string[] | null {
  if (!model) return null;

  const chars = [...word.split(""), "</s>"];
  const encInput = chars.map((ch) => {
    const idx = model!.g2idx[ch] ?? model!.g2idx["<unk>"];
    return model!.enc_emb[idx];
  });

  const hiddenDim = model.hiddenDim;
  let h = gruEncode(encInput, chars.length, model.enc_w_ih, model.enc_w_hh, model.enc_b_ih, model.enc_b_hh, hiddenDim);
  let dec = model.dec_emb[2];
  const preds: string[] = [];

  for (let i = 0; i < 20; i++) {
    h = gruCell(dec, h, model.dec_w_ih, model.dec_w_hh, model.dec_b_ih, model.dec_b_hh, hiddenDim);
    let maxVal = -Infinity;
    let maxIdx = 0;
    for (let j = 0; j < model.fc_w.length; j++) {
      let logit = model.fc_b[j];
      const row = model.fc_w[j];
      for (let k = 0; k < hiddenDim; k++) logit += h[k] * row[k];
      if (logit > maxVal) {
        maxVal = logit;
        maxIdx = j;
      }
    }
    if (maxIdx === 3) break;
    preds.push(model.idx2p[maxIdx] ?? "<unk>");
    dec = model.dec_emb[maxIdx];
  }

  return preds;
}
