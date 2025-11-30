import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TagsScreen from "@/screens/TagsScreen";
import TagEntriesScreen from "@/screens/TagEntriesScreen";
import EntryEditorScreen from "@/screens/EntryEditorScreen";
import { useTheme } from "@/hooks/useTheme";
import { getCommonScreenOptions } from "@/navigation/screenOptions";

export type TagsStackParamList = {
  Tags: undefined;
  TagEntries: { tag: string };
  EntryEditor: { date?: string };
};

const Stack = createNativeStackNavigator<TagsStackParamList>();

export default function TagsStackNavigator() {
  const { theme, isDark } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        ...getCommonScreenOptions({ theme, isDark, transparent: false }),
      }}
    >
      <Stack.Screen
        name="Tags"
        component={TagsScreen}
        options={{
          headerTitle: "Tags",
        }}
      />
      <Stack.Screen
        name="TagEntries"
        component={TagEntriesScreen}
        options={({ route }) => ({
          headerTitle: route.params.tag,
        })}
      />
      <Stack.Screen
        name="EntryEditor"
        component={EntryEditorScreen}
        options={{
          presentation: "modal",
          headerTitle: "Edit Entry",
        }}
      />
    </Stack.Navigator>
  );
}
