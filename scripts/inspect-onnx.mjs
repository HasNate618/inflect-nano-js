import * as ort from "onnxruntime-web";
import { readFileSync } from "node:fs";

const base = "/tmp/inflect-src/Inflect-Nano-v1-ONNX";
for (const name of ["acoustic_encoder", "acoustic_decoder", "vocoder"]) {
  const buffer = readFileSync(`${base}/${name}.onnx`);
  const session = await ort.InferenceSession.create(buffer, { executionProviders: ["wasm"] });
  console.log("===", name, "===");
  console.log("inputs", session.inputNames);
  console.log("outputs", session.outputNames);
}
