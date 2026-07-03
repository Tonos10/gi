// app/(tabs)/index.tsx
//
// Pantalla principal de metas (home screen).
// PUNTO 1 — Sin barra inferior. Botón de Configuración en esquina superior derecha.
// PUNTO 3 — Tema dinámico: sin colores hardcodeados, responde a useColorScheme.
// PUNTO 5 — GoalCard muestra photoUri guardada; fallback al ícono 🐷 predefinido.

import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

import TarjetaMeta from "../../components/TarjetaMeta";
import { useAppTheme } from "../../hooks/useAppTheme";
import { useAppStore } from "../../store/useAppStore";

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  // PUNTO 3 — Lectura dinámica del esquema de color del sistema / Dynamic color scheme
  const { current_colors } = useAppTheme();

  // Metas del estado global / Goals from global Zustand store
  const goals = useAppStore((state) => state.goals);

  // Estado del buscador / Search query local state
  const [search_query, setSearchQuery] = useState("");

  // Filtrado optimizado con useMemo / Memoized filter to avoid re-renders
  const filtered_goals = useMemo(
    () =>
      goals.filter((goal) =>
        goal.name.toLowerCase().includes(search_query.toLowerCase()),
      ),
    [goals, search_query],
  );

  return (
    <SafeAreaView
      style={[styles.safe_area, { backgroundColor: current_colors.background }]}
    >
      {/* ══════════════════════════════════════════════════════
          ENCABEZADO — Título + Botón Configuración (headerRight)
          PUNTO 1: Configuración en esquina superior derecha
      ══════════════════════════════════════════════════════ */}
      <View style={styles.header}>
        <Text
          style={[styles.header_title, { color: current_colors.textPrimary }]}
        >
          {t("goals.title")}
        </Text>

        {/* PUNTO 1 — Botón Configuraciones movido al header superior derecho */}
        <TouchableOpacity
          id="btn-open-settings"
          style={[
            styles.settings_btn,
            {
              backgroundColor: current_colors.surface,
              borderColor: current_colors.border,
            },
          ]}
          onPress={() => router.push("/settings")}
          activeOpacity={0.7}
        >
          <Text style={styles.settings_icon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* ══════════════════════════════════════════════════════
          BUSCADOR
      ══════════════════════════════════════════════════════ */}
      <View style={styles.search_wrapper}>
        <View
          style={[
            styles.search_container,
            {
              backgroundColor: current_colors.surface,
              borderColor: current_colors.border,
            },
          ]}
        >
          <Text style={styles.search_icon}>🔍</Text>
          <TextInput
            id="input-search-goals"
            style={[styles.search_input, { color: current_colors.textPrimary }]}
            placeholder={t("goals.search_placeholder")}
            placeholderTextColor={current_colors.textSecondary}
            value={search_query}
            onChangeText={setSearchQuery}
            autoFocus={false}
          />
        </View>
      </View>

      {/* ══════════════════════════════════════════════════════
          LISTA DE METAS
          PUNTO 5 — GoalCard recibe photoUri para mostrar imagen real
      ══════════════════════════════════════════════════════ */}
      <FlatList
        data={filtered_goals}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          // Porcentaje de progreso / Progress percentage calculation
          const pct =
            item.targetAmount > 0
              ? Math.min(
                  Math.round((item.savedAmount / item.targetAmount) * 100),
                  100,
                )
              : 0;

          return (
            <TarjetaMeta
              name={item.name}
              targetAmount={item.targetAmount}
              percentage={pct}
              // PUNTO 5 — Pasamos photoUri para mostrar imagen del usuario o el fallback
              photoUri={item.photoUri ?? null}
              onPress={() => router.push(`/goal/${item.id}`)}
            />
          );
        }}
        contentContainerStyle={styles.list_content}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.empty_container}>
            <Text style={styles.empty_emoji}>🎯</Text>
            <Text
              style={[
                styles.empty_text,
                { color: current_colors.textSecondary },
              ]}
            >
              {search_query
                ? t("goals.search_empty")
                : t("goals.empty_message")}
            </Text>
          </View>
        )}
      />

      {/* ══════════════════════════════════════════════════════
          FAB — Botón flotante para crear nueva meta
      ══════════════════════════════════════════════════════ */}
      <TouchableOpacity
        id="btn-create-goal-fab"
        style={[styles.fab, { backgroundColor: current_colors.primary }]}
        onPress={() => router.push("/goal/new-goal")}
        activeOpacity={0.85}
      >
        <Text style={styles.fab_text}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// ─── Estilos ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe_area: {
    flex: 1,
  },

  // Encabezado superior / Top header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  header_title: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
  },

  // Botón Configuración — esquina superior derecha / Settings button top-right
  settings_btn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  settings_icon: {
    fontSize: 20,
  },

  // Buscador / Search bar
  search_wrapper: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  search_container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    height: 44,
  },
  search_icon: {
    fontSize: 16,
    marginRight: 8,
  },
  search_input: {
    flex: 1,
    fontSize: 16,
    height: "100%",
  },

  // Lista / FlatList content
  list_content: {
    paddingTop: 4,
    paddingBottom: 100, // Espacio para el FAB / Space for FAB
  },

  // Estado vacío / Empty state
  empty_container: {
    padding: 48,
    alignItems: "center",
  },
  empty_emoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  empty_text: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },

  // FAB — Botón flotante
  fab: {
    position: "absolute",
    bottom: 28,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 8,
  },
  fab_text: {
    fontSize: 32,
    color: "#FFFFFF",
    lineHeight: 36,
    fontWeight: "300",
  },
});
