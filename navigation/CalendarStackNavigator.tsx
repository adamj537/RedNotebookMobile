import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import CalendarScreen from "@/screens/CalendarScreen";
import EntryEditorScreen from "@/screens/EntryEditorScreen";
import SearchScreen from "@/screens/SearchScreen";
import { HeaderTitle } from "@/components/HeaderTitle";
import { useTheme } from "@/hooks/useTheme";
import { getCommonScreenOptions } from "@/navigation/screenOptions";

export type CalendarStackParamList = {
  Calendar: undefined;
  EntryEditor: { date?: string };
  SearchResults: undefined;
};

const Stack = createNativeStackNavigator<CalendarStackParamList>();

export default function CalendarStackNavigator() {
  const { theme, isDark } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        ...getCommonScreenOptions({ theme, isDark }),
      }}
    >
      <Stack.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{
          headerTitle: () => <HeaderTitle title="RedNotebook" />,
        }}
      />
      <Stack.Screen
        name="EntryEditor"
        component={EntryEditorScreen}
        options={{
          presentation: "modal",
          headerTitle: "Edit Entry",
          ...getCommonScreenOptions({ theme, isDark, transparent: false }),
        }}
      />
      <Stack.Screen
        name="SearchResults"
        component={SearchScreen}
        options={{
          headerTitle: "Search",
          ...getCommonScreenOptions({ theme, isDark, transparent: false }),
        }}
      />
    </Stack.Navigator>
  );
}
