import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface TagListItemProps {
  tag: string;
  count: number;
  onPress: () => void;
  isLast?: boolean;
}

export function TagListItem({ tag, count, onPress, isLast = false }: TagListItemProps) {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: theme.backgroundDefault,
          opacity: pressed ? 0.8 : 1,
        },
        !isLast && { borderBottomWidth: 1, borderBottomColor: theme.border },
      ]}
    >
      <View style={styles.leftContent}>
        <View style={[styles.tagIcon, { backgroundColor: `${theme.accent}33` }]}>
          <Feather name="tag" size={16} color={theme.accent} />
        </View>
        <ThemedText type="body" style={styles.tagName}>
          {tag}
        </ThemedText>
      </View>
      <View style={styles.rightContent}>
        <View style={[styles.countBadge, { backgroundColor: theme.backgroundSecondary }]}>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {count}
          </ThemedText>
        </View>
        <Feather name="chevron-right" size={20} color={theme.textSecondary} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  tagIcon: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  tagName: {
    fontWeight: "500",
  },
  rightContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  countBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    minWidth: 28,
    alignItems: "center",
  },
});
