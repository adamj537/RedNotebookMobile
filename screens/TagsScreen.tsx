import React, { useState, useCallback } from "react";
import { View, StyleSheet, TextInput, FlatList } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { ThemedText } from "@/components/ThemedText";
import { TagListItem } from "@/components/TagListItem";
import { useJournal } from "@/context/JournalContext";
import { useTheme } from "@/hooks/useTheme";
import { useScreenInsets } from "@/hooks/useScreenInsets";
import { Spacing, BorderRadius } from "@/constants/theme";
import { TagsStackParamList } from "@/navigation/TagsStackNavigator";

type TagsScreenProps = {
  navigation: NativeStackNavigationProp<TagsStackParamList, "Tags">;
};

export default function TagsScreen({ navigation }: TagsScreenProps) {
  const { theme } = useTheme();
  const { paddingTop, paddingBottom } = useScreenInsets();
  const { allTags, refreshTags } = useJournal();
  const [searchQuery, setSearchQuery] = useState("");

  useFocusEffect(
    useCallback(() => {
      refreshTags();
    }, [refreshTags])
  );

  const tagsArray = Array.from(allTags.entries())
    .map(([tag, count]) => ({ tag, count }))
    .filter((item) =>
      item.tag.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => b.count - a.count);

  const handleTagPress = (tag: string) => {
    navigation.navigate("TagEntries", { tag });
  };

  const renderItem = ({
    item,
    index,
  }: {
    item: { tag: string; count: number };
    index: number;
  }) => (
    <TagListItem
      tag={item.tag}
      count={item.count}
      onPress={() => handleTagPress(item.tag)}
      isLast={index === tagsArray.length - 1}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Feather name="tag" size={48} color={theme.textDisabled} />
      <ThemedText
        type="body"
        style={[styles.emptyText, { color: theme.textSecondary }]}
      >
        {searchQuery
          ? "No tags found matching your search."
          : "No tags yet. Add tags to your entries to see them here."}
      </ThemedText>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View
        style={[
          styles.searchContainer,
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
          placeholder="Search tags..."
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

      <FlatList
        data={tagsArray}
        renderItem={renderItem}
        keyExtractor={(item) => item.tag}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom },
          tagsArray.length === 0 && styles.emptyListContent,
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    height: 44,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: "100%",
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
