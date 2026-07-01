// src/components/modal/CustomInput.tsx
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from "react-native";
import { useAppTheme } from "../../hooks/useAppTheme";

interface CustomInputProps extends TextInputProps {
  label?: string;
  containerStyle?: ViewStyle;
  /** Prefijo que se muestra a la izquierda del campo (ej. símbolo de moneda) */
  prefix?: string;
}

export const CustomInput: React.FC<CustomInputProps> = ({
  label,
  containerStyle,
  prefix,
  ...textInputProps
}) => {
  const { theme, current_colors } = useAppTheme();
  const [isFocused, setIsFocused] = useState(false);

  const borderColor = isFocused
    ? current_colors.brand
    : current_colors.border;

  const inputBg =
    theme === "dark" ? current_colors.iconBackground : current_colors.background;

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label ? (
        <Text style={[styles.label, { color: current_colors.textSecondary }]}>
          {label}
        </Text>
      ) : null}

      <View
        style={[
          styles.inputRow,
          {
            backgroundColor: inputBg,
            borderColor,
            // Sombra suave cuando está enfocado
            shadowOpacity: isFocused ? 0.1 : 0,
            shadowColor: current_colors.brand,
          },
        ]}
      >
        {prefix ? (
          <Text style={[styles.prefix, { color: current_colors.textSecondary }]}>
            {prefix}
          </Text>
        ) : null}

        <TextInput
          {...textInputProps}
          style={[
            styles.input,
            { color: current_colors.textPrimary },
            textInputProps.style,
          ]}
          placeholderTextColor={current_colors.textSecondary}
          onFocus={(e) => {
            setIsFocused(true);
            textInputProps.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            textInputProps.onBlur?.(e);
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 2,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    height: 52,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 14,
    // Sombra iOS
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    // Sombra Android ignorada a propósito (elevation dinámico es ruidoso)
    elevation: 0,
  },
  prefix: {
    fontSize: 17,
    fontWeight: "600",
    marginRight: 6,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    padding: 0, // Eliminar padding por defecto de Android
  },
});
