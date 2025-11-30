import React, { ReactNode } from "react";
import { View, StyleSheet, Pressable, Switch } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";

interface SettingsRowProps {
  label: string;
  value?: string;
  onPress?: () => void;
  leftIcon?: keyof typeof Feather.glyphMap;
  showChevron?: boolean;
  isLast?: boolean;
  toggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (value: boolean) => void;
  children?: ReactNode;
}

export function SettingsRow({
  label,
  value,
  onPress,
  leftIcon,
  showChevron = false,
  isLast = false,
  toggle = false,
  toggleValue = false,
  onToggle,
  children,
}: SettingsRowProps) {
  const { theme } = useTheme();

  const content = (
    <View
      style={[
        styles.container,
        !isLast && { borderBottomWidth: 1, borderBottomColor: theme.border },
      ]}
    >
      <View style={styles.leftContent}>
        {leftIcon && (
          <Feather
            name={leftIcon}
            size={20}
            color={theme.text}
            style={styles.leftIcon}
          />
        )}
        <ThemedText type="body">{label}</ThemedText>
      </View>
      <View style={styles.rightContent}>
        {children}
        {value && (
          <ThemedText
            type="body"
            style={[styles.value, { color: theme.textSecondary }]}
          >
            {value}
          </ThemedText>
        )}
        {toggle && (
          <Switch
            value={toggleValue}
            onValueChange={onToggle}
            trackColor={{ false: theme.border, true: theme.primary }}
          />
        )}
        {showChevron && (
          <Feather
            name="chevron-right"
            size={20}
            color={theme.textSecondary}
          />
        )}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    minHeight: 52,
  },
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  leftIcon: {
    marginRight: Spacing.md,
  },
  rightContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  value: {
    marginRight: Spacing.xs,
  },
});
