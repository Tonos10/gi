// app/(tabs)/_layout.tsx
//
// PUNTO 1 — Eliminamos la barra de tabs inferior.
// Ocultamos el tab bar con display:'none' para no romper el enrutamiento de Expo Router.
// El botón de Configuración se mueve al header de la pantalla principal.

import { useAppTheme } from "@/hooks/useAppTheme";
import { Tabs } from "expo-router";

export default function TabLayout() {
  const { current_colors } = useAppTheme();

  return (
    <Tabs
      detachInactiveScreens={false}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: current_colors.background },
        freezeOnBlur: false,
        lazy: false,
        // PUNTO 1 — Ocultamos la barra inferior por completo / Hide bottom tab bar
        tabBarStyle: { display: "none" },
        // Mantenemos los colores dinámicos por si en el futuro se rehabilita
        tabBarActiveTintColor: current_colors.brand,
        tabBarInactiveTintColor: current_colors.textSecondary,
      }}
    >
      {/* Tab de metas — pantalla principal */}
      <Tabs.Screen name="index" options={{ title: "Mis metas" }} />
    </Tabs>
  );
}
