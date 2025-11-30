import React, { useMemo } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import {
  getDaysInMonth,
  getFirstDayOfWeek,
  formatMonthYear,
  addMonths,
  isSameDay,
  isToday,
  dateToKey,
} from "@/utils/dateUtils";

interface CalendarProps {
  selectedDate: Date;
  currentMonth: Date;
  onSelectDate: (date: Date) => void;
  onChangeMonth: (date: Date) => void;
  entryDates: Set<string>;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function Calendar({
  selectedDate,
  currentMonth,
  onSelectDate,
  onChangeMonth,
  entryDates,
}: CalendarProps) {
  const { theme } = useTheme();

  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDayOfWeek = getFirstDayOfWeek(currentMonth);
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const days: (Date | null)[] = [];

    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  }, [currentMonth]);

  const handlePrevMonth = () => {
    onChangeMonth(addMonths(currentMonth, -1));
  };

  const handleNextMonth = () => {
    onChangeMonth(addMonths(currentMonth, 1));
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundDefault }]}>
      <View style={styles.header}>
        <Pressable
          onPress={handlePrevMonth}
          style={({ pressed }) => [
            styles.navButton,
            { opacity: pressed ? 0.6 : 1 },
          ]}
        >
          <Feather name="chevron-left" size={24} color={theme.text} />
        </Pressable>
        <ThemedText type="h4" style={styles.monthTitle}>
          {formatMonthYear(currentMonth)}
        </ThemedText>
        <Pressable
          onPress={handleNextMonth}
          style={({ pressed }) => [
            styles.navButton,
            { opacity: pressed ? 0.6 : 1 },
          ]}
        >
          <Feather name="chevron-right" size={24} color={theme.text} />
        </Pressable>
      </View>

      <View style={styles.weekdaysRow}>
        {WEEKDAYS.map((day, index) => (
          <View key={day} style={styles.weekdayCell}>
            <ThemedText
              type="small"
              style={[
                styles.weekdayText,
                { color: index === 0 || index === 6 ? theme.textSecondary : theme.text },
              ]}
            >
              {day}
            </ThemedText>
          </View>
        ))}
      </View>

      <View style={styles.daysGrid}>
        {calendarDays.map((date, index) => {
          if (!date) {
            return <View key={`empty-${index}`} style={styles.dayCell} />;
          }

          const isSelected = isSameDay(date, selectedDate);
          const isTodayDate = isToday(date);
          const hasEntry = entryDates.has(dateToKey(date));
          const isWeekend = date.getDay() === 0 || date.getDay() === 6;

          return (
            <Pressable
              key={date.toISOString()}
              onPress={() => onSelectDate(date)}
              style={({ pressed }) => [
                styles.dayCell,
                isSelected && { backgroundColor: theme.primary },
                isTodayDate && !isSelected && {
                  borderWidth: 2,
                  borderColor: theme.accent,
                },
                { opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <ThemedText
                type="body"
                style={[
                  styles.dayText,
                  isSelected && { color: "#FFFFFF", fontWeight: "600" },
                  isTodayDate && !isSelected && { fontWeight: "700" },
                  isWeekend && !isSelected && { color: theme.textSecondary },
                ]}
              >
                {date.getDate()}
              </ThemedText>
              {hasEntry && (
                <View
                  style={[
                    styles.entryDot,
                    { backgroundColor: isSelected ? "#FFFFFF" : theme.accent },
                  ]}
                />
              )}
            </Pressable>
          );
        })}
      </View>
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
    marginBottom: Spacing.lg,
  },
  navButton: {
    padding: Spacing.sm,
  },
  monthTitle: {
    textAlign: "center",
  },
  weekdaysRow: {
    flexDirection: "row",
    marginBottom: Spacing.sm,
  },
  weekdayCell: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Spacing.xs,
  },
  weekdayText: {
    fontWeight: "500",
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: "14.28%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: BorderRadius.full,
  },
  dayText: {
    textAlign: "center",
  },
  entryDot: {
    position: "absolute",
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
