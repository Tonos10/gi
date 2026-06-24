// app/new-goal.tsx
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

// IMPORTACIONES RESTAURADAS Y CORREGIDAS
import { colors } from "../../core/theme";
import { useAppStore } from "../../store/useAppStore";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import { SwitchRow } from "../../components/SwitchRow";

export default function NewGoalScreen() {
  const router = useRouter();

  // Solución estricta para el modo oscuro/claro
  const theme = useColorScheme();
  const currentColors = colors[theme === "dark" ? "dark" : "light"];

  const addGoal = useAppStore((state) => state.addGoal);

  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [savedAmount, setSavedAmount] = useState("");
  const [hasTargetDate, setHasTargetDate] = useState(false);
  const [hasReminder, setHasReminder] = useState(false);

  const handleSave = () => {
    if (!name.trim() || !targetAmount.trim()) {
      alert("Por favor, ingresa el nombre y el monto objetivo.");
      return;
    }

    const newGoal = {
      id: Date.now().toString(),
      name: name.trim(),
      targetAmount: parseFloat(targetAmount) || 0,
      savedAmount: parseFloat(savedAmount) || 0,
      icon: "🐷",
      hasTargetDate,
      hasReminder,
      createdAt: new Date().toISOString(),
    };

    addGoal(newGoal);
    router.back();
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: currentColors.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.closeButton}
        >
          <Text
            style={[styles.closeIcon, { color: currentColors.textPrimary }]}
          >
            ✕
          </Text>
        </TouchableOpacity>
        <Text
          style={[styles.headerTitle, { color: currentColors.textPrimary }]}
        >
          Nueva meta
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Input
          label="Información de la meta"
          placeholder="Ingresa el nombre de la meta"
          value={name}
          onChangeText={setName}
          autoFocus
        />

        <Text
          style={[styles.sectionTitle, { color: currentColors.textSecondary }]}
        >
          Detalles financieros
        </Text>

        <Input
          placeholder="$ Goal Amount"
          keyboardType="numeric"
          value={targetAmount}
          onChangeText={setTargetAmount}
        />

        <Input
          placeholder="$ Saved Amount (Optional)"
          keyboardType="numeric"
          value={savedAmount}
          onChangeText={setSavedAmount}
        />

        <Text
          style={[styles.sectionTitle, { color: currentColors.textSecondary }]}
        >
          Configuración adicional
        </Text>

        <SwitchRow
          label="Establecer una fecha objetivo"
          value={hasTargetDate}
          onValueChange={setHasTargetDate}
        />

        <SwitchRow
          label="Recuérdame ahorrar"
          value={hasReminder}
          onValueChange={setHasReminder}
        />

        <View style={styles.buttonContainer}>
          <Button title="Guardar meta" onPress={handleSave} variant="brand" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
  },
  closeButton: { width: 40, height: 40, justifyContent: "center" },
  closeIcon: { fontSize: 20, fontWeight: "600" },
  headerTitle: { fontSize: 20, fontWeight: "bold" },
  scrollContent: { paddingHorizontal: 20, paddingTop: 10 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 12,
    textTransform: "uppercase",
  },
  buttonContainer: { marginTop: 32 },
});
