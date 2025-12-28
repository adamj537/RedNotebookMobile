import React, { useEffect, useState } from "react";
import { View, StyleSheet, TextInput, FlatList, ActivityIndicator } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { TagChip } from "@/components/TagChip";
import { EntryListItem } from "@/components/EntryListItem";
import { useSearch } from "@/context/SearchContext";
import { useJournal } from "@/context/JournalContext";
import { useTheme } from "@/hooks/useTheme";
import { useScreenInsets } from "@/hooks/useScreenInsets";
import { Spacing, BorderRadius } from "@/constants/theme";
import { dateToKey } from "@/utils/dateUtils";

type SearchNavigationProp = NativeStackNavigationProp<any, "SearchResults">;

export default function SearchScreen({
  navigation,
}: {
  navigation: SearchNavigationProp;
}) {
  const { theme } = useTheme();
  const { paddingTop, paddingBottom } = useScreenInsets();
  const {
    searchQuery,
    setSearchQuery,
    selectedTags,
    toggleTag,
    clearTags,
    searchResults,
    isSearching,
    performSearch,
  } = useSearch();
  const { allTags } = useJournal();
  const [showTagFilter, setShowTagFilter] = useState(false);

  useEffect(() => {
    if (searchQuery === "" && selectedTags.size === 0) {
      return;
    }
    performSearch(searchQuery, Array.from(selectedTags));
  }, [selectedTags, performSearch, searchQuery]);

  const handleEntryPress = (date: Date) => {
    // Navigate back to calendar or today and set that date
    // For now, just return to previous screen
    navigation.goBack();
  };

  const tagsArray = Array.from(allTags.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Feather name="search" size={48} color={theme.textDisabled} />
      <ThemedText
        type="body"
        style={[styles.emptyText, { color: theme.textSecondary }]}
      >
        {searchQuery === "" && selectedTags.size === 0
          ? "Start typing or select tags to search your journal"
          : "No entries found matching your search"}
      </ThemedText>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View
        style={[
          styles.searchBar,
          {
            backgroundColor: theme.backgroundDefault,
            borderColor: theme.border,
            marginTop: paddingTop,
          },
        ]}
      >
        <Feather name="search" size={20} color={theme.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search entries..."
          placeholderTextColor={theme.textDisabled}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery !== "" && (
          <Feather
            name="x"
            size={20}
            color={theme.textSecondary}
            onPress={() => setSearchQuery("")}
          />
        )}
      </View>

      <View
        style={[
          styles.filterBar,
          { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
        ]}
      >
        <Feather name="filter" size={16} color={theme.textSecondary} />
        <ThemedText
          type="small"
          onPress={() => setShowTagFilter(!showTagFilter)}
          style={[styles.filterText, { color: theme.primary }]}
        >
          {selectedTags.size > 0 ? `${selectedTags.size} tags` : "Filter by tags"}
        </ThemedText>
        {selectedTags.size > 0 && (
          <Feather
            name="x"
            size={16}
            color={theme.textSecondary}
            onPress={clearTags}
          />
        )}
      </View>

      {showTagFilter && (
        <View style={styles.tagFilterContainer}>
          {tagsArray.map(({ tag }) => (
            <TagChip
              key={tag}
              tag={tag}
              onPress={() => toggleTag(tag)}
              count={selectedTags.has(tag) ? 1 : 0}
            />
          ))}
        </View>
      )}

      {isSearching ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <FlatList
          data={searchResults}
          renderItem={({ item, index }) => (
            <EntryListItem
              date={item.date}
              entry={item.entry}
              onPress={() => handleEntryPress(item.date)}
              isLast={index === searchResults.length - 1}
            />
          )}
          keyExtractor={(item) => dateToKey(item.date)}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom },
            searchResults.length === 0 && styles.emptyListContent,
          ]}
          ListEmptyComponent={renderEmptyState}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: Spacing.xl,
    marginVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    height: 44,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  filterBar: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    height: 40,
    gap: Spacing.sm,
  },
  filterText: {
    flex: 1,
    fontWeight: "500",
  },
  tagFilterContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: Spacing.lg,
    gap: Spacing.sm,
    backgroundColor: "rgba(0,0,0,0.02)",
  },
  listContent: {
    paddingHorizontal: Spacing.xl,
  },
  emptyListContent: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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
