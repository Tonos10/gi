import { StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../hooks/useAppTheme";
import { useAppStore } from "../store/useAppStore";
import { Transaction } from "../types";

interface Props {
  transaction: Transaction;
}

export const TransactionItem = ({ transaction }: Props) => {
  const { current_colors } = useAppTheme();
  const currencySymbol = useAppStore((state) => state.settings.currencySymbol);

  const isDeposit = transaction.type === "deposit";
  const amountPrefix = isDeposit ? "+" : "-";
  const amountColor = isDeposit
    ? current_colors.primary
    : current_colors.danger;

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: current_colors.surface,
          borderBottomColor: current_colors.border,
        },
      ]}
    >
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: isDeposit
              ? "rgba(76, 175, 80, 0.1)"
              : "rgba(244, 67, 54, 0.1)",
          },
        ]}
      >
        <Text style={[styles.icon, { color: amountColor }]}>
          {isDeposit ? "▲" : "▼"}
        </Text>
      </View>
      <View style={styles.textContainer}>
        <Text
          style={[styles.note, { color: current_colors.textPrimary }]}
          numberOfLines={1}
        >
          {transaction.note || (isDeposit ? "Depósito" : "Retiro")}
        </Text>
        <Text style={[styles.date, { color: current_colors.textSecondary }]}>
          {formatDate(transaction.date)}
        </Text>
      </View>
      <Text style={[styles.amount, { color: amountColor }]}>
        {amountPrefix}
        {currencySymbol}
        {transaction.amount.toLocaleString()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  icon: {
    fontSize: 16,
    fontWeight: "bold",
  },
  textContainer: {
    flex: 1,
  },
  note: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
  },
  amount: {
    fontSize: 16,
    fontWeight: "700",
  },
});
