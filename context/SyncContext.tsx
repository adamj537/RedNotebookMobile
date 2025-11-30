import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SyncState, createInitialSyncState } from "@/models/SyncState";
import { GoogleDriveService } from "@/services/GoogleDriveService";
import { OneDriveService } from "@/services/OneDriveService";

const LAST_SYNC_KEY = "lastSyncTime";

interface SyncContextType {
  syncState: SyncState;
  googleUserInfo: { email: string; name: string } | null;
  oneDriveUserInfo: { email: string; name: string } | null;
  checkConnectionStatus: () => Promise<void>;
  syncWithGoogle: () => Promise<{ uploaded: number; downloaded: number }>;
  syncWithOneDrive: () => Promise<{ uploaded: number; downloaded: number }>;
  syncAll: () => Promise<void>;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export function SyncProvider({ children }: { children: ReactNode }) {
  const [syncState, setSyncState] = useState<SyncState>(createInitialSyncState());
  const [googleUserInfo, setGoogleUserInfo] = useState<{
    email: string;
    name: string;
  } | null>(null);
  const [oneDriveUserInfo, setOneDriveUserInfo] = useState<{
    email: string;
    name: string;
  } | null>(null);

  const checkConnectionStatus = useCallback(async () => {
    try {
      const [isGoogleConnected, isOneDriveConnected] = await Promise.all([
        GoogleDriveService.isConnected(),
        OneDriveService.isConnected(),
      ]);

      setSyncState((prev) => ({
        ...prev,
        isSignedInGoogle: isGoogleConnected,
        isSignedInOneDrive: isOneDriveConnected,
      }));

      if (isGoogleConnected) {
        const userInfo = await GoogleDriveService.getUserInfo();
        setGoogleUserInfo(userInfo);
      } else {
        setGoogleUserInfo(null);
      }

      if (isOneDriveConnected) {
        const userInfo = await OneDriveService.getUserInfo();
        setOneDriveUserInfo(userInfo);
      } else {
        setOneDriveUserInfo(null);
      }

      const lastSync = await AsyncStorage.getItem(LAST_SYNC_KEY);
      if (lastSync) {
        setSyncState((prev) => ({
          ...prev,
          lastSyncTime: lastSync,
        }));
      }
    } catch (error) {
      console.error("Error checking connection status:", error);
    }
  }, []);

  const syncWithGoogle = useCallback(async () => {
    setSyncState((prev) => ({
      ...prev,
      isSyncing: true,
      syncError: null,
    }));

    try {
      const result = await GoogleDriveService.fullSync();
      const now = new Date().toISOString();
      await AsyncStorage.setItem(LAST_SYNC_KEY, now);

      setSyncState((prev) => ({
        ...prev,
        isSyncing: false,
        lastSyncTime: now,
      }));

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Sync failed";
      setSyncState((prev) => ({
        ...prev,
        isSyncing: false,
        syncError: errorMessage,
      }));
      throw error;
    }
  }, []);

  const syncWithOneDrive = useCallback(async () => {
    setSyncState((prev) => ({
      ...prev,
      isSyncing: true,
      syncError: null,
    }));

    try {
      const result = await OneDriveService.fullSync();
      const now = new Date().toISOString();
      await AsyncStorage.setItem(LAST_SYNC_KEY, now);

      setSyncState((prev) => ({
        ...prev,
        isSyncing: false,
        lastSyncTime: now,
      }));

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Sync failed";
      setSyncState((prev) => ({
        ...prev,
        isSyncing: false,
        syncError: errorMessage,
      }));
      throw error;
    }
  }, []);

  const syncAll = useCallback(async () => {
    setSyncState((prev) => ({
      ...prev,
      isSyncing: true,
      syncError: null,
    }));

    try {
      const promises: Promise<unknown>[] = [];

      if (syncState.isSignedInGoogle) {
        promises.push(GoogleDriveService.fullSync());
      }

      if (syncState.isSignedInOneDrive) {
        promises.push(OneDriveService.fullSync());
      }

      await Promise.all(promises);

      const now = new Date().toISOString();
      await AsyncStorage.setItem(LAST_SYNC_KEY, now);

      setSyncState((prev) => ({
        ...prev,
        isSyncing: false,
        lastSyncTime: now,
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Sync failed";
      setSyncState((prev) => ({
        ...prev,
        isSyncing: false,
        syncError: errorMessage,
      }));
      throw error;
    }
  }, [syncState.isSignedInGoogle, syncState.isSignedInOneDrive]);

  useEffect(() => {
    checkConnectionStatus();
  }, [checkConnectionStatus]);

  return (
    <SyncContext.Provider
      value={{
        syncState,
        googleUserInfo,
        oneDriveUserInfo,
        checkConnectionStatus,
        syncWithGoogle,
        syncWithOneDrive,
        syncAll,
      }}
    >
      {children}
    </SyncContext.Provider>
  );
}

export function useSync() {
  const context = useContext(SyncContext);
  if (context === undefined) {
    throw new Error("useSync must be used within a SyncProvider");
  }
  return context;
}
