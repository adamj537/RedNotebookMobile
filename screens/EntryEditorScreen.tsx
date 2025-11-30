import React, { useState, useEffect, useCallback, useRef } from "react";
import { View, StyleSheet, Alert, Pressable } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { ScreenKeyboardAwareScrollView } from "@/components/ScreenKeyboardAwareScrollView";
import { EntryEditor } from "@/components/EntryEditor";
import { ThemedText } from "@/components/ThemedText";
import { useJournal } from "@/context/JournalContext";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import { JournalEntry, createEmptyEntry } from "@/models/JournalEntry";
import { CalendarStackParamList } from "@/navigation/CalendarStackNavigator";
import { keyToDate, formatDisplayDate, dateToKey } from "@/utils/dateUtils";
import { LocalStorageService } from "@/services/LocalStorageService";

type EntryEditorScreenProps = {
  navigation: NativeStackNavigationProp<CalendarStackParamList, "EntryEditor">;
  route: RouteProp<CalendarStackParamList, "EntryEditor">;
};

export default function EntryEditorScreen({
  navigation,
  route,
}: EntryEditorScreenProps) {
  const { theme } = useTheme();
  const { refreshEntryDates, refreshTags } = useJournal();

  const dateKey = route.params?.date;
  const date = dateKey ? keyToDate(dateKey) : new Date();

  const [entry, setEntry] = useState<JournalEntry>(createEmptyEntry());
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const originalEntryRef = useRef<JournalEntry>(createEmptyEntry());

  const loadEntry = useCallback(async () => {
    if (!date) return;
    setIsLoading(true);
    try {
      const loadedEntry = await LocalStorageService.loadEntry(date);
      setEntry(loadedEntry);
      originalEntryRef.current = loadedEntry;
    } catch (error) {
      console.error("Error loading entry:", error);
    } finally {
      setIsLoading(false);
    }
  }, [date]);

  useEffect(() => {
    loadEntry();
  }, [loadEntry]);

  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <ThemedText type="h4">
          {date ? formatDisplayDate(date) : "Edit Entry"}
        </ThemedText>
      ),
      headerLeft: () => (
        <Pressable
          onPress={handleCancel}
          style={({ pressed }) => [
            { opacity: pressed ? 0.6 : 1, paddingHorizontal: Spacing.sm },
          ]}
        >
          <ThemedText type="body" style={{ color: theme.primary }}>
            Cancel
          </ThemedText>
        </Pressable>
      ),
      headerRight: () => (
        <Pressable
          onPress={handleSave}
          disabled={isSaving || !hasChanges}
          style={({ pressed }) => [
            {
              opacity: hasChanges ? (pressed || isSaving ? 0.6 : 1) : 0.3,
              paddingHorizontal: Spacing.sm,
            },
          ]}
        >
          <ThemedText
            type="body"
            style={{ color: theme.primary, fontWeight: "600" }}
          >
            {isSaving ? "Saving..." : "Save"}
          </ThemedText>
        </Pressable>
      ),
    });
  }, [hasChanges, isSaving, navigation, theme.primary, date]);

  const handleEntryChange = useCallback((newEntry: JournalEntry) => {
    setEntry(newEntry);
    const changed =
      newEntry.text !== originalEntryRef.current.text ||
      JSON.stringify(newEntry.tags) !==
        JSON.stringify(originalEntryRef.current.tags);
    setHasChanges(changed);
  }, []);

  const handleSave = async () => {
    if (!date) return;
    setIsSaving(true);
    try {
      await LocalStorageService.saveEntry(date, entry);
      await refreshEntryDates();
      await refreshTags();
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "Failed to save entry. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      Alert.alert(
        "Discard Changes?",
        "You have unsaved changes. Are you sure you want to discard them?",
        [
          { text: "Keep Editing", style: "cancel" },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  if (isLoading) {
    return (
      <View
        style={[styles.loadingContainer, { backgroundColor: theme.backgroundRoot }]}
      >
        <Feather name="loader" size={32} color={theme.textDisabled} />
      </View>
    );
  }

  return (
    <ScreenKeyboardAwareScrollView>
      <EntryEditor entry={entry} onSave={handleEntryChange} autoFocus />
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
