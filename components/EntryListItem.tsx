import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { TagChip } from "@/components/TagChip";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { JournalEntry } from "@/models/JournalEntry";
import { formatDisplayDate } from "@/utils/dateUtils";

interface EntryListItemProps {
  date: Date;
  entry: JournalEntry;
  onPress: () => void;
  isLast?: boolean;
}

export function EntryListItem({
  date,
  entry,
  onPress,
  isLast = false,
}: EntryListItemProps) {
  const { theme } = useTheme();
  const previewText = entry.text.substring(0, 100);
  const showEllipsis = entry.text.length > 100;

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
      <View style={styles.header}>
        <ThemedText type="h4">{formatDisplayDate(date)}</ThemedText>
        <Feather name="chevron-right" size={20} color={theme.textSecondary} />
      </View>

      {entry.text.trim() !== "" && (
        <ThemedText
          type="body"
          numberOfLines={2}
          style={[styles.preview, { color: theme.textSecondary }]}
        >
          {previewText}
          {showEllipsis && "..."}
        </ThemedText>
      )}

      {entry.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {entry.tags.slice(0, 3).map((tag) => (
            <TagChip key={tag} tag={tag} />
          ))}
          {entry.tags.length > 3 && (
            <ThemedText
              type="small"
              style={{ color: theme.textSecondary }}
            >
              +{entry.tags.length - 3} more
            </ThemedText>
          )}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  preview: {
    marginBottom: Spacing.sm,
    lineHeight: 22,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    alignItems: "center",
  },
});
