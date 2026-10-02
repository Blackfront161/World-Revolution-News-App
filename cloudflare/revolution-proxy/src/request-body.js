export const MAX_BODY_BYTES = 40000;

export class BodyTooLargeError extends Error {}

// Content-Length is only an early rejection hint. The bytes actually received
// enforce the limit, including chunked bodies and dishonest length headers.
export async function readBoundedJson(request) {
  if (Number(request.headers.get('Content-Length') || 0) > MAX_BODY_BYTES) {
    throw new BodyTooLargeError();
  }
  const reader = request.body?.getReader();
  if (!reader) return JSON.parse('');
  const chunks = [];
  let total = 0;
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_BODY_BYTES) {
        void reader.cancel().catch(() => {});
        throw new BodyTooLargeError();
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
}
