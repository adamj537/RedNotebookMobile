import AsyncStorage from "@react-native-async-storage/async-storage";
import * as yaml from "js-yaml";
import {
  JournalEntry,
  createEmptyEntry,
  parseYamlEntry,
  entryToYaml,
  isEntryEmpty,
} from "@/models/JournalEntry";
import { formatDatePath, dateToKey } from "@/utils/dateUtils";

const JOURNAL_PREFIX = "journal:";
const TAGS_KEY = "allTags";

export class LocalStorageService {
  private static getKey(date: Date): string {
    const { year, month, day } = formatDatePath(date);
    return `${JOURNAL_PREFIX}${year}/${month}/${day}`;
  }

  static async loadEntry(date: Date): Promise<JournalEntry> {
    try {
      const key = this.getKey(date);
      const data = await AsyncStorage.getItem(key);

      if (!data) {
        return createEmptyEntry();
      }

      const parsed = yaml.load(data) as Record<string, unknown>;
      return parseYamlEntry(parsed);
    } catch (error) {
      console.error("Error loading entry:", error);
      return createEmptyEntry();
    }
  }

  static async saveEntry(date: Date, entry: JournalEntry): Promise<void> {
    try {
      const key = this.getKey(date);

      if (isEntryEmpty(entry)) {
        await AsyncStorage.removeItem(key);
      } else {
        const yamlData = entryToYaml(entry);
        const yamlString = yaml.dump(yamlData, {
          lineWidth: -1,
          quotingType: '"',
        });
        await AsyncStorage.setItem(key, yamlString);
      }

      await this.updateTagsIndex(entry.tags);
    } catch (error) {
      console.error("Error saving entry:", error);
      throw error;
    }
  }

  static async getAllEntryDates(): Promise<string[]> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const journalKeys = allKeys.filter((key) =>
        key.startsWith(JOURNAL_PREFIX)
      );

      return journalKeys.map((key) => {
        const path = key.replace(JOURNAL_PREFIX, "");
        const [year, month, day] = path.split("/");
        return `${year}-${month}-${day}`;
      });
    } catch (error) {
      console.error("Error getting all entry dates:", error);
      return [];
    }
  }

  static async getAllEntriesForMonth(
    year: number,
    month: number
  ): Promise<Map<number, JournalEntry>> {
    const entries = new Map<number, JournalEntry>();
    const monthStr = (month + 1).toString().padStart(2, "0");
    const prefix = `${JOURNAL_PREFIX}${year}/${monthStr}/`;

    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const monthKeys = allKeys.filter((key) => key.startsWith(prefix));

      for (const key of monthKeys) {
        const dayStr = key.replace(prefix, "").replace(".txt", "");
        const day = parseInt(dayStr, 10);

        if (!isNaN(day)) {
          const date = new Date(year, month, day);
          const entry = await this.loadEntry(date);
          if (!isEntryEmpty(entry)) {
            entries.set(day, entry);
          }
        }
      }
    } catch (error) {
      console.error("Error getting entries for month:", error);
    }

    return entries;
  }

  static async getAllTags(): Promise<Map<string, number>> {
    try {
      const tagsData = await AsyncStorage.getItem(TAGS_KEY);
      if (!tagsData) {
        return new Map();
      }
      const parsed = JSON.parse(tagsData) as Record<string, number>;
      return new Map(Object.entries(parsed));
    } catch (error) {
      console.error("Error getting all tags:", error);
      return new Map();
    }
  }

  private static async updateTagsIndex(tags: string[]): Promise<void> {
    try {
      const allEntryDates = await this.getAllEntryDates();
      const tagCounts = new Map<string, number>();

      for (const dateKey of allEntryDates) {
        const [year, month, day] = dateKey.split("-").map(Number);
        const date = new Date(year, month - 1, day);
        const entry = await this.loadEntry(date);

        for (const tag of entry.tags) {
          tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
        }
      }

      const tagsObject = Object.fromEntries(tagCounts);
      await AsyncStorage.setItem(TAGS_KEY, JSON.stringify(tagsObject));
    } catch (error) {
      console.error("Error updating tags index:", error);
    }
  }

  static async getEntriesWithTag(tag: string): Promise<{ date: Date; entry: JournalEntry }[]> {
    const results: { date: Date; entry: JournalEntry }[] = [];

    try {
      const allEntryDates = await this.getAllEntryDates();

      for (const dateKey of allEntryDates) {
        const [year, month, day] = dateKey.split("-").map(Number);
        const date = new Date(year, month - 1, day);
        const entry = await this.loadEntry(date);

        if (entry.tags.includes(tag)) {
          results.push({ date, entry });
        }
      }

      results.sort((a, b) => b.date.getTime() - a.date.getTime());
    } catch (error) {
      console.error("Error getting entries with tag:", error);
    }

    return results;
  }

  static async exportAllEntries(): Promise<
    { path: string; content: string }[]
  > {
    const entries: { path: string; content: string }[] = [];

    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const journalKeys = allKeys.filter((key) =>
        key.startsWith(JOURNAL_PREFIX)
      );

      for (const key of journalKeys) {
        const content = await AsyncStorage.getItem(key);
        if (content) {
          const path = key.replace(JOURNAL_PREFIX, "") + ".txt";
          entries.push({ path, content });
        }
      }
    } catch (error) {
      console.error("Error exporting entries:", error);
    }

    return entries;
  }

  static async importEntry(path: string, content: string): Promise<void> {
    const pathMatch = path.match(/(\d{4})\/(\d{2})\/(\d{2})\.txt$/);
    if (!pathMatch) {
      throw new Error(`Invalid path format: ${path}`);
    }

    const [, year, month, day] = pathMatch;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

    try {
      const parsed = yaml.load(content) as Record<string, unknown>;
      const entry = parseYamlEntry(parsed);
      await this.saveEntry(date, entry);
    } catch (error) {
      console.error("Error importing entry:", error);
      throw error;
    }
  }

  static async clearAllData(): Promise<void> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const journalKeys = allKeys.filter(
        (key) => key.startsWith(JOURNAL_PREFIX) || key === TAGS_KEY
      );
      await AsyncStorage.multiRemove(journalKeys);
    } catch (error) {
      console.error("Error clearing all data:", error);
      throw error;
    }
  }
}
