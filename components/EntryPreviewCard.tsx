import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { TagChip } from "@/components/TagChip";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { JournalEntry } from "@/models/JournalEntry";
import { formatDisplayDate } from "@/utils/dateUtils";

interface EntryPreviewCardProps {
  date: Date;
  entry: JournalEntry;
  onEdit: () => void;
}

export function EntryPreviewCard({ date, entry, onEdit }: EntryPreviewCardProps) {
  const { theme } = useTheme();
  const hasContent = entry.text.trim() !== "" || entry.tags.length > 0;
  const previewText = entry.text.substring(0, 150);
  const showEllipsis = entry.text.length > 150;

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundDefault }]}>
      <View style={styles.header}>
        <ThemedText type="h4">{formatDisplayDate(date)}</ThemedText>
        <Pressable
          onPress={onEdit}
          style={({ pressed }) => [
            styles.editButton,
            { opacity: pressed ? 0.6 : 1 },
          ]}
        >
          <ThemedText type="body" style={{ color: theme.primary }}>
            {hasContent ? "Edit" : "Write"}
          </ThemedText>
        </Pressable>
      </View>

      {hasContent ? (
        <>
          {entry.text.trim() !== "" && (
            <View style={styles.textContainer}>
              <ThemedText type="body" numberOfLines={3} style={styles.previewText}>
                {previewText}
                {showEllipsis && "..."}
              </ThemedText>
            </View>
          )}

          {entry.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {entry.tags.map((tag) => (
                <TagChip key={tag} tag={tag} />
              ))}
            </View>
          )}
        </>
      ) : (
        <View style={styles.emptyState}>
          <Feather name="file-text" size={32} color={theme.textDisabled} />
          <ThemedText
            type="body"
            style={[styles.emptyText, { color: theme.textSecondary }]}
          >
            No entry for this date. Tap Edit to start writing.
          </ThemedText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  editButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  textContainer: {
    marginBottom: Spacing.md,
  },
  previewText: {
    lineHeight: 24,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
    gap: Spacing.md,
  },
  emptyText: {
    textAlign: "center",
  },
});
