// src/components/Input.tsx
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  useColorScheme,
  View,
} from "react-native";
import { colors } from "../core/theme";

interface InputProps extends TextInputProps {
  label?: string; // Etiqueta opcional arriba del input
}

export const Input = ({ label, style, ...props }: InputProps) => {
  const theme = useColorScheme() === "dark" ? "dark" : "light";
  const currentColors = colors[theme];

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: currentColors.textSecondary }]}>
          {label}
        </Text>
      )}
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: currentColors.surface,
            color: currentColors.textPrimary,
            borderColor: currentColors.border,
          },
          style,
        ]}
        placeholderTextColor={currentColors.textSecondary}
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
