import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TodayScreen from "@/screens/TodayScreen";
import { useTheme } from "@/hooks/useTheme";
import { getCommonScreenOptions } from "@/navigation/screenOptions";
import { formatShortDate } from "@/utils/dateUtils";

export type TodayStackParamList = {
  Today: undefined;
};

const Stack = createNativeStackNavigator<TodayStackParamList>();

export default function TodayStackNavigator() {
  const { theme, isDark } = useTheme();
  const today = new Date();

  return (
    <Stack.Navigator
      screenOptions={{
        ...getCommonScreenOptions({ theme, isDark }),
      }}
    >
      <Stack.Screen
        name="Today"
        component={TodayScreen}
        options={{
          headerTitle: formatShortDate(today),
        }}
      />
    </Stack.Navigator>
  );
}
