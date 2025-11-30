import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, TextInput, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { TagChip } from "@/components/TagChip";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { JournalEntry } from "@/models/JournalEntry";

interface EntryEditorProps {
  entry: JournalEntry;
  onSave: (entry: JournalEntry) => void;
  autoFocus?: boolean;
}

export function EntryEditor({ entry, onSave, autoFocus = false }: EntryEditorProps) {
  const { theme } = useTheme();
  const [text, setText] = useState(entry.text);
  const [tags, setTags] = useState<string[]>(entry.tags);
  const [newTag, setNewTag] = useState("");
  const textInputRef = useRef<TextInput>(null);

  useEffect(() => {
    setText(entry.text);
    setTags(entry.tags);
  }, [entry]);

  useEffect(() => {
    if (autoFocus && textInputRef.current) {
      setTimeout(() => {
        textInputRef.current?.focus();
      }, 100);
    }
  }, [autoFocus]);

  const handleTextChange = (newText: string) => {
    setText(newText);
    onSave({ text: newText, tags });
  };

  const handleAddTag = () => {
    const trimmedTag = newTag.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      const newTags = [...tags, trimmedTag];
      setTags(newTags);
      setNewTag("");
      onSave({ text, tags: newTags });
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = tags.filter((t) => t !== tagToRemove);
    setTags(newTags);
    onSave({ text, tags: newTags });
  };

  const wordCount = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.textInputContainer,
          {
            backgroundColor: theme.backgroundDefault,
            borderColor: theme.border,
          },
        ]}
      >
        <TextInput
          ref={textInputRef}
          style={[
            styles.textInput,
            { color: theme.text },
          ]}
          value={text}
          onChangeText={handleTextChange}
          placeholder="Write your thoughts..."
          placeholderTextColor={theme.textDisabled}
          multiline
          textAlignVertical="top"
        />
        <View style={styles.wordCountContainer}>
          <ThemedText
            type="small"
            style={[styles.wordCount, { color: theme.textSecondary }]}
          >
            {wordCount} {wordCount === 1 ? "word" : "words"}
          </ThemedText>
        </View>
      </View>

      <View style={styles.tagsSection}>
        <ThemedText type="h4" style={styles.tagsSectionTitle}>
          Tags
        </ThemedText>

        {tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {tags.map((tag) => (
              <TagChip
                key={tag}
                tag={tag}
                onRemove={() => handleRemoveTag(tag)}
              />
            ))}
          </View>
        )}

        <View
          style={[
            styles.addTagContainer,
            {
              backgroundColor: theme.backgroundDefault,
              borderColor: theme.border,
            },
          ]}
        >
          <TextInput
            style={[styles.tagInput, { color: theme.text }]}
            value={newTag}
            onChangeText={setNewTag}
            placeholder="Add a tag..."
            placeholderTextColor={theme.textDisabled}
            onSubmitEditing={handleAddTag}
            returnKeyType="done"
          />
          <Pressable
            onPress={handleAddTag}
            disabled={!newTag.trim()}
            style={({ pressed }) => [
              styles.addTagButton,
              { opacity: newTag.trim() ? (pressed ? 0.6 : 1) : 0.3 },
            ]}
          >
            <Feather name="plus" size={20} color={theme.primary} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: Spacing.xl,
  },
  textInputContainer: {
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    minHeight: 200,
  },
  textInput: {
    flex: 1,
    padding: Spacing.md,
    fontSize: 16,
    minHeight: 180,
  },
  wordCountContainer: {
    padding: Spacing.md,
    paddingTop: 0,
    alignItems: "flex-end",
  },
  wordCount: {
    opacity: 0.7,
  },
  tagsSection: {
    gap: Spacing.md,
  },
  tagsSectionTitle: {
    marginBottom: Spacing.xs,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  addTagContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    paddingRight: Spacing.sm,
  },
  tagInput: {
    flex: 1,
    padding: Spacing.md,
    fontSize: 16,
  },
  addTagButton: {
    padding: Spacing.sm,
  },
});
