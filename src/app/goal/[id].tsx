// src/app/goal/[id].tsx
//
// Pantalla de detalle de una meta financiera.
// Punto 1 → SafeAreaView importado desde 'react-native-safe-area-context'
// Punto 2 → Rediseño completo con tema claro y oscuro dinámico usando current_colors
// Punto 4 → Variables en snake_case, comentarios bilingüe inglés/español

import { GlassView } from "expo-glass-effect";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CircularProgress } from "../../components/CircularProgress";
import { TransactionItem } from "../../components/TransactionItem";
import { useAppTheme } from "../../hooks/useAppTheme";
import { useAppStore } from "../../store/useAppStore";

// ─── Helper — formatea montos con siempre 2 decimales ─────────────────────────
const format_currency = (amount: number, symbol: string): string =>
  `${symbol}${amount.toLocaleString("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

// ─── Componente: Botón de acción circular ─────────────────────────────────────
interface ActionBtn_Props {
  label: string;
  icon: string;
  bg_color: string;
  on_press: () => void;
  btn_id: string;
  text_color: string;
  shadow_color: string;
}

const ActionCircleButton = ({
  label,
  icon,
  bg_color,
  on_press,
  btn_id,
  text_color,
  shadow_color,
}: ActionBtn_Props) => (
  <View style={action_styles.wrapper}>
    <TouchableOpacity
      id={btn_id}
      style={[
        action_styles.circle,
        { backgroundColor: bg_color, shadowColor: shadow_color },
      ]}
      onPress={on_press}
      activeOpacity={0.82}
    >
      <Text style={action_styles.icon_text}>{icon}</Text>
    </TouchableOpacity>
    <Text style={[action_styles.label_text, { color: text_color }]}>
      {label}
    </Text>
  </View>
);

const action_styles = StyleSheet.create({
  wrapper: { alignItems: "center", marginHorizontal: 14 },
  circle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 5,
  },
  icon_text: { fontSize: 26, color: "#FFFFFF", fontWeight: "700" },
  label_text: { fontSize: 13, fontWeight: "600" },
});


// ─── Componente principal ──────────────────────────────────────────────────────

export default function GoalDetailScreen() {
  const router = useRouter();
  const { theme, current_colors } = useAppTheme();

  // Estado para expandir las transacciones
  const [show_all_transactions, set_show_all_transactions] = useState(false);

  // Extraemos el ID de la URL
  const { id } = useLocalSearchParams<{ id: string }>();

  // Buscamos la meta en el estado global
  const goal = useAppStore((state) => state.goals.find((g) => g.id === id));

  // Traemos transacciones sin alterar el selector
  const all_transactions = useAppStore((state) => state.transactions);

  // Filtramos y ordenamos de forma segura con useMemo
  const goal_transactions = useMemo(
    () =>
      all_transactions
        .filter((t) => t.goalId === id)
        .sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        ),
    [all_transactions, id],
  );

  const transactions_to_show = show_all_transactions
    ? goal_transactions
    : goal_transactions.slice(0, 5);

  // Símbolo de moneda desde configuración
  const currency_symbol = useAppStore((state) => state.settings.currencySymbol);

  // Generamos los estilos inyectando el tema actual
  const styles = useMemo(() => get_styles(current_colors), [current_colors]);

  // ── Pantalla de error si la meta no existe ──────────────────────────────────
  if (!goal) {
    return (
      <SafeAreaView
        style={[
          styles.safe_area,
          { backgroundColor: current_colors.background },
        ]}
      >
        <View style={styles.error_container}>
          <Text style={styles.error_emoji}>🔍</Text>
          <Text style={styles.error_text}>Meta no encontrada.</Text>
          <TouchableOpacity
            id="btn-back-error"
            onPress={() => router.back()}
            style={styles.error_back_btn}
          >
            <Text style={styles.error_back_text}>← Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Cálculos de progreso ───────────────────────────
  const remaining_amount = Math.max(0, goal.targetAmount - goal.savedAmount);
  const progress_pct =
    goal.targetAmount > 0
      ? Math.min(Math.round((goal.savedAmount / goal.targetAmount) * 100), 100)
      : 0;

  const saved_formatted = format_currency(goal.savedAmount, currency_symbol);
  const target_formatted = format_currency(goal.targetAmount, currency_symbol);
  const remaining_formatted = format_currency(
    remaining_amount,
    currency_symbol,
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView
      style={[styles.safe_area, { backgroundColor: current_colors.background }]}
    >
      <ScrollView
        style={{ flex: 1, backgroundColor: current_colors.background }}
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
        bounces={false}
        contentContainerStyle={[
          styles.scroll_content,
          { backgroundColor: current_colors.background },
        ]}
      >
        {/* SECCIÓN 1: Hero / Encabezado con imagen de alcancía */}
        {goal.photoUri ? (
          <ImageBackground
            source={{ uri: goal.photoUri }}
            style={styles.hero_container}
            resizeMode="cover"
            blurRadius={3}
          >
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: "rgba(0,0,0,0.48)" },
              ]}
            />
            <TouchableOpacity
              id="btn-back-goal-detail"
              style={styles.back_btn}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Text style={[styles.back_btn_text, { color: "#FFFFFF" }]}>
                ‹
              </Text>
            </TouchableOpacity>

            <View style={styles.hero_text_content}>
              <GlassView
                style={styles.hero_title_backdrop}
                glassEffectStyle={{
                  style: "clear",
                  animate: true,
                  animationDuration: 0.3,
                }}
                colorScheme="dark"
                tintColor="rgba(0,0,0,0.34)"
              >
                <Text style={[styles.hero_title, { color: "#FFFFFF" }]}>
                  {goal.name}
                </Text>
                <Text
                  style={[
                    styles.hero_subtitle,
                    { color: "rgba(255,255,255,0.84)" },
                  ]}
                >
                  Meta de ahorro
                </Text>
              </GlassView>
            </View>
          </ImageBackground>
        ) : (
          <View
            style={[
              styles.hero_container,
              { backgroundColor: current_colors.bg_hero },
            ]}
          >
            <TouchableOpacity
              id="btn-back-goal-detail"
              style={styles.back_btn}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Text style={styles.back_btn_text}>‹</Text>
            </TouchableOpacity>

            <View style={styles.hero_icon_ring_centered}>
              <View style={styles.hero_emoji_container}>
                <Text style={styles.hero_emoji}>🐷</Text>
              </View>
            </View>

            <View style={styles.hero_text_content}>
              <GlassView
                style={[
                  styles.hero_title_backdrop,
                  styles.hero_title_backdrop_solid,
                ]}
                glassEffectStyle={{
                  style: "regular",
                  animate: true,
                  animationDuration: 0.25,
                }}
                colorScheme={theme === "dark" ? "dark" : "light"}
                tintColor="rgba(255,255,255,0.14)"
              >
                <Text
                  style={[
                    styles.hero_title,
                    { color: current_colors.textPrimary },
                  ]}
                >
                  {goal.name}
                </Text>
                <Text
                  style={[
                    styles.hero_subtitle,
                    { color: current_colors.textSecondary },
                  ]}
                >
                  Meta de ahorro
                </Text>
              </GlassView>
            </View>
          </View>
        )}

        {/* SECCIÓN 2: Tarjeta blanca de detalles */}
        <View style={styles.details_card}>
          <Text style={styles.card_amount_main}>{saved_formatted}</Text>
          <Text style={styles.card_amount_sub}>
            guardado de{" "}
            <Text style={styles.card_amount_sub_bold}>{target_formatted}</Text>
          </Text>

          <View style={styles.card_divider} />

          <View style={styles.chart_wrapper}>
            <CircularProgress
              percentage={progress_pct}
              size={180}
              strokeWidth={14}
              label="completado"
            />
          </View>

          <View style={styles.remaining_chip}>
            <Text style={styles.remaining_label}>Restante</Text>
            <Text style={styles.remaining_value}>{remaining_formatted}</Text>
          </View>
        </View>

        {/* SECCIÓN 3: Tres botones de acción circulares */}
        <View style={styles.action_row}>
          <ActionCircleButton
            btn_id="btn-add-money"
            label="Agregar"
            icon="+"
            bg_color={current_colors.primary}
            text_color={current_colors.textPrimary}
            shadow_color={current_colors.shadow_color}
            on_press={() =>
              router.push(`/(modals)/add-money?goalId=${goal.id}`)
            }
          />
          <ActionCircleButton
            btn_id="btn-withdraw-money"
            label="Retirar"
            icon="↓"
            bg_color={current_colors.danger}
            text_color={current_colors.textPrimary}
            shadow_color={current_colors.shadow_color}
            on_press={() =>
              router.push(`/(modals)/withdraw-money?goalId=${goal.id}`)
            }
          />
          <ActionCircleButton
            btn_id="btn-edit-goal"
            label="Editar"
            icon="✎"
            bg_color={current_colors.brand}
            text_color={current_colors.textPrimary}
            shadow_color={current_colors.shadow_color}
            on_press={() =>
              router.push(`/(modals)/edit-goal?goalId=${goal.id}`)
            }
          />
        </View>

        {/* SECCIÓN 4: Tarjeta de transacciones recientes */}
        <View style={styles.transactions_card}>
          <View style={styles.tx_header_row}>
            <Text style={styles.tx_section_title}>Transacciones recientes</Text>
            {goal_transactions.length > 5 && (
              <TouchableOpacity
                id="btn-see-all-transactions"
                activeOpacity={0.7}
                onPress={() =>
                  set_show_all_transactions(!show_all_transactions)
                }
              >
                <Text style={styles.tx_see_all}>
                  {show_all_transactions ? "Ocultar ‹" : "Ver todo ›"}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {goal_transactions.length === 0 ? (
            <View style={styles.tx_empty_box}>
              <Text style={styles.tx_empty_icon}>💳</Text>
              <Text style={styles.tx_empty_text}>
                No hay transacciones aún.
              </Text>
              <Text style={styles.tx_empty_hint}>
                Agrega dinero para comenzar tu meta
              </Text>
            </View>
          ) : (
            <View style={styles.tx_list_wrapper}>
              {transactions_to_show.map((tx_item) => (
                <TransactionItem key={tx_item.id} transaction={tx_item} />
              ))}
            </View>
          )}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Estilos dinámicos ───────────────────────────────────────────────────────
const get_styles = (theme_colors: any) =>
  StyleSheet.create({
    safe_area: {
      flex: 1,
    },
    scroll_content: {
      paddingBottom: 20,
    },
    error_container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 40,
    },
    error_emoji: { fontSize: 48, marginBottom: 16 },
    error_text: {
      fontSize: 18,
      fontWeight: "600",
      color: theme_colors.textPrimary,
      marginBottom: 20,
    },
    error_back_btn: {
      backgroundColor: theme_colors.brand,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 12,
    },
    error_back_text: { color: "#FFFFFF", fontWeight: "700", fontSize: 15 },

    hero_container: {
      minHeight: 240,
      paddingTop: 16,
      paddingBottom: 40,
      paddingHorizontal: 24,
      justifyContent: "flex-end",
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
      position: "relative",
      overflow: "hidden",
    },
    back_btn: {
      position: "absolute",
      top: 16,
      left: 16,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "rgba(0,0,0,0.15)",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 10,
    },
    back_btn_text: {
      fontSize: 28,
      color: theme_colors.textPrimary,
      lineHeight: 34,
      fontWeight: "300",
    },
    coin_badge: {
      position: "absolute",
      top: 18,
      right: 20,
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: "rgba(245,158,11,0.15)",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 10,
    },
    coin_emoji: { fontSize: 20 },
    hero_icon_ring_centered: {
      width: 116,
      height: 116,
      borderRadius: 58,
      backgroundColor: theme_colors.surface,
      alignItems: "center",
      justifyContent: "center",
      alignSelf: "center",
      marginTop: 32,
      marginBottom: 24,
      shadowColor: theme_colors.shadow_color,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 4,
    },
    hero_emoji_container: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: theme_colors.iconBackground,
      alignItems: "center",
      justifyContent: "center",
    },
    hero_emoji: { fontSize: 52 },
    hero_text_content: {
      marginTop: "auto",
      alignItems: "flex-start",
      zIndex: 10,
    },
    hero_title_backdrop: {
      alignSelf: "flex-start",
      backgroundColor: "rgba(255,255,255,0.14)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.28)",
      paddingHorizontal: 18,
      paddingVertical: 14,
      borderRadius: 24,
      maxWidth: "94%",
      overflow: "hidden",
    },
    hero_title_backdrop_solid: {
      backgroundColor: "rgba(255,255,255,0.16)",
      borderColor: "rgba(255,255,255,0.24)",
    },
    hero_title: {
      fontSize: 31,
      fontWeight: "800",
      letterSpacing: -0.7,
      marginBottom: 5,
      textAlign: "left",
      textShadowColor: "rgba(0,0,0,0.78)",
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 8,
    },
    hero_subtitle: {
      fontSize: 13,
      fontWeight: "500",
      letterSpacing: 0.3,
      textTransform: "uppercase",
      textAlign: "left",
    },

    details_card: {
      marginHorizontal: 20,
      marginTop: -24,
      backgroundColor: theme_colors.surface,
      borderRadius: 24,
      padding: 24,
      alignItems: "center",
      shadowColor: theme_colors.shadow_color,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.08,
      shadowRadius: 16,
      elevation: 6,
      zIndex: 5,
    },
    card_amount_main: {
      fontSize: 42,
      fontWeight: "800",
      color: theme_colors.textPrimary,
      letterSpacing: -1,
      marginBottom: 6,
    },
    card_amount_sub: {
      fontSize: 15,
      color: theme_colors.textSecondary,
      fontWeight: "400",
      marginBottom: 4,
    },
    card_amount_sub_bold: {
      fontWeight: "700",
      color: theme_colors.textPrimary,
    },
    card_divider: {
      width: "100%",
      height: 1,
      backgroundColor: theme_colors.border,
      marginVertical: 20,
    },
    chart_wrapper: {
      marginBottom: 20,
    },
    remaining_chip: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme_colors.background,
      paddingHorizontal: 18,
      paddingVertical: 10,
      borderRadius: 30,
      gap: 8,
    },
    remaining_label: {
      fontSize: 13,
      color: theme_colors.textSecondary,
      fontWeight: "500",
    },
    remaining_value: {
      fontSize: 14,
      fontWeight: "700",
      color: theme_colors.textPrimary,
    },

    action_row: {
      flexDirection: "row",
      justifyContent: "center",
      marginTop: 24,
      marginBottom: 24,
      paddingHorizontal: 20,
    },

    transactions_card: {
      marginHorizontal: 20,
      backgroundColor: theme_colors.surface,
      borderRadius: 24,
      overflow: "hidden",
      shadowColor: theme_colors.shadow_color,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
      elevation: 4,
    },
    tx_header_row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 12,
    },
    tx_section_title: {
      fontSize: 17,
      fontWeight: "700",
      color: theme_colors.textPrimary,
      letterSpacing: -0.2,
    },
    tx_see_all: {
      fontSize: 14,
      fontWeight: "600",
      color: theme_colors.brand,
    },
    tx_empty_box: {
      backgroundColor: theme_colors.bg_empty,
      margin: 16,
      borderRadius: 16,
      paddingVertical: 32,
      alignItems: "center",
    },
    tx_empty_icon: {
      fontSize: 36,
      marginBottom: 12,
    },
    tx_empty_text: {
      fontSize: 15,
      fontWeight: "600",
      color: theme_colors.textSecondary,
      marginBottom: 6,
    },
    tx_empty_hint: {
      fontSize: 13,
      color: theme_colors.text_muted,
      textAlign: "center",
      paddingHorizontal: 24,
    },
    tx_list_wrapper: {
      paddingBottom: 8,
    },
  });
