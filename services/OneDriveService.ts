import { LocalStorageService } from "./LocalStorageService";

const JOURNAL_FOLDER = "RedNotebookMobile/Journal";

interface ConnectionSettings {
  settings: {
    access_token?: string;
    expires_at?: string;
    oauth?: {
      credentials?: {
        access_token?: string;
      };
    };
  };
}

let connectionSettings: ConnectionSettings | null = null;

async function getAccessToken(): Promise<string> {
  if (
    connectionSettings &&
    connectionSettings.settings.expires_at &&
    new Date(connectionSettings.settings.expires_at).getTime() > Date.now()
  ) {
    return connectionSettings.settings.access_token || "";
  }

  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? "repl " + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
      ? "depl " + process.env.WEB_REPL_RENEWAL
      : null;

  if (!xReplitToken || !hostname) {
    throw new Error("OneDrive integration not available");
  }

  const response = await fetch(
    "https://" +
      hostname +
      "/api/v2/connection?include_secrets=true&connector_names=onedrive",
    {
      headers: {
        Accept: "application/json",
        X_REPLIT_TOKEN: xReplitToken,
      },
    }
  );

  const data = await response.json();
  connectionSettings = data.items?.[0] as ConnectionSettings;

  const accessToken =
    connectionSettings?.settings?.access_token ||
    connectionSettings?.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error("OneDrive not connected");
  }
  return accessToken;
}

export class OneDriveService {
  private static async getHeaders(): Promise<Headers> {
    const token = await getAccessToken();
    return new Headers({
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    });
  }

  static async isConnected(): Promise<boolean> {
    try {
      await getAccessToken();
      return true;
    } catch {
      return false;
    }
  }

  static async getUserInfo(): Promise<{ email: string; name: string } | null> {
    try {
      const headers = await this.getHeaders();
      const response = await fetch("https://graph.microsoft.com/v1.0/me", {
        headers,
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return {
        email: data.mail || data.userPrincipalName || "",
        name: data.displayName || "",
      };
    } catch {
      return null;
    }
  }

  static async uploadFile(path: string, content: string): Promise<void> {
    const headers = await this.getHeaders();
    headers.set("Content-Type", "text/plain");

    const fullPath = `${JOURNAL_FOLDER}/${path}`;
    const encodedPath = encodeURIComponent(fullPath).replace(/%2F/g, "/");

    await fetch(
      `https://graph.microsoft.com/v1.0/me/drive/root:/${encodedPath}:/content`,
      {
        method: "PUT",
        headers,
        body: content,
      }
    );
  }

  static async downloadFile(path: string): Promise<string> {
    const headers = await this.getHeaders();

    const fullPath = `${JOURNAL_FOLDER}/${path}`;
    const encodedPath = encodeURIComponent(fullPath).replace(/%2F/g, "/");

    const response = await fetch(
      `https://graph.microsoft.com/v1.0/me/drive/root:/${encodedPath}:/content`,
      { headers }
    );

    if (!response.ok) {
      throw new Error(`Failed to download file: ${path}`);
    }

    return await response.text();
  }

  static async listJournalFiles(): Promise<{ name: string; path: string }[]> {
    const files: { name: string; path: string }[] = [];

    try {
      const headers = await this.getHeaders();

      const listFolder = async (folderPath: string): Promise<void> => {
        const encodedPath = encodeURIComponent(folderPath).replace(/%2F/g, "/");
        const url =
          folderPath === JOURNAL_FOLDER
            ? `https://graph.microsoft.com/v1.0/me/drive/root:/${encodedPath}:/children`
            : `https://graph.microsoft.com/v1.0/me/drive/root:/${encodedPath}:/children`;

        const response = await fetch(url, { headers });

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        for (const item of data.value || []) {
          const itemPath = `${folderPath}/${item.name}`;

          if (item.folder) {
            await listFolder(itemPath);
          } else if (item.name.endsWith(".txt")) {
            const relativePath = itemPath.replace(`${JOURNAL_FOLDER}/`, "");
            files.push({ name: item.name, path: relativePath });
          }
        }
      };

      await listFolder(JOURNAL_FOLDER);
    } catch (error) {
      console.error("Error listing journal files:", error);
    }

    return files;
  }

  static async syncToCloud(): Promise<number> {
    const entries = await LocalStorageService.exportAllEntries();
    let syncCount = 0;

    for (const entry of entries) {
      await this.uploadFile(entry.path, entry.content);
      syncCount++;
    }

    return syncCount;
  }

  static async syncFromCloud(): Promise<number> {
    const files = await this.listJournalFiles();
    let syncCount = 0;

    for (const file of files) {
      const content = await this.downloadFile(file.path);
      await LocalStorageService.importEntry(file.path, content);
      syncCount++;
    }

    return syncCount;
  }

  static async fullSync(): Promise<{ uploaded: number; downloaded: number }> {
    const uploaded = await this.syncToCloud();
    const downloaded = await this.syncFromCloud();
    return { uploaded, downloaded };
  }
}
