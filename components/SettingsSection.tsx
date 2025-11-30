import React, { ReactNode } from "react";
import { View, StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface SettingsSectionProps {
  title: string;
  children: ReactNode;
}

export function SettingsSection({ title, children }: SettingsSectionProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <ThemedText
        type="small"
        style={[styles.title, { color: theme.textSecondary }]}
      >
        {title.toUpperCase()}
      </ThemedText>
      <View
        style={[
          styles.content,
          { backgroundColor: theme.backgroundDefault },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.xl,
  },
  title: {
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  content: {
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
  },
});
