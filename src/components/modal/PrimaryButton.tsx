// src/components/modal/PrimaryButton.tsx
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  ViewStyle,
} from "react-native";
import { useAppTheme } from "../../hooks/useAppTheme";

interface PrimaryBotonProps extends TouchableOpacityProps {
  title: string;
  /** Muestra un spinner en lugar del texto cuando es true */
  loading?: boolean;
  /** Color de fondo; por defecto usa el color de marca (brand) del tema */
  color?: string;
  containerStyle?: ViewStyle;
}

export const PrimaryButton: React.FC<PrimaryBotonProps> = ({
  title,
  loading = false,
  color,
  containerStyle,
  disabled,
  ...rest
}) => {
  const { current_colors } = useAppTheme();
  const bgColor = color ?? current_colors.brand;

  return (
    <TouchableOpacity
      {...rest}
      disabled={disabled || loading}
      activeOpacity={0.82}
      style={[
        styles.btn,
        { backgroundColor: bgColor, opacity: disabled ? 0.6 : 1 },
        containerStyle,
      ]}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" size="small" />
      ) : (
        <Text style={styles.text}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: {
    height: 54,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    // Sombra iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    // Sombra Android
    elevation: 5,
  },
  text: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});
