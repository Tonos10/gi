// app/goal/[id].tsx
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

import { CircularProgress } from "../../components/CircularProgress";
import { IconButton } from "../../components/IconButton";
import { TransactionItem } from "../../components/TransactionItem";
import { colors } from "../../core/theme";
import { useAppStore } from "../../store/useAppStore";

export default function GoalDetailScreen() {
  const router = useRouter();
  const theme = useColorScheme() === "dark" ? "dark" : "light";
  const currentColors = colors[theme];

  // Extraemos el ID de la URL
  const { id } = useLocalSearchParams<{ id: string }>();

  // Buscamos la meta en el estado global
  const goal = useAppStore((state) => state.goals.find((g) => g.id === id));

  // 1. Traemos todas las transacciones sin alterar (evita el bucle infinito)
  const allTransactions = useAppStore((state) => state.transactions);

  // 2. Usamos useMemo para filtrar y ordenar en memoria de forma segura
  const transactions = useMemo(() => {
    return allTransactions
      .filter((t) => t.goalId === id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [allTransactions, id]);

  // Obtenemos el símbolo de moneda
  const currencySymbol = useAppStore((state) => state.settings.currencySymbol);

  // Pantalla de error si la meta no existe
  if (!goal) {
    return (
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: currentColors.background }]}
      >
        <View style={styles.errorContainer}>
          <Text style={{ color: currentColors.textPrimary }}>
            Meta no encontrada.
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginTop: 20 }}
          >
            <Text style={{ color: currentColors.brand }}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Cálculos matemáticos para el progreso
  const remainingAmount = goal.targetAmount - goal.savedAmount;
  const percentage =
    goal.targetAmount > 0
      ? Math.min(Math.round((goal.savedAmount / goal.targetAmount) * 100), 100)
      : 0;

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: currentColors.background }]}
    >
      {/* --- ENCABEZADO --- */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={[styles.backIcon, { color: currentColors.textPrimary }]}>
            ‹
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* --- ÍCONO Y TÍTULO --- */}
        <View style={styles.headerInfo}>
          <View
            style={[
              styles.bigIconContainer,
              { backgroundColor: currentColors.iconBackground },
            ]}
          >
            <Text style={styles.bigIcon}>{goal.icon || "🐷"}</Text>
          </View>
          <Text style={[styles.goalName, { color: currentColors.textPrimary }]}>
            {goal.name}
          </Text>
        </View>

        {/* --- RESUMEN DE SALDO --- */}
        <View style={styles.balanceContainer}>
          <Text
            style={[styles.savedAmount, { color: currentColors.textPrimary }]}
          >
            {currencySymbol}
            {goal.savedAmount.toLocaleString()}
          </Text>
          <Text
            style={[
              styles.targetAmount,
              { color: currentColors.textSecondary },
            ]}
          >
            guardado de {currencySymbol}
            {goal.targetAmount.toLocaleString()}
          </Text>
        </View>

        {/* --- GRÁFICO CIRCULAR --- */}
        <View style={styles.chartContainer}>
          <CircularProgress
            percentage={percentage}
            size={180}
            strokeWidth={16}
            label="completado"
          />
          <Text
            style={[
              styles.remainingText,
              { color: currentColors.textSecondary },
            ]}
          >
            {currencySymbol}
            {Math.max(0, remainingAmount).toLocaleString()} restante
          </Text>
        </View>

        {/* --- BOTONES DE ACCIÓN RAPIDA --- */}
        <View style={styles.actionButtons}>
          <IconButton
            label="Agregar"
            icon="+"
            colorKey="primary"
            onPress={() => router.push(`/(modals)/add-money?goalId=${goal.id}`)}
          />
          <IconButton
            label="Retirar"
            icon="↓"
            colorKey="danger"
            onPress={() =>
              router.push(`/(modals)/withdraw-money?goalId=${goal.id}`)
            }
          />
          <IconButton
            label="Editar"
            icon="✎"
            colorKey="brand"
            onPress={() => router.push(`/(modals)/edit-goal?goalId=${goal.id}`)}
          />
        </View>

        {/* --- TRANSACCIONES RECIENTES --- */}
        <View style={styles.transactionsSection}>
          <View style={styles.transactionsHeader}>
            <Text
              style={[
                styles.sectionTitle,
                { color: currentColors.textPrimary },
              ]}
            >
              Transacciones recientes
            </Text>
            {transactions.length > 3 && (
              <TouchableOpacity>
                <Text
                  style={[styles.seeAllText, { color: currentColors.brand }]}
                >
                  Ver todo ›
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {transactions.length === 0 ? (
            <View
              style={[
                styles.emptyTransactions,
                {
                  backgroundColor: currentColors.surface,
                  borderColor: currentColors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.emptyTransactionsText,
                  { color: currentColors.textSecondary },
                ]}
              >
                ⌂ No hay transacciones aún.
              </Text>
            </View>
          ) : (
            transactions
              .slice(0, 5)
              .map((transaction) => (
                <TransactionItem
                  key={transaction.id}
                  transaction={transaction}
                />
              ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  errorContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10 },
  backButton: { width: 40, height: 40, justifyContent: "center" },
  backIcon: { fontSize: 36, lineHeight: 40 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  headerInfo: { alignItems: "center", marginBottom: 24 },
  bigIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  bigIcon: { fontSize: 40 },
  goalName: { fontSize: 24, fontWeight: "bold" },
  balanceContainer: { alignItems: "center", marginBottom: 32 },
  savedAmount: { fontSize: 40, fontWeight: "bold", marginBottom: 4 },
  targetAmount: { fontSize: 16 },
  chartContainer: { alignItems: "center", marginBottom: 40 },
  remainingText: { marginTop: 16, fontSize: 14 },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 40,
  },
  transactionsSection: { marginTop: 10 },
  transactionsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold" },
  seeAllText: { fontSize: 14, fontWeight: "500" },
  emptyTransactions: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: "dashed",
    alignItems: "center",
  },
  emptyTransactionsText: { fontSize: 14 },
});
