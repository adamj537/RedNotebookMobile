import React from "react";
import { StyleSheet, Pressable, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useTheme } from "@/hooks/useTheme";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Spacing } from "@/constants/theme";

interface FloatingActionButtonProps {
  onPress: () => void;
  icon?: keyof typeof Feather.glyphMap;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function FloatingActionButton({
  onPress,
  icon = "plus",
}: FloatingActionButtonProps) {
  const { theme } = useTheme();
  const tabBarHeight = useBottomTabBarHeight();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.fab,
        {
          backgroundColor: theme.primary,
          bottom: tabBarHeight + Spacing.lg,
          ...Platform.select({
            ios: {
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
            },
            android: {
              elevation: 6,
            },
          }),
        },
        animatedStyle,
      ]}
    >
      <Feather name={icon} size={24} color="#FFFFFF" />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: Spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
});
