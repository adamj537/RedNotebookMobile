import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface TagChipProps {
  tag: string;
  onRemove?: () => void;
  onPress?: () => void;
  count?: number;
}

export function TagChip({ tag, onRemove, onPress, count }: TagChipProps) {
  const { theme } = useTheme();

  const content = (
    <View
      style={[
        styles.container,
        { backgroundColor: `${theme.accent}33` },
      ]}
    >
      <ThemedText type="small" style={[styles.text, { color: theme.accent }]}>
        {tag}
      </ThemedText>
      {count !== undefined && (
        <ThemedText type="small" style={[styles.count, { color: theme.accent }]}>
          {count}
        </ThemedText>
      )}
      {onRemove && (
        <Pressable
          onPress={onRemove}
          style={({ pressed }) => [
            styles.removeButton,
            { opacity: pressed ? 0.6 : 1 },
          ]}
          hitSlop={8}
        >
          <Feather name="x" size={14} color={theme.accent} />
        </Pressable>
      )}
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
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  text: {
    fontWeight: "500",
  },
  count: {
    fontWeight: "400",
    opacity: 0.8,
  },
  removeButton: {
    marginLeft: Spacing.xs,
  },
});
