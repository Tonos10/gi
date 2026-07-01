// src/components/IconButton.tsx
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAppTheme } from "../hooks/useAppTheme";

const colors = {
  light: {
    primary: "#22C55E",
    danger: "#EF4444",
    brand: "#3B82F6",
    textPrimary: "#111827",
  },
  dark: {
    primary: "#22C55E",
    danger: "#EF4444",
    brand: "#60A5FA",
    textPrimary: "#F9FAFB",
  },
} as const;

interface IconButtonProps {
  label: string;
  icon: string; // Temporalmente usaremos caracteres, luego podemos poner @expo/vector-icons
  colorKey: "primary" | "danger" | "brand"; // Elegimos verde, rojo o azul de nuestro theme
  onPress: () => void;
}

export const IconButton = ({
  label,
  icon,
  colorKey,
  onPress,
}: IconButtonProps) => {
  const { current_colors } = useAppTheme();

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        style={[styles.circle, { backgroundColor: current_colors[colorKey] }]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Text style={styles.icon}>{icon}</Text>
      </TouchableOpacity>

      {/* Texto debajo del botÃ³n que cambia de color si es modo oscuro o claro */}
      <Text style={[styles.label, { color: current_colors.textPrimary }]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    marginHorizontal: 12, // Separa los botones entre sÃ­ cuando hay varios en fila
  },
  circle: {
    width: 60,
    height: 60,
    borderRadius: 30, // Un borderRadius de exactamente la mitad del ancho/alto hace un cÃ­rculo perfecto
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8, // Espacio entre el cÃ­rculo y el texto
  },
  icon: {
    fontSize: 28,
    color: "#FFFFFF", // El Ã­cono/texto interior siempre es blanco
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
  },
});
