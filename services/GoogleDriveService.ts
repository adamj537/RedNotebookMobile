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
    throw new Error("Google Drive integration not available");
  }

  const response = await fetch(
    "https://" +
      hostname +
      "/api/v2/connection?include_secrets=true&connector_names=google-drive",
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
    throw new Error("Google Drive not connected");
  }
  return accessToken;
}

export class GoogleDriveService {
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
      const response = await fetch(
        "https://www.googleapis.com/drive/v3/about?fields=user",
        { headers }
      );

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return {
        email: data.user?.emailAddress || "",
        name: data.user?.displayName || "",
      };
    } catch {
      return null;
    }
  }

  private static async findOrCreateFolder(
    name: string,
    parentId?: string
  ): Promise<string> {
    const headers = await this.getHeaders();

    let query = `name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
    if (parentId) {
      query += ` and '${parentId}' in parents`;
    }

    const searchResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name)`,
      { headers }
    );

    const searchData = await searchResponse.json();

    if (searchData.files && searchData.files.length > 0) {
      return searchData.files[0].id;
    }

    const metadata: Record<string, unknown> = {
      name,
      mimeType: "application/vnd.google-apps.folder",
    };

    if (parentId) {
      metadata.parents = [parentId];
    }

    const createResponse = await fetch(
      "https://www.googleapis.com/drive/v3/files",
      {
        method: "POST",
        headers,
        body: JSON.stringify(metadata),
      }
    );

    const createData = await createResponse.json();
    return createData.id;
  }

  private static async ensureJournalFolder(): Promise<string> {
    const parts = JOURNAL_FOLDER.split("/");
    let parentId: string | undefined;

    for (const part of parts) {
      parentId = await this.findOrCreateFolder(part, parentId);
    }

    return parentId!;
  }

  static async uploadFile(
    path: string,
    content: string
  ): Promise<void> {
    const headers = await this.getHeaders();
    const rootFolderId = await this.ensureJournalFolder();

    const pathParts = path.split("/");
    const fileName = pathParts.pop();
    let parentId = rootFolderId;

    for (const folder of pathParts) {
      parentId = await this.findOrCreateFolder(folder, parentId);
    }

    const query = `name='${fileName}' and '${parentId}' in parents and trashed=false`;
    const searchResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id)`,
      { headers }
    );

    const searchData = await searchResponse.json();
    const existingFileId = searchData.files?.[0]?.id;

    const boundary = "-------314159265358979323846";
    const delimiter = "\r\n--" + boundary + "\r\n";
    const closeDelimiter = "\r\n--" + boundary + "--";

    const metadata = existingFileId
      ? {}
      : { name: fileName, parents: [parentId] };

    const multipartBody =
      delimiter +
      "Content-Type: application/json\r\n\r\n" +
      JSON.stringify(metadata) +
      delimiter +
      "Content-Type: text/plain\r\n\r\n" +
      content +
      closeDelimiter;

    const uploadHeaders = await this.getHeaders();
    uploadHeaders.set("Content-Type", `multipart/related; boundary="${boundary}"`);

    const url = existingFileId
      ? `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=multipart`
      : "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart";

    const method = existingFileId ? "PATCH" : "POST";

    await fetch(url, {
      method,
      headers: uploadHeaders,
      body: multipartBody,
    });
  }

  static async downloadFile(fileId: string): Promise<string> {
    const headers = await this.getHeaders();
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      { headers }
    );

    return await response.text();
  }

  static async listJournalFiles(): Promise<
    { id: string; name: string; path: string }[]
  > {
    const headers = await this.getHeaders();
    const files: { id: string; name: string; path: string }[] = [];

    try {
      const rootFolderId = await this.ensureJournalFolder();

      const listFolder = async (
        folderId: string,
        currentPath: string
      ): Promise<void> => {
        const query = `'${folderId}' in parents and trashed=false`;
        const response = await fetch(
          `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType)`,
          { headers }
        );

        const data = await response.json();

        for (const file of data.files || []) {
          const filePath = currentPath ? `${currentPath}/${file.name}` : file.name;

          if (file.mimeType === "application/vnd.google-apps.folder") {
            await listFolder(file.id, filePath);
          } else if (file.name.endsWith(".txt")) {
            files.push({ id: file.id, name: file.name, path: filePath });
          }
        }
      };

      await listFolder(rootFolderId, "");
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
      const content = await this.downloadFile(file.id);
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
