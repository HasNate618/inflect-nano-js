export type CmuDict = Record<string, string[]>;

let dict: CmuDict | null = null;

export async function loadCmuDict(url: string): Promise<CmuDict> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to load CMU dictionary: ${response.status} ${url}`);
  dict = (await response.json()) as CmuDict;
  return dict;
}

export function getCmuDict(): CmuDict {
  if (!dict) throw new Error("CMU dictionary not loaded. Call loadTextFrontend() first.");
  return dict;
}
