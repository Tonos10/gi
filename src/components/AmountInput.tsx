import { StyleSheet, Text, TextInput, View } from "react-native";
import { useAppTheme } from "../hooks/useAppTheme";
import { useAppStore } from "../store/useAppStore";

interface Props {
  value: string;
  onChangeText: (text: string) => void;
}

export const AmountInput = ({ value, onChangeText }: Props) => {
  const { current_colors } = useAppTheme();
  const currencySymbol = useAppStore((state) => state.settings.currencySymbol);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: current_colors.surface,
          borderColor: current_colors.border,
        },
      ]}
    >
      <Text style={[styles.symbol, { color: current_colors.textPrimary }]}>
        {currencySymbol}
      </Text>
      <TextInput
        style={[styles.input, { color: current_colors.textPrimary }]}
        placeholder="0"
        placeholderTextColor={current_colors.textSecondary}
        keyboardType="numeric"
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 64,
    marginBottom: 20,
  },
  symbol: {
    fontSize: 24,
    fontWeight: "bold",
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 24,
    fontWeight: "bold",
    height: "100%",
  },
});
