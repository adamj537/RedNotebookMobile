import React from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import { useSync } from "@/context/SyncContext";

interface SyncStatusIndicatorProps {
  size?: number;
}

export function SyncStatusIndicator({ size = 24 }: SyncStatusIndicatorProps) {
  const { theme } = useTheme();
  const { syncState } = useSync();

  const isConnected = syncState.isSignedInGoogle || syncState.isSignedInOneDrive;
  const hasError = syncState.syncError !== null;

  if (syncState.isSyncing) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color={theme.warning} />
      </View>
    );
  }

  let iconColor = theme.textDisabled;
  let badgeColor: string | null = null;

  if (hasError) {
    iconColor = theme.error;
    badgeColor = theme.error;
  } else if (isConnected && syncState.lastSyncTime) {
    iconColor = theme.success;
    badgeColor = theme.success;
  } else if (isConnected) {
    iconColor = theme.text;
  }

  return (
    <View style={styles.container}>
      <Feather name="cloud" size={size} color={iconColor} />
      {badgeColor && (
        <View style={[styles.badge, { backgroundColor: badgeColor }]} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
