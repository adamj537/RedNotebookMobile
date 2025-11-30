export interface SyncState {
  isSignedInGoogle: boolean;
  isSignedInOneDrive: boolean;
  isSyncing: boolean;
  lastSyncTime: string | null;
  syncError: string | null;
}

export function createInitialSyncState(): SyncState {
  return {
    isSignedInGoogle: false,
    isSignedInOneDrive: false,
    isSyncing: false,
    lastSyncTime: null,
    syncError: null,
  };
}
