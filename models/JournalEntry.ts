export interface JournalEntry {
  text: string;
  tags: string[];
}

export function createEmptyEntry(): JournalEntry {
  return {
    text: "",
    tags: [],
  };
}

export function parseYamlEntry(yamlData: Record<string, unknown>): JournalEntry {
  const text = typeof yamlData.text === "string" ? yamlData.text : "";
  const tags = Array.isArray(yamlData.tags)
    ? yamlData.tags.filter((tag): tag is string => typeof tag === "string")
    : [];

  return { text, tags };
}

export function entryToYaml(entry: JournalEntry): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  if (entry.text) {
    result.text = entry.text;
  }

  if (entry.tags.length > 0) {
    result.tags = entry.tags;
  }

  return result;
}

export function isEntryEmpty(entry: JournalEntry): boolean {
  return entry.text.trim() === "" && entry.tags.length === 0;
}
