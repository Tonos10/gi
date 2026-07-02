// src/components/modal/DangerButton.tsx
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  ViewStyle,
} from "react-native";
import { useAppTheme } from "../../hooks/useAppTheme";

interface DangerBotonProps extends TouchableOpacityProps {
  title: string;
  containerStyle?: ViewStyle;
}

/**
 * Botón de acción destructiva: fondo transparente con borde y texto de color
 * `danger` del tema activo. Usado para eliminar metas, cancelar, etc.
 */
export const DangerButton: React.FC<DangerBotonProps> = ({
  title,
  containerStyle,
  ...rest
}) => {
  const { current_colors } = useAppTheme();

  return (
    <TouchableOpacity
      {...rest}
      activeOpacity={0.7}
      style={[
        styles.btn,
        {
          borderColor: current_colors.danger,
        },
        containerStyle,
      ]}
    >
      <Text style={[styles.text, { color: current_colors.danger }]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: {
    height: 54,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
});
