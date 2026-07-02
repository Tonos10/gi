// src/components/GoalCard.tsx
//
// Tarjeta de meta financiera en la lista principal.
// PUNTO 3 â€” Tema dinÃ¡mico: sin colores hardcodeados.
// PUNTO 5 â€” Muestra photoUri del usuario si existe; fallback al Ã­cono ðŸ·.

import { memo } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAppTheme } from "../hooks/useAppTheme";
import { useAppStore } from "../store/useAppStore";

// â”€â”€â”€ Props del componente â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface TarjetaMetaProps {
  name: string;
  targetAmount: number;
  percentage: number;
  onPress: () => void;
  /** PUNTO 5 â€” URI de foto personalizada; null activa el fallback del Ã­cono */
  photoUri?: string | null;
}

// â”€â”€â”€ Componente memoizado / Memoized component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const GoalCard = memo(
  ({ name, targetAmount, percentage, onPress, photoUri }: TarjetaMetaProps) => {
    // PUNTO 3 â€” Lectura dinÃ¡mica del esquema de color / Dynamic color scheme
    const { current_colors, theme } = useAppTheme();
    const currencySymbol = useAppStore((state) => state.settings.currencySymbol);

    return (
      <TouchableOpacity
        style={[
          styles.card_container,
          {
            backgroundColor: current_colors.surface,
            // Sombra dinÃ¡mica â€” mÃ¡s visible en light mode / Dynamic shadow
            shadowColor: theme === "dark" ? "transparent" : "#000",
          },
        ]}
        onPress={onPress}
        activeOpacity={0.75}
      >
        {/* â”€â”€ Ãcono / Imagen de la meta â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
            PUNTO 5 â€” Si photoUri existe â†’ Image con cover; si no â†’ emoji ðŸ·
        â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <View
          style={[
            styles.icon_container,
            { backgroundColor: current_colors.iconBackground },
          ]}
        >
          {photoUri ? (
            // Imagen personalizada del usuario / Custom user photo
            <Image
              source={{ uri: photoUri }}
              style={styles.goal_photo}
              resizeMode="cover"
            />
          ) : (
            // Fallback: ícono predefinido / Default icon fallback
            <Text style={styles.icon_emoji}>🐷</Text>
          )}
        </View>

        {/* ——— Información textual de la meta ————————————————————————————————————— */}
        <View style={styles.info_container}>
          <Text
            style={[styles.goal_name, { color: current_colors.textPrimary }]}
            numberOfLines={1}
          >
            {name}
          </Text>

          <Text
            style={[
              styles.progress_text,
              { color: current_colors.textSecondary },
            ]}
          >
            {/* Siempre mostramos 2 decimales / Always show 2 decimal places */}
            {percentage}% de {currencySymbol}
            {targetAmount.toLocaleString("es-MX", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            ahorrado
          </Text>

          {/* Barra de progreso / Progress bar */}
          <View
            style={[
              styles.progress_bar_bg,
              { backgroundColor: current_colors.border },
            ]}
          >
            <View
              style={[
                styles.progress_bar_fill,
                {
                  width: `${percentage}%`,
                  // PUNTO 3 â€” Color dinÃ¡mico segÃºn tema / Dynamic brand color
                  backgroundColor: current_colors.brand,
                },
              ]}
            />
          </View>
        </View>

        {/* Flecha de navegacion / Navigation chevron */}
        <Text style={[styles.chevron, { color: current_colors.textSecondary }]}>
          ›
        </Text>
      </TouchableOpacity>
    );
  },
);

GoalCard.displayName = "GoalCard";

// â”€â”€â”€ Estilos estÃ¡ticos â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const styles = StyleSheet.create({
  card_container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    // Sombra suave / Soft shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },

  // Contenedor cuadrado del Ã­cono / Icon square container
  icon_container: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    overflow: "hidden", // Necesario para que Image respete el borderRadius
  },

  // PUNTO 5 â€” Imagen cubre todo el contenedor / Image fills container with cover
  goal_photo: {
    width: "100%",
    height: "100%",
  },

  // Emoji fallback
  icon_emoji: {
    fontSize: 26,
  },

  info_container: { flex: 1 },
  goal_name: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  progress_text: {
    fontSize: 12,
    marginBottom: 8,
  },
  progress_bar_bg: {
    height: 4,
    borderRadius: 2,
    width: "100%",
    overflow: "hidden",
  },
  progress_bar_fill: {
    height: "100%",
    borderRadius: 2,
  },
  chevron: {
    fontSize: 22,
    marginLeft: 8,
  },
});

export default GoalCard;
