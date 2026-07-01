// src/app/goal/new-goal.tsx
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { SwitchRow } from "../../components/SwitchRow";
import { useAppTheme } from "../../hooks/useAppTheme";
import { useGoalImagePicker } from "../../hooks/useGoalImagePicker";
import { useAppStore } from "../../store/useAppStore";

export default function NewGoalScreen() {
  const router = useRouter();

  // ── Theme Dinámico ──
  const { theme, current_colors } = useAppTheme();
  const styles = useMemo(
    () => get_styles(current_colors, theme),
    [current_colors, theme],
  );

  const add_goal = useAppStore((state) => state.addGoal);
  const currency_symbol = useAppStore((state) => state.settings.currencySymbol);

  // ── States (Strict snake_case) ──
  const [modal_visible, set_modal_visible] = useState(true);
  const [meta_nombre, set_meta_nombre] = useState("");
  const [meta_ahorro, set_meta_ahorro] = useState("");
  const [ahorro_inicial, set_ahorro_inicial] = useState("");

  // States del recordatorio
  const [recordatorio_activo, set_recordatorio_activo] = useState(false);
  const [dias_seleccionados, set_dias_seleccionados] = useState<number[]>([]);

  // States de Fecha Objetivo (Nueva Funcionalidad)
  const [tiene_fecha_objetivo, set_tiene_fecha_objetivo] = useState(false);
  const [fecha_objetivo, set_fecha_objetivo] = useState(new Date());
  const [mostrar_calendario, set_mostrar_calendario] = useState(false);

  // ── Hooks ──
  const {
    photoUri: foto_uri,
    isLoading: is_image_loading,
    pickImage: pick_image,
    removeImage: remove_image,
  } = useGoalImagePicker();

  // ── Handlers ──
  const close_modal_handler = () => {
    set_modal_visible(false);
    setTimeout(() => router.back(), 250);
  };

  const fecha_objetivo_change_handler = (
    _event: unknown,
    selected_date?: Date,
  ) => {
    if (!selected_date) return;
    if (Platform.OS !== "ios") {
      set_mostrar_calendario(false);
    }
    set_fecha_objetivo(selected_date);
  };

  const dismiss_calendario_handler = () => {
    set_mostrar_calendario(false);
  };

  const toggle_dia_handler = (dia: number) => {
    if (dias_seleccionados.includes(dia)) {
      set_dias_seleccionados(dias_seleccionados.filter((d) => d !== dia));
    } else {
      set_dias_seleccionados(
        [...dias_seleccionados, dia].sort((a, b) => a - b),
      );
    }
  };

  const guardar_meta_handler = () => {
    if (!meta_nombre.trim() || !meta_ahorro.trim()) {
      Alert.alert(
        "Error",
        "Por favor, ingresa el nombre y tu objetivo financiero.",
      );
      return;
    }

    add_goal({
      id: Date.now().toString(),
      name: meta_nombre.trim(),
      targetAmount: parseFloat(meta_ahorro) || 0,
      savedAmount: parseFloat(ahorro_inicial) || 0,
      icon: "🐷",
      photoUri: foto_uri ?? null,
      hasTargetDate: tiene_fecha_objetivo,
      hasReminder: recordatorio_activo,
      reminderDays: dias_seleccionados,
      createdAt: new Date().toISOString(),
    });

    close_modal_handler();
  };

  // ── Renders Secundarios ──
  const render_dias_grid = () => {
    const days_array = Array.from({ length: 31 }, (_, i) => i + 1);

    return (
      <View style={styles.grid_container}>
        {days_array.map((dia) => {
          const is_selected = dias_seleccionados.includes(dia);
          return (
            <TouchableOpacity
              key={dia}
              style={[
                styles.dia_btn,
                {
                  backgroundColor: is_selected
                    ? current_colors.brand
                    : current_colors.iconBackground,
                  borderColor: is_selected
                    ? current_colors.brand
                    : current_colors.border,
                },
              ]}
              onPress={() => toggle_dia_handler(dia)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.dia_text,
                  {
                    color: is_selected ? "#FFFFFF" : current_colors.textPrimary,
                  },
                ]}
              >
                {dia}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  // ── UI Render ──
  return (
    <Modal
      visible={modal_visible}
      transparent={true}
      animationType="slide"
      onRequestClose={close_modal_handler}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.modal_overlay}>
          <SafeAreaView style={styles.safe_area_wrapper}>
            <View style={styles.floating_window}>
              <View style={styles.header_container}>
                <Text style={styles.header_title}>Crear Nueva Meta</Text>
                <TouchableOpacity
                  style={styles.close_btn}
                  onPress={close_modal_handler}
                >
                  <Text style={styles.close_icon}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                style={{ flexShrink: 1 }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scroll_content}
              >
                {/* 1. Cambio de Foto/Icono */}
                <TouchableOpacity
                  style={styles.image_picker_btn}
                  onPress={pick_image}
                  activeOpacity={0.8}
                >
                  {foto_uri ? (
                    <>
                      <Image
                        key={foto_uri}
                        source={{ uri: foto_uri }}
                        style={styles.image_preview}
                        resizeMode="cover"
                      />
                      <TouchableOpacity
                        onPress={remove_image}
                        style={styles.remove_btn}
                      >
                        <Text style={styles.remove_icon}>✕</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <View style={styles.placeholder_container}>
                      {is_image_loading ? (
                        <ActivityIndicator color={current_colors.brand} />
                      ) : (
                        <Text style={styles.image_placeholder}>📷</Text>
                      )}
                    </View>
                  )}
                </TouchableOpacity>

                {/* 2. Información Principal (Card Design) */}
                <View style={styles.section}>
                  <Text style={styles.section_title}>
                    INFORMACIÓN PRINCIPAL
                  </Text>
                  <View style={styles.card}>
                    <View style={[styles.input_row, styles.border_bottom]}>
                      <TextInput
                        style={styles.text_input_plain}
                        placeholder="Nombre de la meta"
                        placeholderTextColor={current_colors.textSecondary}
                        value={meta_nombre}
                        onChangeText={set_meta_nombre}
                      />
                    </View>
                    <View style={[styles.input_row, styles.border_bottom]}>
                      <TextInput
                        style={styles.text_input_plain}
                        placeholder={`${currency_symbol} Objetivo financiero`}
                        placeholderTextColor={current_colors.textSecondary}
                        keyboardType="numeric"
                        value={meta_ahorro}
                        onChangeText={set_meta_ahorro}
                      />
                    </View>
                    <View style={styles.input_row}>
                      <TextInput
                        style={styles.text_input_plain}
                        placeholder={`${currency_symbol} Ahorro inicial (opcional)`}
                        placeholderTextColor={current_colors.textSecondary}
                        keyboardType="numeric"
                        value={ahorro_inicial}
                        onChangeText={set_ahorro_inicial}
                      />
                    </View>
                  </View>
                </View>

                {/* 3. Planificación (Card Design) */}
                <View style={styles.section}>
                  <Text style={styles.section_title}>PLANIFICACIÓN</Text>
                  <View style={styles.card}>
                    <View style={styles.switch_row_wrapper}>
                      <SwitchRow
                        label="Establecer fecha de cumplimiento"
                        value={tiene_fecha_objetivo}
                        onValueChange={set_tiene_fecha_objetivo}
                      />
                    </View>

                    {tiene_fecha_objetivo && (
                      <View style={styles.date_picker_container}>
                        <Text style={styles.reminder_info_text}>
                          Selecciona la fecha en la que planeas cumplir esta
                          meta:
                        </Text>
                        <TouchableOpacity
                          style={styles.date_picker_btn}
                          onPress={() => set_mostrar_calendario(true)}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.date_picker_text}>
                            📅 {fecha_objetivo.toLocaleDateString()}
                          </Text>
                        </TouchableOpacity>

                        {mostrar_calendario && (
                          <DateTimePicker
                            value={fecha_objetivo}
                            mode="date"
                            display="default"
                            onValueChange={fecha_objetivo_change_handler}
                            onDismiss={dismiss_calendario_handler}
                            minimumDate={new Date()}
                          />
                        )}
                      </View>
                    )}
                  </View>
                </View>

                {/* 4. RECORDATORIOS Y DÍAS DE AHORRO (Card Design) */}
                <View style={styles.section}>
                  <Text style={styles.section_title}>RECORDATORIOS</Text>
                  <View style={styles.card}>
                    <View style={styles.switch_row_wrapper}>
                      <SwitchRow
                        label="Recuérdame ahorrar"
                        value={recordatorio_activo}
                        onValueChange={set_recordatorio_activo}
                      />
                    </View>

                    {recordatorio_activo && (
                      <View style={styles.reminder_container}>
                        <Text style={styles.reminder_info_text}>
                          Selecciona los días del mes para recibir tu
                          recordatorio:
                        </Text>
                        {render_dias_grid()}
                      </View>
                    )}
                  </View>
                </View>
              </ScrollView>

              <View style={styles.footer_anchored}>
                <TouchableOpacity
                  style={styles.save_btn}
                  onPress={guardar_meta_handler}
                  activeOpacity={0.85}
                >
                  <Text style={styles.save_text}>Guardar Meta</Text>
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ── Styles (Rediseñados para consistencia con Settings) ──
const get_styles = (theme_colors: any, theme: string) =>
  StyleSheet.create({
    modal_overlay: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "transparent",
    },
    safe_area_wrapper: {
      flex: 1,
      width: "100%",
      justifyContent: "center",
      alignItems: "center",
    },
    keyboard_wrapper: {
      width: "100%",
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    floating_window: {
      width: "90%",
      maxHeight: "90%",
      flexShrink: 1,
      borderRadius: 24,
      backgroundColor: theme_colors.surface,
      overflow: "hidden",
    },
    header_container: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 20,
      paddingHorizontal: 24,
      position: "relative",
    },
    header_title: {
      fontSize: 18,
      fontWeight: "800",
      color: theme_colors.textPrimary,
    },
    close_btn: {
      position: "absolute",
      right: 20,
      padding: 8,
    },
    close_icon: {
      fontSize: 20,
      fontWeight: "700",
      color: theme_colors.textSecondary,
    },
    scroll_content: {
      paddingHorizontal: 20,
      paddingBottom: 30,
    },
    footer_anchored: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme_colors.border,
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: theme_colors.surface,
    },
    image_picker_btn: {
      width: 90,
      height: 90,
      borderRadius: 45,
      alignSelf: "center",
      marginBottom: 24,
      marginTop: 8,
      justifyContent: "center",
      alignItems: "center",
      overflow: "hidden",
      backgroundColor: theme_colors.iconBackground,
    },
    image_preview: {
      width: "100%",
      height: "100%",
    },
    placeholder_container: {
      width: "100%",
      height: "100%",
      justifyContent: "center",
      alignItems: "center",
    },
    image_placeholder: {
      fontSize: 34,
    },
    remove_btn: {
      position: "absolute",
      top: 4,
      right: 4,
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme_colors.danger,
    },
    remove_icon: {
      color: "#FFFFFF",
      fontSize: 12,
      fontWeight: "800",
    },

    // Section and Card styles (Same as Settings)
    section: {
      marginBottom: 24,
    },
    section_title: {
      fontSize: 13,
      fontWeight: "600",
      color: theme_colors.textSecondary,
      marginBottom: 8,
      marginLeft: 12,
      letterSpacing: 0.5,
    },
    card: {
      backgroundColor: theme_colors.surface,
      borderRadius: 16,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: theme_colors.border,
      shadowColor: theme_colors.shadow_color,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    border_bottom: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme_colors.border,
    },
    input_row: {
      paddingHorizontal: 16,
      paddingVertical: 4,
    },
    text_input_plain: {
      height: 48,
      fontSize: 16,
      fontWeight: "500",
      color: theme_colors.textPrimary,
    },
    switch_row_wrapper: {
      paddingHorizontal: 16,
      paddingVertical: 8,
    },

    // Date Picker UI
    date_picker_container: {
      paddingHorizontal: 16,
      paddingBottom: 16,
    },
    date_picker_btn: {
      height: 52,
      borderWidth: 1,
      borderColor: theme_colors.border,
      backgroundColor: theme_colors.background,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 8,
    },
    date_picker_text: {
      fontSize: 16,
      fontWeight: "700",
      color: theme_colors.brand,
    },

    // Reminder days UI
    reminder_container: {
      paddingHorizontal: 16,
      paddingBottom: 16,
    },
    reminder_info_text: {
      fontSize: 13,
      lineHeight: 18,
      marginBottom: 12,
      textAlign: "center",
      color: theme_colors.textSecondary,
    },
    grid_container: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      justifyContent: "center",
    },
    dia_btn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    dia_text: {
      fontSize: 14,
      fontWeight: "600",
    },

    // Footer Button UI
    save_btn: {
      height: 54,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme_colors.brand,
      shadowColor: theme_colors.shadow_color,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 5,
    },
    save_text: {
      color: "#FFFFFF",
      fontSize: 17,
      fontWeight: "700",
    },
  });
