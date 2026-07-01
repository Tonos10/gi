import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { useAppTheme } from "../hooks/useAppTheme";

interface Props {
  title: string;
  onPress: () => void;
  variant?: "primary" | "danger" | "brand";
  disabled?: boolean;
}

export const Button = ({
  title,
  onPress,
  variant = "brand",
  disabled = false,
}: Props) => {
  const { current_colors } = useAppTheme();

  const getBackgroundColor = () => {
    if (disabled) return current_colors.border;
    switch (variant) {
      case "primary":
        return current_colors.primary;
      case "danger":
        return current_colors.danger;
      case "brand":
      default:
        return current_colors.brand;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: getBackgroundColor() }]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    width: "100%",
  },
  text: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
