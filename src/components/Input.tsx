// src/components/Input.tsx
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";
import { useAppTheme } from "../hooks/useAppTheme";

interface InputProps extends TextInputProps {
  label?: string; // Etiqueta opcional arriba del input
}

export const Input = ({ label, style, ...props }: InputProps) => {
  const { current_colors } = useAppTheme();

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: current_colors.textSecondary }]}>
          {label}
        </Text>
      )}
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: current_colors.surface,
            color: current_colors.textPrimary,
            borderColor: current_colors.border,
          },
          style,
        ]}
        placeholderTextColor={current_colors.textSecondary}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: "100%",
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
});
