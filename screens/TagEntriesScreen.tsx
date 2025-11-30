import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { EntryListItem } from "@/components/EntryListItem";
import { LocalStorageService } from "@/services/LocalStorageService";
import { useTheme } from "@/hooks/useTheme";
import { useScreenInsets } from "@/hooks/useScreenInsets";
import { Spacing } from "@/constants/theme";
import { JournalEntry } from "@/models/JournalEntry";
import { TagsStackParamList } from "@/navigation/TagsStackNavigator";
import { dateToKey } from "@/utils/dateUtils";

type TagEntriesScreenProps = {
  navigation: NativeStackNavigationProp<TagsStackParamList, "TagEntries">;
  route: RouteProp<TagsStackParamList, "TagEntries">;
};

export default function TagEntriesScreen({
  navigation,
  route,
}: TagEntriesScreenProps) {
  const { theme } = useTheme();
  const { paddingTop, paddingBottom } = useScreenInsets();
  const { tag } = route.params;

  const [entries, setEntries] = useState<{ date: Date; entry: JournalEntry }[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);

  const loadEntries = useCallback(async () => {
    setIsLoading(true);
    try {
      const tagEntries = await LocalStorageService.getEntriesWithTag(tag);
      setEntries(tagEntries);
    } catch (error) {
      console.error("Error loading entries with tag:", error);
    } finally {
      setIsLoading(false);
    }
  }, [tag]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const handleEntryPress = (date: Date) => {
    navigation.navigate("EntryEditor", { date: dateToKey(date) });
  };

  const renderItem = ({
    item,
    index,
  }: {
    item: { date: Date; entry: JournalEntry };
    index: number;
  }) => (
    <EntryListItem
      date={item.date}
      entry={item.entry}
      onPress={() => handleEntryPress(item.date)}
      isLast={index === entries.length - 1}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Feather name="file-text" size={48} color={theme.textDisabled} />
      <ThemedText
        type="body"
        style={[styles.emptyText, { color: theme.textSecondary }]}
      >
        No entries found with the tag "{tag}".
      </ThemedText>
    </View>
  );

  if (isLoading) {
    return (
      <View
        style={[styles.loadingContainer, { backgroundColor: theme.backgroundRoot }]}
      >
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <FlatList
        data={entries}
        renderItem={renderItem}
        keyExtractor={(item) => dateToKey(item.date)}
        contentContainerStyle={[
          styles.listContent,
          { paddingTop, paddingBottom },
          entries.length === 0 && styles.emptyListContent,
        ]}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {
    paddingHorizontal: Spacing.xl,
  },
  emptyListContent: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
    gap: Spacing.lg,
  },
  emptyText: {
    textAlign: "center",
  },
});
