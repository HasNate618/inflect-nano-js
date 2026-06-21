import type { RawAudio } from "../audio/raw-audio.js";

const SENTENCE_BOUNDARY = /(?<=[.!?…])\s+/;

export interface StreamChunk {
  text: string;
  audio: RawAudio;
}

export class TextSplitterStream {
  private buffer = "";
  private closed = false;
  private pending: string[] = [];
  private waiters: Array<(value: string | null) => void> = [];

  push(text: string): void {
    if (this.closed) throw new Error("TextSplitterStream is closed");
    this.buffer += text;
    this.flushCompleteSentences();
  }

  close(): void {
    this.closed = true;
    if (this.buffer.trim()) {
      this.enqueue(this.buffer.trim());
      this.buffer = "";
    }
    this.resolveWaiters(null);
  }

  async next(): Promise<string | null> {
    if (this.pending.length) return this.pending.shift()!;
    if (this.closed) return null;
    return new Promise<string | null>((resolve) => this.waiters.push(resolve));
  }

  private flushCompleteSentences(): void {
    const parts = this.buffer.split(SENTENCE_BOUNDARY);
    if (parts.length === 1) return;
    this.buffer = parts.pop() ?? "";
    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed) this.enqueue(trimmed);
    }
  }

  private enqueue(text: string): void {
    const waiter = this.waiters.shift();
    if (waiter) waiter(text);
    else this.pending.push(text);
  }

  private resolveWaiters(value: string | null): void {
    while (this.waiters.length) {
      const waiter = this.waiters.shift();
      waiter?.(value);
    }
  }
}

export async function* iterateSplitter(splitter: TextSplitterStream): AsyncGenerator<string> {
  while (true) {
    const chunk = await splitter.next();
    if (chunk === null) break;
    yield chunk;
  }
}
