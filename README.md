# inflect-nano-js

Ultra-lightweight browser text-to-speech for [Inflect-Nano-v1](https://huggingface.co/owensong/Inflect-Nano-v1) — a complete 4.6M-parameter English TTS stack. Inspired by [kokoro-js](https://www.npmjs.com/package/kokoro-js), but ~18× smaller and faster to load.

Runs 100% in the browser via [ONNX Runtime Web](https://www.npmjs.com/package/onnxruntime-web) (WASM). No server required.

## Why Inflect-Nano?

| | kokoro-js | inflect-nano-js |
|---|---|---|
| Parameters | ~82M | **4.63M** |
| First-load assets | ~80MB+ | **~36MB** |
| Voices | 50+ | 1 (English male) |
| Quality | High | Experimental / research |
| Speed (WASM) | Good | **Faster** (smaller graphs) |

Inflect-Nano keeps acoustic model **and** vocoder under 5M params — no external vocoder dependency.

## Install

```bash
npm install inflect-nano-js
```

## Quick start

```javascript
import { InflectNanoTTS } from "inflect-nano-js";

const tts = await InflectNanoTTS.from_pretrained();

const audio = await tts.generate("Wait, are you actually being for real now?");
await audio.play();

// Save as WAV
await audio.save("speech.wav");

// Get a Blob for Web Audio API / MediaRecorder
const blob = audio.toBlob();
```

### Streaming (LLM integration)

```javascript
import { InflectNanoTTS, TextSplitterStream } from "inflect-nano-js";

const tts = await InflectNanoTTS.from_pretrained();
const splitter = new TextSplitterStream();
const stream = tts.stream(splitter);

// Consume audio as sentences complete
(async () => {
  for await (const { text, audio } of stream) {
    console.log(`Synthesized: "${text}" (${audio.duration.toFixed(2)}s)`);
    await audio.play();
  }
})();

// Feed text incrementally (e.g. from an LLM)
splitter.push("The quick brown fox ");
splitter.push("jumps over the lazy dog.");
splitter.close();
```

### Load progress

```javascript
const tts = await InflectNanoTTS.from_pretrained("Luigi/Inflect-Nano-v1-ONNX", {
  progressCallback: ({ file, loaded, total }) => {
    const pct = total ? Math.round((loaded / total) * 100) : "?";
    console.log(`${file.split("/").pop()}: ${pct}%`);
  },
});
```

## Browser demo

Serve the example locally (requires a static server for ES modules):

```bash
npm run build
npx serve examples/browser-demo
```

Open `http://localhost:3000` and click **Load model** then **Speak**.

## API reference

### `InflectNanoTTS.from_pretrained(modelId?, options?)`

Loads ONNX models and text-frontend assets from Hugging Face / CDN.

| Option | Default | Description |
|--------|---------|-------------|
| `device` | `"wasm"` | Inference backend (WASM only in v0.1) |
| `wasmPaths` | jsDelivr onnxruntime-web | Path to ORT WASM binaries |
| `modelUrls` | HF Luigi repo | Override individual asset URLs |
| `progressCallback` | — | Download progress hook |

### `tts.generate(text, options?)`

Returns `RawAudio` with a 24 kHz mono `Float32Array`.

### `tts.stream(splitter)`

Returns an `AsyncGenerator<{ text, audio }>` yielding one segment per completed sentence.

### `RawAudio`

| Method | Description |
|--------|-------------|
| `audio` | `Float32Array` PCM samples |
| `duration` | Length in seconds |
| `toBlob()` | WAV `Blob` |
| `play()` | Play via `HTMLAudioElement` |
| `save(filename)` | Trigger browser download |

### Low-level text API

```javascript
import { textToTokens, graphemeToPhoneme, normalizeText } from "inflect-nano-js";

const tokens = textToTokens("Hello world.");
// { phoneIds, toneIds, langIds }
```

## How it works

```
text
  → clean + normalize (numbers, times, abbreviations)
  → grapheme-to-phoneme (CMU dict + neural G2P fallback)
  → phoneme IDs + blank insertion
  → acoustic_encoder.onnx
  → hostRegulate() [JS length regulator]
  → acoustic_decoder.onnx → mel
  → vocoder.onnx → 24 kHz waveform
```

The ONNX export is from [Luigi/Inflect-Nano-v1-ONNX](https://huggingface.co/Luigi/Inflect-Nano-v1-ONNX). The length regulator between encoder and decoder runs in JavaScript (ported from the reference Python implementation).

## Bundle size

The npm package itself is ~35 KB (code only). Model weights are downloaded on first `from_pretrained()`:

- 3 ONNX files: ~18 MB
- CMU dictionary + G2P model: ~10 MB
- onnxruntime-web WASM: ~8 MB

Subsequent visits can use browser HTTP cache.

## Limitations

- **Quality:** Experimental model — can sound robotic or unstable on unseen text
- **Voice:** Single English male voice only
- **Language:** English only
- **Browser only:** Node.js support planned for a future release
- **Prosody controls:** Not exposed in current ONNX export

## Attribution

- [owensong/Inflect-Nano-v1](https://huggingface.co/owensong/Inflect-Nano-v1) — model weights (Apache-2.0)
- [Luigi/Inflect-Nano-v1-ONNX](https://huggingface.co/Luigi/Inflect-Nano-v1-ONNX) — ONNX export
- [tiny-tts](https://www.npmjs.com/package/tiny-tts) — CMU dictionary + neural G2P port (Apache-2.0)

## License

Apache-2.0
