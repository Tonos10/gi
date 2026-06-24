// app/(modals)/withdraw-money.tsx
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

import { AmountInput } from "../../components/AmountInput";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { colors } from "../../core/theme";
import { useAppStore } from "../../store/useAppStore";

export default function WithdrawMoneyModal() {
  const router = useRouter();
  const theme = useColorScheme() === "dark" ? "dark" : "light";
  const currentColors = colors[theme];
  const currencySymbol = useAppStore((state) => state.settings.currencySymbol);

  // 1. Obtenemos el ID de la meta
  const { goalId } = useLocalSearchParams<{ goalId: string }>();

  // 2. Traemos la función para guardar y la información actual de la meta
  const addTransaction = useAppStore((state) => state.addTransaction);
  const goal = useAppStore((state) => state.goals.find((g) => g.id === goalId));

  // 3. Estados locales
  const [amountStr, setAmountStr] = useState("");
  const [note, setNote] = useState("");

  // 4. Lógica de retiro (con validación estricta)
  const handleSave = () => {
    const amount = parseFloat(amountStr);

    // Validación 1: Que sea un número mayor a 0
    if (isNaN(amount) || amount <= 0) {
      alert("Por favor, ingresa una cantidad válida mayor a 0.");
      return;
    }

    // Validación 2: Que no retire más de lo que tiene (¡CRÍTICO!)
    if (goal && amount > goal.savedAmount) {
      alert(
        `No puedes retirar más de lo que tienes ahorrado (${currencySymbol}${goal.savedAmount.toLocaleString()}).`,
      );
      return;
    }

    // Guardamos la transacción como 'withdrawal' (retiro)
    addTransaction({
      id: Date.now().toString(),
      goalId: goalId as string,
      amount: amount,
      type: "withdrawal",
      note: note.trim(),
      date: new Date().toISOString(),
    });

    // Cerramos el modal
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: currentColors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* ENCABEZADO DEL MODAL */}
      <View
        style={[styles.header, { borderBottomColor: currentColors.border }]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerButton}
        >
          <Text
            style={[styles.cancelText, { color: currentColors.textSecondary }]}
          >
            Cancelar
          </Text>
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: currentColors.textPrimary }]}>
            Retirar dinero
          </Text>
          {goal && (
            <Text
              style={[styles.subtitle, { color: currentColors.textSecondary }]}
            >
              de {goal.name}
            </Text>
          )}
        </View>

        <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
          {/* Usamos el color 'danger' (rojo) para denotar que es una acción de retiro */}
          <Text style={[styles.saveText, { color: currentColors.danger }]}>
            Retirar
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={[styles.label, { color: currentColors.textSecondary }]}>
          Cantidad a retirar
        </Text>

        <AmountInput value={amountStr} onChangeText={setAmountStr} />

        <Input
          label="Nota"
          placeholder="¿Para qué es este retiro?"
          value={note}
          onChangeText={setNote}
        />

        <View style={styles.buttonWrapper}>
          {/* Botón en variante 'danger' para ser consistentes visualmente */}
          <Button
            title="Confirmar retiro"
            onPress={handleSave}
            variant="danger"
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerButton: { padding: 8 },
  cancelText: { fontSize: 16 },
  saveText: { fontSize: 16, fontWeight: "bold" },
  titleContainer: { alignItems: "center" },
  title: { fontSize: 18, fontWeight: "bold" },
  subtitle: { fontSize: 12, marginTop: 2 },
  content: { padding: 24, flex: 1 },
  label: { fontSize: 16, marginBottom: 8, fontWeight: "500" },
  buttonWrapper: { marginTop: "auto", marginBottom: 20 },
});
