import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { LogBox, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { initI18n } from "../core/i18n";
import { useAppTheme } from "../hooks/useAppTheme";
import { useLanguageStore } from "../store/useLanguageStore";

// Esto ignorará específicamente ese aviso de deprecación
LogBox.ignoreLogs(["ImagePicker.MediaTypeOptions"]);
export default function RootLayout() {
  const { current_colors } = useAppTheme();
  const hydrate = useLanguageStore((s) => s.hydrate);
  const [isI18nInitialized, setIsI18nInitialized] = useState(false);

  useEffect(() => {
    // Inicializa i18next y aplica la preferencia guardada (o el locale del sistema).
    initI18n()
      .then(() => {
        hydrate();
        setIsI18nInitialized(true);
      })
      .catch((err) => {
        console.error(err);
        setIsI18nInitialized(true);
      });
  }, [hydrate]);

  if (!isI18nInitialized) {
    return <View style={{ flex: 1, backgroundColor: current_colors.background }} />;
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
          {/* Pantallas principales */}
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

          {/* Pantallas individuales */}
          <Stack.Screen
            name="goal/[id]"
            options={{
              animation: "slide_from_right",
              contentStyle: { backgroundColor: current_colors.background },
              freezeOnBlur: false,
            }}
          />

          {/* Configuraciones */}
          <Stack.Screen
            name="settings"
            options={{
              animation: "slide_from_right",
              headerShown: false,
              contentStyle: { backgroundColor: current_colors.background },
              freezeOnBlur: false,
            }}
          />

          {/* Pantalla Nueva Meta — Bottom Sheet animado con Reanimated */}
          <Stack.Screen
            name="goal/new-goal"
            options={{
              presentation: "transparentModal",
              animation: "none", // La animación de entrada/salida la gestiona Reanimated internamente
              headerShown: false,
              contentStyle: { backgroundColor: "transparent" },
            }}
          />

          {/* Modales */}
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
