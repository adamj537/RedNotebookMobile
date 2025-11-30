import React, { useState, useCallback, useEffect } from "react";
import { View, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { SettingsSection } from "@/components/SettingsSection";
import { SettingsRow } from "@/components/SettingsRow";
import { Button } from "@/components/Button";
import { ThemedText } from "@/components/ThemedText";
import { useSync } from "@/context/SyncContext";
import { useJournal } from "@/context/JournalContext";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

const AUTO_SYNC_KEY = "autoSyncEnabled";

export default function SettingsScreen() {
  const { theme } = useTheme();
  const {
    syncState,
    googleUserInfo,
    oneDriveUserInfo,
    checkConnectionStatus,
    syncAll,
  } = useSync();
  const { refreshEntryDates, refreshTags } = useJournal();

  const [autoSync, setAutoSync] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  useFocusEffect(
    useCallback(() => {
      checkStatus();
      loadAutoSyncSetting();
    }, [])
  );

  const checkStatus = async () => {
    setIsCheckingStatus(true);
    await checkConnectionStatus();
    setIsCheckingStatus(false);
  };

  const loadAutoSyncSetting = async () => {
    try {
      const value = await AsyncStorage.getItem(AUTO_SYNC_KEY);
      setAutoSync(value === "true");
    } catch (error) {
      console.error("Error loading auto sync setting:", error);
    }
  };

  const handleAutoSyncToggle = async (value: boolean) => {
    setAutoSync(value);
    try {
      await AsyncStorage.setItem(AUTO_SYNC_KEY, value.toString());
    } catch (error) {
      console.error("Error saving auto sync setting:", error);
    }
  };

  const handleSyncNow = async () => {
    if (!syncState.isSignedInGoogle && !syncState.isSignedInOneDrive) {
      Alert.alert(
        "Not Connected",
        "Please connect to Google Drive or OneDrive first to sync your journal."
      );
      return;
    }

    try {
      await syncAll();
      await refreshEntryDates();
      await refreshTags();
      Alert.alert("Sync Complete", "Your journal has been synced successfully.");
    } catch (error) {
      Alert.alert(
        "Sync Failed",
        "There was an error syncing your journal. Please try again."
      );
    }
  };

  const formatLastSyncTime = (isoString: string | null): string => {
    if (!isoString) return "Never";
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  const getConnectionStatus = (
    isConnected: boolean,
    userInfo: { email: string; name: string } | null
  ): string => {
    if (isCheckingStatus) return "Checking...";
    if (!isConnected) return "Not connected";
    if (userInfo?.email) return userInfo.email;
    if (userInfo?.name) return userInfo.name;
    return "Connected";
  };

  return (
    <ScreenScrollView>
      <SettingsSection title="Cloud Sync">
        <SettingsRow
          label="Google Drive"
          leftIcon="hard-drive"
          value={getConnectionStatus(syncState.isSignedInGoogle, googleUserInfo)}
        >
          {syncState.isSignedInGoogle && (
            <Feather name="check-circle" size={18} color={theme.success} />
          )}
        </SettingsRow>
        <SettingsRow
          label="OneDrive"
          leftIcon="cloud"
          value={getConnectionStatus(syncState.isSignedInOneDrive, oneDriveUserInfo)}
          isLast
        >
          {syncState.isSignedInOneDrive && (
            <Feather name="check-circle" size={18} color={theme.success} />
          )}
        </SettingsRow>
      </SettingsSection>

      <View style={styles.syncButtonContainer}>
        <Button
          onPress={handleSyncNow}
          disabled={
            syncState.isSyncing ||
            (!syncState.isSignedInGoogle && !syncState.isSignedInOneDrive)
          }
        >
          {syncState.isSyncing ? (
            <View style={styles.syncingContent}>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <ThemedText style={styles.syncingText}>Syncing...</ThemedText>
            </View>
          ) : (
            "Sync Now"
          )}
        </Button>
      </View>

      <View style={styles.lastSyncContainer}>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          Last synced: {formatLastSyncTime(syncState.lastSyncTime)}
        </ThemedText>
      </View>

      <SettingsSection title="Preferences">
        <SettingsRow
          label="Auto-sync"
          leftIcon="refresh-cw"
          toggle
          toggleValue={autoSync}
          onToggle={handleAutoSyncToggle}
          isLast
        />
      </SettingsSection>

      <SettingsSection title="About">
        <SettingsRow label="Version" value="1.0.0" leftIcon="info" />
        <SettingsRow
          label="RedNotebook Compatibility"
          value="1.x - 2.x"
          leftIcon="file-text"
        />
        <SettingsRow
          label="Data Format"
          value="YAML (RedNotebook)"
          leftIcon="database"
          isLast
        />
      </SettingsSection>

      {syncState.syncError && (
        <View
          style={[styles.errorContainer, { backgroundColor: `${theme.error}15` }]}
        >
          <Feather name="alert-circle" size={20} color={theme.error} />
          <ThemedText
            type="small"
            style={[styles.errorText, { color: theme.error }]}
          >
            {syncState.syncError}
          </ThemedText>
        </View>
      )}
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  syncButtonContainer: {
    marginBottom: Spacing.md,
  },
  lastSyncContainer: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  syncingContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  syncingText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  errorText: {
    flex: 1,
  },
});
