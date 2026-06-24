// app/(modals)/edit-goal.tsx
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

// IMPORTACIONES RESTAURADAS Y CORREGIDAS
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { SwitchRow } from "../../components/SwitchRow";
import { colors } from "../../core/theme";
import { useAppStore } from "../../store/useAppStore";

export default function EditGoalModal() {
  const router = useRouter();

  // Solución estricta para el modo oscuro/claro
  const theme = useColorScheme();
  const currentColors = colors[theme === "dark" ? "dark" : "light"];

  const { goalId } = useLocalSearchParams<{ goalId: string }>();

  const { goals, updateGoal, deleteGoal } = useAppStore();
  const goal = goals.find((g) => g.id === goalId);

  // Inicializamos el estado SIN usar useEffect (esto arregla el error de ESLint)
  const [name, setName] = useState(goal?.name || "");
  const [targetAmount, setTargetAmount] = useState(
    goal?.targetAmount?.toString() || "",
  );
  const [hasTargetDate, setHasTargetDate] = useState(
    goal?.hasTargetDate || false,
  );
  const [hasReminder, setHasReminder] = useState(goal?.hasReminder || false);

  if (!goal) {
    return null;
  }

  const handleSave = () => {
    if (!name.trim() || !targetAmount.trim()) {
      alert("Por favor, ingresa el nombre y el monto objetivo.");
      return;
    }

    updateGoal(goal.id, {
      name: name.trim(),
      targetAmount: parseFloat(targetAmount) || 0,
      hasTargetDate,
      hasReminder,
    });

    router.back();
  };

  const handleDelete = () => {
    Alert.alert(
      "Eliminar meta",
      "¿Estás seguro de que deseas eliminar esta meta? Todo el historial asociado se perderá.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => {
            deleteGoal(goal.id);
            router.replace("/"); // Ruta corregida para Expo Router
          },
        },
      ],
    );
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
          Editar meta
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text
          style={[styles.sectionTitle, { color: currentColors.textSecondary }]}
        >
          Información de la meta
        </Text>

        <Input
          placeholder="Nombre de la meta"
          value={name}
          onChangeText={setName}
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

        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={[styles.deleteText, { color: currentColors.danger }]}>
            Eliminar meta
          </Text>
        </TouchableOpacity>

        <View style={styles.buttonContainer}>
          <Button title="Guardar" onPress={handleSave} variant="brand" />
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
  deleteButton: {
    marginTop: 32,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FFEBEE",
    borderRadius: 12,
    backgroundColor: "#FFEBEE",
  },
  deleteText: { fontSize: 16, fontWeight: "600" },
  buttonContainer: { marginTop: 24, marginBottom: 40 },
});
