import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import mobileAds from "react-native-google-mobile-ads";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { initI18n } from "../core/i18n";
import { useAppTheme } from "../hooks/useAppTheme";
import { useLanguageStore } from "../store/useLanguageStore";

export default function RootLayout() {
  const { current_colors } = useAppTheme();
  const [isI18nInitialized, setIsI18nInitialized] = useState(false);
  const { hydrate } = useLanguageStore();

  useEffect(() => {
    let isMounted = true;

    initI18n()
      .then(() => hydrate())
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        if (isMounted) {
          setIsI18nInitialized(true);
        }
      });

    mobileAds()
      .initialize()
      .then((adapterStatuses) => {
        console.log("MobileAds initialized", adapterStatuses);
      })
      .catch((err) => {
        console.error("MobileAds initialization error:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [hydrate]);

  if (!isI18nInitialized) {
    return (
      <View style={{ flex: 1, backgroundColor: current_colors.background }} />
    );
  }

  return (
    <GestureHandlerRootView
      style={{ flex: 1, backgroundColor: current_colors.background }}
    >
      <SafeAreaProvider>
        <Stack
          screenOptions={{
            contentStyle: {
              backgroundColor: current_colors.background,
            },
            headerShown: false,
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

          <Stack.Screen
            name="goal/[id]"
            options={{
              animation: "slide_from_right",
              contentStyle: { backgroundColor: current_colors.background },
              freezeOnBlur: false,
            }}
          />

          <Stack.Screen
            name="settings"
            options={{
              animation: "slide_from_right",
              headerShown: false,
              contentStyle: { backgroundColor: current_colors.background },
              freezeOnBlur: false,
            }}
          />

          <Stack.Screen
            name="goal/new-goal"
            options={{
              presentation: "transparentModal",
              animation: "none",
              headerShown: false,
              contentStyle: { backgroundColor: "transparent" },
            }}
          />

          <Stack.Screen
            name="(modals)/add-money"
            options={{
              presentation: "transparentModal",
              animation: "fade",
              contentStyle: { backgroundColor: "transparent" },
            }}
          />

          <Stack.Screen
            name="(modals)/withdraw-money"
            options={{
              presentation: "transparentModal",
              animation: "fade",
              contentStyle: { backgroundColor: "transparent" },
            }}
          />

          <Stack.Screen
            name="(modals)/edit-goal"
            options={{
              presentation: "transparentModal",
              animation: "fade",
              contentStyle: { backgroundColor: "transparent" },
            }}
          />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
