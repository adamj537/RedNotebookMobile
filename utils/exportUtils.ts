import { LocalStorageService } from "@/services/LocalStorageService";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";

export interface ExportOptions {
  format: "json" | "csv" | "yaml";
  dateRange?: { start: Date; end: Date };
}

export async function exportJournal(options: ExportOptions): Promise<string> {
  const entries = await LocalStorageService.exportAllEntries();
  let content = "";

  switch (options.format) {
    case "json":
      content = exportAsJSON(entries);
      break;
    case "csv":
      content = exportAsCSV(entries);
      break;
    case "yaml":
      content = exportAsYAML(entries);
      break;
  }

  return content;
}

function exportAsJSON(
  entries: { path: string; content: string }[]
): string {
  const data = entries.map((entry) => {
    const pathMatch = entry.path.match(/(\d{4})\/(\d{2})\/(\d{2})\.txt/);
    const [, year, month, day] = pathMatch || ["", "", "", ""];
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

    try {
      const parsed = JSON.parse(entry.content);
      return {
        date: date.toISOString(),
        ...parsed,
      };
    } catch {
      return {
        date: date.toISOString(),
        text: entry.content,
        tags: [],
      };
    }
  });

  return JSON.stringify(data, null, 2);
}

function exportAsCSV(entries: { path: string; content: string }[]): string {
  const rows: string[] = ['"Date","Text Preview","Tags"'];

  for (const entry of entries) {
    const pathMatch = entry.path.match(/(\d{4})\/(\d{2})\/(\d{2})\.txt/);
    if (!pathMatch) continue;

    const [, year, month, day] = pathMatch;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

    try {
      const parsed = JSON.parse(entry.content);
      const text = (parsed.text || "").substring(0, 100).replace(/"/g, '""');
      const tags = (parsed.tags || []).join(";");
      rows.push(`"${date.toISOString()}","${text}","${tags}"`);
    } catch {
      const text = entry.content.substring(0, 100).replace(/"/g, '""');
      rows.push(`"${date.toISOString()}","${text}",""`);
    }
  }

  return rows.join("\n");
}

function exportAsYAML(entries: { path: string; content: string }[]): string {
  const lines: string[] = ["# RedNotebook Journal Export"];
  lines.push(`# Exported: ${new Date().toISOString()}`);
  lines.push("");

  for (const entry of entries) {
    const pathMatch = entry.path.match(/(\d{4})\/(\d{2})\/(\d{2})\.txt/);
    if (!pathMatch) continue;

    const [, year, month, day] = pathMatch;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

    lines.push(`- date: ${date.toISOString().split("T")[0]}`);
    lines.push(`  content: |`);

    for (const contentLine of entry.content.split("\n")) {
      lines.push(`    ${contentLine}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

export async function shareExport(
  content: string,
  format: string
): Promise<void> {
  try {
    const fileName = `journal-export-${new Date().getTime()}.${format}`;
    const filePath = FileSystem.documentDirectory + fileName;

    if (Platform.OS === "web") {
      // For web, create a download link
      const element = document.createElement("a");
      const file = new Blob([content], { type: "text/plain" });
      element.href = URL.createObjectURL(file);
      element.download = fileName;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } else {
      await FileSystem.writeAsStringAsync(filePath, content);
      await Sharing.shareAsync(filePath, {
        mimeType: getMimeType(format),
        dialogTitle: "Export Journal",
      });
    }
  } catch (error) {
    console.error("Error sharing export:", error);
    throw error;
  }
}

function getMimeType(format: string): string {
  switch (format) {
    case "json":
      return "application/json";
    case "csv":
      return "text/csv";
    case "yaml":
      return "text/yaml";
    default:
      return "text/plain";
  }
}
