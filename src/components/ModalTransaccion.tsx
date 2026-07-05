// src/components/TransactionModal.tsx
/**
 * TransactionModal — reemplaza a GlassTransactionModal.
 *
 * Header: [Cancelar] [Título] [Depositar / Retirar]
 * Balance: fila compacta (sin tarjeta) para maximizar el espacio visible.
 * Todo el contenido entra sin necesidad de hacer scroll en pantallas normales.
 */
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../hooks/useAppTheme";
import { useInterstitial } from "../services/ads/hooks/useInterstitial";
import { useAppStore } from "../store/useAppStore";
import { CustomInput } from "./modal/CustomInput";
import { ModalCard } from "./modal/ModalCard";
import { ModalHeader } from "./modal/ModalHeader";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ModalTransaccionProps {
  isVisible: boolean;
  onClose: () => void;
  type: "deposit" | "withdraw";
  goalId: string;
  title?: string;
  subtitle?: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export const ModalTransaccion: React.FC<ModalTransaccionProps> = ({
  isVisible,
  onClose,
  type,
  goalId,
  title,
  subtitle,
}) => {
  const { current_colors } = useAppTheme();

  const addTransaction = useAppStore((state) => state.addTransaction);
  const goal = useAppStore((state) => state.goals.find((g) => g.id === goalId));
  const currencySymbol = useAppStore((state) => state.settings.currencySymbol);

  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const { registerAction, showNow } = useInterstitial();

  useEffect(() => {
    if (!isVisible) return;

    const id = setTimeout(() => {
      setAmount("");
      setNote("");
      registerAction();
    }, 0);

    return () => clearTimeout(id);
  }, [isVisible, registerAction]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleClose = () => onClose();

  const handleSave = () => {
    const numericAmount = parseFloat(amount);

    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert(
        "Cantidad inválida",
        "Por favor, ingresa una cantidad válida mayor a 0.",
      );
      return;
    }

    if (type === "withdraw" && goal && numericAmount > goal.savedAmount) {
      Alert.alert(
        "Saldo insuficiente",
        `No puedes retirar más de lo que tienes ahorrado (${currencySymbol}${goal.savedAmount.toLocaleString(
          "es-MX",
          { minimumFractionDigits: 2, maximumFractionDigits: 2 },
        )}).`,
      );
      return;
    }

    addTransaction({
      id: Date.now().toString(),
      goalId,
      amount: numericAmount,
      type: type === "deposit" ? "deposit" : "withdrawal",
      note: note.trim() || undefined,
      date: new Date().toISOString(),
    });

    showNow().finally(() => {
      handleClose();
    });
  };

  // ── Derived values ───────────────────────────────────────────────────────────

  const isDeposit = type === "deposit";
  const actionColor = isDeposit
    ? current_colors.primary
    : current_colors.danger;

  const savedFormatted = goal
    ? `${currencySymbol}${goal.savedAmount.toLocaleString("es-MX", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
    : `${currencySymbol}0.00`;

  const defaultTitle = isDeposit ? "Nuevo Depósito" : "Retirar Fondos";
  const defaultSubtitle = goal?.name;
  const confirmLabel = isDeposit ? "Depositar" : "Retirar";
  const balanceLabel = isDeposit ? "Saldo actual" : "Disponible";

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <ModalCard isVisible={isVisible} onClose={handleClose}>
      {/* Cabecera: [Cancelar] [Título] [Depositar / Retirar] */}
      <ModalHeader
        title={title ?? defaultTitle}
        subtitle={subtitle ?? defaultSubtitle}
        onLeftPress={handleClose}
        leftLabel="Cancelar"
        onRightPress={handleSave}
        rightLabel={confirmLabel}
        rightColor={actionColor}
      />

      {/* ScrollView como red de seguridad en pantallas pequeñas.
           flexShrink:1 permite que Yoga comprima el ScrollView cuando
           el contenido total supera maxHeight del card, activando el scroll. */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Balance compacto — fila en lugar de tarjeta completa */}
        <View
          style={[
            styles.balanceRow,
            {
              backgroundColor: current_colors.iconBackground,
              borderColor: current_colors.border,
            },
          ]}
        >
          <Text
            style={[
              styles.balanceLabel,
              { color: current_colors.textSecondary },
            ]}
          >
            {balanceLabel}
          </Text>
          <Text
            style={[
              styles.balanceAmount,
              { color: current_colors.textPrimary },
            ]}
          >
            {savedFormatted}
          </Text>
        </View>

        {/* Input de cantidad */}
        <CustomInput
          label="Cantidad"
          prefix={currencySymbol}
          placeholder="0.00"
          keyboardType="decimal-pad"
          value={amount}
          onChangeText={setAmount}
          returnKeyType="next"
        />

        {/* Input de nota */}
        <CustomInput
          label="Nota (opcional)"
          placeholder="Ej. Pago de nómina"
          value={note}
          onChangeText={setNote}
          returnKeyType="done"
          onSubmitEditing={handleSave}
          containerStyle={{ marginBottom: 0 }}
        />
      </ScrollView>
    </ModalCard>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // flexShrink:1 → Yoga comprime el ScrollView cuando el card alcanza maxHeight,
  // activando el desplazamiento. Sin esto el ScrollView no tiene altura acotada.
  scrollView: {
    flexShrink: 1,
  },
  scrollContent: {
    paddingBottom: 4,
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  balanceAmount: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
});
