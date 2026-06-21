# Inflect-Nano-v1 JavaScript Library — Design Spec

**Date:** 2025-06-20  
**Status:** Approved and implemented (v0.1.0)

## Goal

Browser-first npm library for [Inflect-Nano-v1](https://huggingface.co/owensong/Inflect-Nano-v1) text-to-speech (~4.6M parameters), inspired by [kokoro-js](https://www.npmjs.com/package/kokoro-js) but smaller and faster. Runs 100% client-side using ONNX Runtime Web (WASM).

## Architecture

```
text
  → TextFrontend (normalize → G2P → token IDs)
  → acoustic_encoder.onnx
  → hostRegulate() [pure JS]
  → acoustic_decoder.onnx
  → vocoder.onnx
  → RawAudio (24 kHz Float32Array)
```

### Model assets (fetched at runtime)

| Asset | Source | ~Size |
|-------|--------|-------|
| `acoustic_encoder.onnx` | [Luigi/Inflect-Nano-v1-ONNX](https://huggingface.co/Luigi/Inflect-Nano-v1-ONNX) | 5.6 MB |
| `acoustic_decoder.onnx` | Luigi ONNX repo | 8.0 MB |
| `vocoder.onnx` | Luigi ONNX repo | 4.7 MB |
| `cmudict.json` | [tiny-tts@5.0.1](https://www.npmjs.com/package/tiny-tts) CDN | 5.3 MB |
| `g2p_model.json` | tiny-tts CDN (g2p_en neural port) | 4.5 MB |
| onnxruntime-web WASM | jsDelivr CDN | ~8 MB |

**Total first load:** ~36 MB (browser cacheable).

## Public API

```typescript
import { InflectNanoTTS, TextSplitterStream } from "inflect-nano-js";

const tts = await InflectNanoTTS.from_pretrained("Luigi/Inflect-Nano-v1-ONNX", {
  device: "wasm",
});

// Batch synthesis
const audio = await tts.generate("Hello from Inflect-Nano.");
await audio.play();

// Streaming (LLM-friendly)
const splitter = new TextSplitterStream();
const stream = tts.stream(splitter);
splitter.push("First sentence. ");
splitter.push("Second sentence.");
splitter.close();
for await (const { text, audio } of stream) {
  console.log(text, audio.duration);
}
```

## Components

| Module | Responsibility |
|--------|----------------|
| `InflectNanoTTS` | Model loading, `generate()`, `stream()` |
| `TextFrontend` | Text cleaning, normalization, G2P, phoneme IDs |
| `hostRegulate` | Length regulator between encoder/decoder |
| `OnnxPipeline` | Three ONNX session orchestration |
| `TextSplitterStream` | Sentence-boundary streaming input |
| `RawAudio` | WAV encode, `play()`, `save()`, `toBlob()` |

## v1 scope

**Included:**
- Browser ESM bundle
- WASM inference via onnxruntime-web
- `from_pretrained()`, `generate()`, `stream()`
- Apache-2.0 license with attribution

**Deferred:**
- Node.js entry point
- WebGPU backend
- Quantized ONNX (q8)
- IndexedDB asset caching
- Prosody controls (length/pitch/energy) — ONNX export does not expose these inputs yet
- Full BERT WordPiece tokenizer (uses CMU + neural G2P fallback aligned with tiny-tts)

## Attribution

- Model: [owensong/Inflect-Nano-v1](https://huggingface.co/owensong/Inflect-Nano-v1) (Apache-2.0)
- ONNX export: [Luigi/Inflect-Nano-v1-ONNX](https://huggingface.co/Luigi/Inflect-Nano-v1-ONNX)
- G2P assets: [tiny-tts](https://www.npmjs.com/package/tiny-tts) neural g2p_en port (Apache-2.0)

## Limitations

Inflect-Nano-v1 is experimental research-grade TTS. Expect robotic output on hard text, single English male voice, and lower quality than Kokoro-82M. This library optimizes for **size and speed**, not SOTA speech quality.
