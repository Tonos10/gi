import { Stack } from "expo-router";
import { LogBox } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { useAppTheme } from "../hooks/useAppTheme";

// Esto ignorará específicamente ese aviso de deprecación
LogBox.ignoreLogs(["ImagePicker.MediaTypeOptions"]);
export default function RootLayout() {
  const { current_colors } = useAppTheme();

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
