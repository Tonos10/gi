// src/components/modal/AmountCard.tsx
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../../hooks/useAppTheme";

interface AmountCardProps {
  label: string;
  amount: string;
}

/**
 * Tarjeta informativa que muestra un label y un monto en grande.
 * Reemplaza a GlassCard con colores sólidos y soporte de tema.
 */
export const AmountCard: React.FC<AmountCardProps> = ({ label, amount }) => {
  const { current_colors } = useAppTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: current_colors.iconBackground,
          borderColor: current_colors.border,
        },
      ]}
    >
      <Text style={[styles.label, { color: current_colors.textSecondary }]}>
        {label}
      </Text>
      <Text style={[styles.amount, { color: current_colors.textPrimary }]}>
        {amount}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
  },
  amount: {
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
});
