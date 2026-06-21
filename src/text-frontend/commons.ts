export function insertBlanks(ids: number[], blank = 0): number[] {
  const result = new Array(ids.length * 2 + 1).fill(blank);
  for (let i = 0; i < ids.length; i++) {
    result[i * 2 + 1] = ids[i];
  }
  return result;
}
