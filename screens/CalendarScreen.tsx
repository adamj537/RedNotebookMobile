import React, { useState, useCallback } from "react";
import { View, StyleSheet, RefreshControl } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { Calendar } from "@/components/Calendar";
import { EntryPreviewCard } from "@/components/EntryPreviewCard";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { useJournal } from "@/context/JournalContext";
import { useSync } from "@/context/SyncContext";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import { CalendarStackParamList } from "@/navigation/CalendarStackNavigator";
import { dateToKey } from "@/utils/dateUtils";

type CalendarScreenProps = {
  navigation: NativeStackNavigationProp<CalendarStackParamList, "Calendar">;
};

export default function CalendarScreen({ navigation }: CalendarScreenProps) {
  const { theme } = useTheme();
  const {
    selectedDate,
    setSelectedDate,
    currentEntry,
    entryDates,
    refreshEntryDates,
    isLoading,
  } = useJournal();
  const { syncAll, syncState } = useSync();

  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const handleDateSelect = useCallback(
    (date: Date) => {
      setSelectedDate(date);
    },
    [setSelectedDate]
  );

  const handleEditEntry = useCallback(() => {
    navigation.navigate("EntryEditor", { date: dateToKey(selectedDate) });
  }, [navigation, selectedDate]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (syncState.isSignedInGoogle || syncState.isSignedInOneDrive) {
        await syncAll();
      }
      await refreshEntryDates();
    } catch (error) {
      console.error("Refresh failed:", error);
    } finally {
      setRefreshing(false);
    }
  }, [syncAll, syncState, refreshEntryDates]);

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScreenScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.primary}
          />
        }
      >
        <Calendar
          selectedDate={selectedDate}
          currentMonth={currentMonth}
          onSelectDate={handleDateSelect}
          onChangeMonth={setCurrentMonth}
          entryDates={entryDates}
        />
        <View style={styles.spacer} />
        <EntryPreviewCard
          date={selectedDate}
          entry={currentEntry}
          onEdit={handleEditEntry}
        />
      </ScreenScrollView>
      <FloatingActionButton onPress={handleEditEntry} icon="edit-3" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  spacer: {
    height: Spacing.lg,
  },
});
