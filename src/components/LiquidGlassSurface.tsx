import { BlurView } from "expo-blur";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import type { PropsWithChildren } from "react";
import { Platform, StyleProp, View, ViewStyle } from "react-native";

type LiquidGlassSurfaceProps = PropsWithChildren<{
  isDark?: boolean;
  style?: StyleProp<ViewStyle>;
}>;

export function LiquidGlassSurface({
  children,
  isDark = false,
  style,
}: LiquidGlassSurfaceProps) {
  if (Platform.OS === "ios" && isLiquidGlassAvailable()) {
    return (
      <GlassView
        style={style}
        glassEffectStyle={{
          style: "clear",
          animate: true,
          animationDuration: 0.3,
        }}
        colorScheme={isDark ? "dark" : "light"}
        tintColor={isDark ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.52)"}
      >
        {children}
      </GlassView>
    );
  }

  if (Platform.OS === "ios") {
    return (
      <BlurView
        style={style}
        tint={isDark ? "systemChromeMaterialDark" : "systemChromeMaterialLight"}
        intensity={88}
      >
        {children}
      </BlurView>
    );
  }

  return <View style={style}>{children}</View>;
}
