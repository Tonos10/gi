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

export default function AddMoneyModal() {
  const router = useRouter();
  const theme = useColorScheme() === "dark" ? "dark" : "light";
  const currentColors = colors[theme];

  const { goalId } = useLocalSearchParams<{ goalId: string }>();

  const addTransaction = useAppStore((state) => state.addTransaction);
  const goal = useAppStore((state) => state.goals.find((g) => g.id === goalId));

  const [amountStr, setAmountStr] = useState("");
  const [note, setNote] = useState("");

  const handleSave = () => {
    const amount = parseFloat(amountStr);

    if (isNaN(amount) || amount <= 0) {
      alert("Por favor, ingresa una cantidad válida mayor a 0.");
      return;
    }

    addTransaction({
      id: Date.now().toString(),
      goalId: goalId as string,
      amount: amount,
      type: "deposit",
      note: note.trim(),
      date: new Date().toISOString(),
    });

    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: currentColors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
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
            Agregar dinero
          </Text>
          {goal && (
            <Text
              style={[styles.subtitle, { color: currentColors.textSecondary }]}
            >
              a {goal.name}
            </Text>
          )}
        </View>

        <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
          <Text style={[styles.saveText, { color: currentColors.primary }]}>
            Agregar
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={[styles.label, { color: currentColors.textSecondary }]}>
          Cantidad a agregar
        </Text>

        <AmountInput value={amountStr} onChangeText={setAmountStr} />

        <Input
          label="Nota (opcional)"
          placeholder="¿De dónde viene este dinero?"
          value={note}
          onChangeText={setNote}
        />

        <View style={styles.buttonWrapper}>
          <Button
            title="Confirmar depósito"
            onPress={handleSave}
            variant="primary"
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
