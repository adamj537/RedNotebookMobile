import React, { useState, useEffect, useCallback, useRef } from "react";
import { View, StyleSheet, Alert, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { ScreenKeyboardAwareScrollView } from "@/components/ScreenKeyboardAwareScrollView";
import { EntryEditor } from "@/components/EntryEditor";
import { ThemedText } from "@/components/ThemedText";
import { useJournal } from "@/context/JournalContext";
import { useTheme } from "@/hooks/useTheme";
import { LocalStorageService } from "@/services/LocalStorageService";
import { Spacing } from "@/constants/theme";
import { JournalEntry, createEmptyEntry } from "@/models/JournalEntry";

export default function TodayScreen({ navigation }: { navigation: any }) {
  const { theme } = useTheme();
  const { saveEntry, isSaving, refreshEntryDates, refreshTags } = useJournal();

  const [todayEntry, setTodayEntry] = useState<JournalEntry>(createEmptyEntry());
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const originalEntryRef = useRef<JournalEntry>(createEmptyEntry());
  const today = useRef(new Date()).current;

  const loadTodayEntry = useCallback(async () => {
    setIsLoading(true);
    try {
      const entry = await LocalStorageService.loadEntry(today);
      setTodayEntry(entry);
      originalEntryRef.current = entry;
      setHasChanges(false);
    } catch (error) {
      console.error("Error loading today's entry:", error);
    } finally {
      setIsLoading(false);
    }
  }, [today]);

  useFocusEffect(
    useCallback(() => {
      loadTodayEntry();
    }, [loadTodayEntry])
  );

  const handleSave = useCallback(async () => {
    try {
      await saveEntry(today, todayEntry);
      originalEntryRef.current = todayEntry;
      setHasChanges(false);
      await refreshEntryDates();
      await refreshTags();
      Alert.alert("Saved", "Your entry has been saved.");
    } catch (error) {
      Alert.alert("Error", "Failed to save entry. Please try again.");
    }
  }, [saveEntry, todayEntry, refreshEntryDates, refreshTags, today]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        hasChanges ? (
          <Pressable
            onPress={handleSave}
            disabled={isSaving}
            style={({ pressed }) => [
              { opacity: pressed || isSaving ? 0.6 : 1, paddingHorizontal: Spacing.md },
            ]}
          >
            <Feather
              name={isSaving ? "loader" : "check"}
              size={24}
              color={theme.primary}
            />
          </Pressable>
        ) : null,
    });
  }, [hasChanges, isSaving, navigation, theme.primary, handleSave]);

  const handleEntryChange = useCallback((newEntry: JournalEntry) => {
    setTodayEntry(newEntry);
    const changed =
      newEntry.text !== originalEntryRef.current.text ||
      JSON.stringify(newEntry.tags) !== JSON.stringify(originalEntryRef.current.tags);
    setHasChanges(changed);
  }, []);

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.backgroundRoot }]}>
        <Feather name="loader" size={32} color={theme.textDisabled} />
      </View>
    );
  }

  return (
    <ScreenKeyboardAwareScrollView>
      <EntryEditor
        entry={todayEntry}
        onSave={handleEntryChange}
        autoFocus={false}
      />
    </ScreenKeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
