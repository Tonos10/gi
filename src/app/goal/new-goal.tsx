// src/app/goal/new-goal.tsx
/**
 * NewGoalScreen — Bottom Sheet interactivo con dos snap points.
 *
 * Arquitectura de animación:
 * ┌─────────────────────────────────────────────────────────────┐
 * │  View screen (flex:1, transparente — gestionado por expo-router)
 * │  ├─ Animated.View backdrop (absoluteFill, oscurece la vista anterior)
 * │  │   └─ TouchableOpacity (tocar fondo = cerrar)
 * │  └─ Animated.View panel (bottom sheet, height = SCREEN_H)
 * │      ├─ GestureDetector → área del drag handle
 * │      ├─ Header: [Cancelar] [Nueva Meta] [Guardar]
 * │      └─ ScrollView (formulario completo)
 * └─────────────────────────────────────────────────────────────┘
 *
 * Snap points:
 *   SNAP_HALF = SCREEN_H * 0.52 → abre al 48% de la pantalla (inicial)
 *   SNAP_FULL = 0              → expande al 100% al deslizar arriba
 *
 * Tecnología de animación: react-native-reanimated (UI thread)
 * Tecnología de gestos:    react-native-gesture-handler (GestureDetector + Gesture.Pan)
 *
 * No se usa @gorhom/bottom-sheet para evitar incompatibilidades con
 * Reanimated ^4.3.1 que usa la nueva API de Worklets.
 */
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

import { CalendarioMeta } from "../../components/CalendarioMeta";
import { FilaInterruptor } from "../../components/FilaInterruptor";
import { useAppTheme } from "../../hooks/useAppTheme";
import { useCalendar } from "../../hooks/useCalendar";
import { useGoalImagePicker } from "../../hooks/useGoalImagePicker";
import { scheduleMonthlyReminders } from "../../core/notifications";
import { useAppStore } from "../../store/useAppStore";

// ─── Constantes de animación ──────────────────────────────────────────────────

const SPRING_CONFIG = {
  damping: 30,
  stiffness: 200,
  mass: 0.85,
  overshootClamping: false,
};



// ─── Component ────────────────────────────────────────────────────────────────

export default function NewGoalScreen() {
  const router = useRouter();
  const { height: SCREEN_H } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { current_colors } = useAppTheme();
  const { t } = useTranslation();

  // ── Snap points (calculados una vez por render de raíz) ────────────────────
  const SNAP_HALF = SCREEN_H * 0.52; // Panel inicial al ~48% de la pantalla
  const SNAP_FULL = 0; // Panel expandido al 100%
  const CLOSE_THRESHOLD = SCREEN_H * 0.68; // Arrastra > 68% → cerrar

  // ── Store ──────────────────────────────────────────────────────────────────
  const add_goal = useAppStore((state) => state.addGoal);
  const currency_symbol = useAppStore((state) => state.settings.currencySymbol);

  // ── Form state ─────────────────────────────────────────────────────────────
  const [meta_nombre, set_meta_nombre] = useState("");
  const [meta_ahorro, set_meta_ahorro] = useState("");
  const [ahorro_inicial, set_ahorro_inicial] = useState("");
  const [recordatorio_activo, set_recordatorio_activo] = useState(false);
  const [dias_seleccionados, set_dias_seleccionados] = useState<number[]>([]);
  const [tiene_fecha_objetivo, set_tiene_fecha_objetivo] = useState(false);
  const [fecha_objetivo, set_fecha_objetivo] = useState<Date | null>(null);

  // ── Image picker ───────────────────────────────────────────────────────────
  const {
    photoUri: foto_uri,
    isLoading: is_image_loading,
    pickImage: pick_image,
    removeImage: remove_image,
  } = useGoalImagePicker();

  // ── Calendar hook ──────────────────────────────────────────────────────────
  const calendar = useCalendar(fecha_objetivo, set_fecha_objetivo);

  // ── Estado de apertura para el Bottom Sheet ─────────────────────────────────
  const [isClosing, setIsClosing] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);

  // ── Shared values para animación (UI thread) ───────────────────────────────
  const translateY = useSharedValue(SCREEN_H); // Empieza fuera de pantalla

  // ── Estado del teclado (JS thread) ────────────────────────────────────────
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const navigateBack = useCallback(() => router.back(), [router]);

  /**
   * Anima el cierre del bottom sheet y luego navega hacia atrás.
   */
  const closeSheet = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    translateY.value = withTiming(SCREEN_H, { duration: 300 }, (finished) => {
      if (finished) runOnJS(navigateBack)();
    });
  }, [SCREEN_H, navigateBack, translateY, isClosing]);

  const toggle_dia_handler = useCallback((dia: number) => {
    set_dias_seleccionados((prev) =>
      prev.includes(dia)
        ? prev.filter((d) => d !== dia)
        : [...prev, dia].sort((a, b) => a - b),
    );
  }, []);

  const guardar_meta_handler = async () => {
    if (!meta_nombre.trim() || !meta_ahorro.trim()) {
      Alert.alert(
        t('common.error'),
        t('goals.error_required_fields'),
      );
      return;
    }

    const id = Date.now().toString();
    add_goal({
      id,
      name: meta_nombre.trim(),
      targetAmount: parseFloat(meta_ahorro) || 0,
      savedAmount: parseFloat(ahorro_inicial) || 0,
      icon: "🐷",
      photoUri: foto_uri ?? null,
      hasTargetDate: tiene_fecha_objetivo,
      targetDate: tiene_fecha_objetivo && fecha_objetivo ? fecha_objetivo.toISOString() : undefined,
      hasReminder: recordatorio_activo,
      reminderDays: dias_seleccionados,
      createdAt: new Date().toISOString(),
    });
    
    // Programar notificaciones si están activas
    if (recordatorio_activo && dias_seleccionados.length > 0) {
      const reminderTime = useAppStore.getState().settings.reminderTime;
      await scheduleMonthlyReminders(
        id, 
        meta_nombre.trim(), 
        dias_seleccionados, 
        reminderTime
      );
    }

    closeSheet();
  };

  // ── Gesture del drag handle (corre en el UI thread) ───────────────────────
  const savedY = useSharedValue(SNAP_HALF);

  /**
   * Pan Gesture aplicado SOLO al área del drag handle.
   * Al mantenerlo separado del ScrollView evitamos conflictos de scroll.
   *
   * Lógica de snap:
   *  - velocityY > 600 o posición > CLOSE_THRESHOLD → cerrar
   *  - velocityY < -300 o posición < SNAP_HALF * 0.65 → expandir al 100%
   *  - cualquier otro caso → volver al 50%
   */
  const panGesture = Gesture.Pan()
    .onBegin(() => {
      savedY.value = translateY.value;
    })
    .onUpdate((event) => {
      const nextY = savedY.value + event.translationY;
      translateY.value = Math.max(0, nextY);
    })
    .onEnd((event) => {
      const currentY = translateY.value;
      if (event.velocityY > 600 || currentY > CLOSE_THRESHOLD) {
        translateY.value = withTiming(
          SCREEN_H,
          { duration: 300 },
          (finished) => {
            if (finished) runOnJS(navigateBack)();
          },
        );
      } else if (event.velocityY < -300 || currentY < SNAP_HALF * 0.65) {
        translateY.value = withSpring(0, SPRING_CONFIG);
      } else {
        translateY.value = withSpring(SNAP_HALF, SPRING_CONFIG);
      }
    });

  // ── Animación Reactiva (State-Driven) ──────────────────────────────────────
  useEffect(() => {
    if (isClosing) return;
    
    // Si el teclado está abierto, expandir al 100%. Si no, ir a SNAP_HALF.
    const targetY = isKeyboardVisible ? SNAP_FULL : SNAP_HALF;
    
    // Retraso ligero para permitir que la UI de Android se estabilice al volver de la cámara
    const timer = setTimeout(() => {
      // TRUCO VITAL: Si el panel ya estaba en el destino (ej. a la mitad de la pantalla),
      // Reanimated "optimiza" y decide no animar ni repintar nada. Pero como Android
      // desincronizó la vista al abrir la galería, necesitamos FORZAR el repintado.
      // Modificamos el valor por 1 píxel imperceptible para obligar a Reanimated a despertar.
      if (Math.abs(translateY.value - targetY) < 2) {
        translateY.value = targetY + 1;
      }
      
      translateY.value = withSpring(targetY, SPRING_CONFIG);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [isClosing, isKeyboardVisible, SNAP_HALF, SNAP_FULL, translateY, refreshTick]);

  // ── Listener del teclado ───────────────────────────────────────────────────
  useEffect(() => {
    const SHOW_EV = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const HIDE_EV = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const onShow = Keyboard.addListener(SHOW_EV, (e) => {
      setKeyboardHeight(e.endCoordinates.height);
      setIsKeyboardVisible(true);
    });

    const onHide = Keyboard.addListener(HIDE_EV, () => {
      setKeyboardHeight(0);
      setIsKeyboardVisible(false);
    });

    return () => {
      onShow.remove();
      onHide.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Estilos animados ───────────────────────────────────────────────────────
  const panelAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  /**
   * Backdrop semitransparente: la opacidad se DERIVA de la posición del panel
   * usando interpolate, por lo que nunca necesita un shared value propio.
   *
   * translateY = SNAP_FULL (0)   → opacidad 0.45  (pantalla anterior visible al 55%)
   * translateY = SNAP_HALF        → opacidad 0.30  (pantalla anterior muy visible)
   * translateY = SCREEN_H (cerrado) → opacidad 0  (invisible)
   *
   * Con un máximo de 0.45, el contenido de la pantalla anterior SIEMPRE
   * se puede apreciar a través del fondo, en lugar de volverse negro.
   */
  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateY.value,
      [SNAP_FULL, SNAP_HALF, SCREEN_H],
      [0.45, 0.28, 0],
      Extrapolation.CLAMP,
    ),
  }));

  /**
   * Padding superior del área del handle.
   * Cuando el panel está en SNAP_HALF: 0px extra (no se superpone con status bar).
   * Cuando el panel alcanza SNAP_FULL (translateY = 0): se añaden insets.top + 4
   * para no quedar debajo de la barra de estado / notch.
   */
  const handleAreaAnimatedStyle = useAnimatedStyle(() => ({
    paddingTop: interpolate(
      translateY.value,
      [SNAP_FULL, Math.max(insets.top, 24)],
      [insets.top + 6, 6],
      Extrapolation.CLAMP,
    ),
  }));

  // ── Días del mes memoizados ────────────────────────────────────────────────
  const days_array = useMemo(
    () => Array.from({ length: 31 }, (_, i) => i + 1),
    [],
  );

  // ── Estilos que dependen del tema (memoizados) ─────────────────────────────
  const cardStyle = useMemo(
    () => ({
      backgroundColor: current_colors.surface,
      borderColor: current_colors.border,
    }),
    [current_colors.surface, current_colors.border],
  );

  // ── JSX ────────────────────────────────────────────────────────────────────
  return (
    <View style={styles.screen}>
      {/* ── Backdrop (fondo oscuro semitransparente) ──────────────── */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          styles.backdrop,
          backdropAnimatedStyle,
        ]}
        pointerEvents="box-none"
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          onPress={closeSheet}
          activeOpacity={1}
        />
      </Animated.View>

      {/* ── Panel (Bottom Sheet) ───────────────────────────────────── */}
      <Animated.View
        style={[
          styles.panel,
          {
            height: SCREEN_H,
            backgroundColor: current_colors.surface,
            shadowColor: current_colors.shadow_color,
          },
          panelAnimatedStyle,
        ]}
      >
        {/* ── Área del handle (gesture solo aquí) ─────────────────── */}
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.handle_area, handleAreaAnimatedStyle]}>
            <View
              style={[
                styles.drag_handle,
                { backgroundColor: current_colors.border },
              ]}
            />
          </Animated.View>
        </GestureDetector>

        {/* ── Header: [Cancelar] [Nueva Meta] [Guardar] ─────────────── */}
        <View style={styles.header_container}>
          <TouchableOpacity
            onPress={closeSheet}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.6}
          >
            <Text
              style={[
                styles.header_side_text,
                { color: current_colors.textSecondary },
              ]}
            >
              {t('common.cancel')}
            </Text>
          </TouchableOpacity>

          <Text
            style={[styles.header_title, { color: current_colors.textPrimary }]}
          >
            {t('goals.new_goal')}
          </Text>

          <TouchableOpacity
            onPress={guardar_meta_handler}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.6}
          >
            <Text
              style={[
                styles.header_side_text,
                { color: current_colors.brand, fontWeight: "700" },
              ]}
            >
              {t('common.save')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Formulario (ScrollView) ──────────────────────────────── */}
        <KeyboardAvoidingView
          style={styles.flex1}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            style={styles.flex1}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[
              styles.scroll_content,
              {
                // En iOS, KeyboardAvoidingView behavior="padding" ya empuja el
                // contenido hacia arriba. En Android usamos la altura real del
                // teclado como padding extra para que nada quede oculto.
                paddingBottom:
                  Platform.OS === "android" && keyboardHeight > 0
                    ? keyboardHeight + 16
                    : insets.bottom + 28,
              },
            ]}
          >
            {/* 1. Foto de la meta ─────────────────────────────────── */}
            <TouchableOpacity
              style={[
                styles.image_picker_btn,
                { backgroundColor: current_colors.iconBackground },
              ]}
              onPress={async () => {
                // Cerramos el teclado antes de abrir el picker para evitar conflictos de layout
                Keyboard.dismiss();
                await pick_image();
                // Forzar la re-ejecución del useEffect para despertar a Reanimated
                setRefreshTick(prev => prev + 1);
              }}
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
                    style={[
                      styles.remove_btn,
                      { backgroundColor: current_colors.danger },
                    ]}
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

            {/* 2. Información principal ─────────────────────────────── */}
            <View style={styles.section}>
              <Text
                style={[
                  styles.section_title,
                  { color: current_colors.textSecondary },
                ]}
              >
                {t('goals.main_info')}
              </Text>
              <View style={[styles.card, cardStyle]}>
                <View
                  style={[
                    styles.input_row,
                    {
                      borderBottomWidth: StyleSheet.hairlineWidth,
                      borderBottomColor: current_colors.border,
                    },
                  ]}
                >
                  <TextInput
                    style={[
                      styles.text_input,
                      { color: current_colors.textPrimary },
                    ]}
                    placeholder={t('goals.goal_name')}
                    placeholderTextColor={current_colors.textSecondary}
                    value={meta_nombre}
                    onChangeText={set_meta_nombre}
                    returnKeyType="next"
                  />
                </View>
                <View
                  style={[
                    styles.input_row,
                    {
                      borderBottomWidth: StyleSheet.hairlineWidth,
                      borderBottomColor: current_colors.border,
                    },
                  ]}
                >
                  <TextInput
                    style={[
                      styles.text_input,
                      { color: current_colors.textPrimary },
                    ]}
                    placeholder={`${currency_symbol} ${t('goals.financial_target')}`}
                    placeholderTextColor={current_colors.textSecondary}
                    keyboardType="numeric"
                    value={meta_ahorro}
                    onChangeText={set_meta_ahorro}
                    returnKeyType="next"
                  />
                </View>
                <View style={styles.input_row}>
                  <TextInput
                    style={[
                      styles.text_input,
                      { color: current_colors.textPrimary },
                    ]}
                    placeholder={`${currency_symbol} ${t('goals.initial_savings')}`}
                    placeholderTextColor={current_colors.textSecondary}
                    keyboardType="numeric"
                    value={ahorro_inicial}
                    onChangeText={set_ahorro_inicial}
                    returnKeyType="done"
                  />
                </View>
              </View>
            </View>

            {/* 3. Planificación + Calendario ─────────────────────────── */}
            <View style={styles.section}>
              <Text
                style={[
                  styles.section_title,
                  { color: current_colors.textSecondary },
                ]}
              >
                {t('goals.planning')}
              </Text>
              <View style={[styles.card, cardStyle]}>
                <View style={styles.switch_row_wrapper}>
                  <FilaInterruptor
                    label={t('goals.set_target_date')}
                    value={tiene_fecha_objetivo}
                    onValueChange={(val) => {
                      set_tiene_fecha_objetivo(val);
                      if (!val) set_fecha_objetivo(null);
                    }}
                  />
                </View>

                {tiene_fecha_objetivo && (
                  <View style={styles.calendar_container}>
                    {/* Calendario dinámico — días calculados con useMemo en useCalendar */}
                    <CalendarioMeta calendar={calendar} />

                    {fecha_objetivo ? (
                      <Text
                        style={[
                          styles.selected_date_label,
                          { color: current_colors.brand },
                        ]}
                      >
                        📅{" "}
                        {fecha_objetivo.toLocaleDateString("es-MX", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </Text>
                    ) : (
                      <Text
                        style={[
                          styles.selected_date_label,
                          { color: current_colors.textSecondary },
                        ]}
                      >
                        {t('goals.tap_to_select_date')}
                      </Text>
                    )}
                  </View>
                )}
              </View>
            </View>

            {/* 4. Recordatorios ─────────────────────────────────────── */}
            <View style={styles.section}>
              <Text
                style={[
                  styles.section_title,
                  { color: current_colors.textSecondary },
                ]}
              >
                {t('settings.reminders')}
              </Text>
              <View style={[styles.card, cardStyle]}>
                <View style={styles.switch_row_wrapper}>
                  <FilaInterruptor
                    label={t('goals.remind_me')}
                    value={recordatorio_activo}
                    onValueChange={set_recordatorio_activo}
                  />
                </View>

                {recordatorio_activo && (
                  <View style={styles.reminder_container}>
                    <Text
                      style={[
                        styles.reminder_info_text,
                        { color: current_colors.textSecondary },
                      ]}
                    >
                      {t('goals.select_reminder_days')}
                    </Text>
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
                                  color: is_selected
                                    ? "#FFFFFF"
                                    : current_colors.textPrimary,
                                },
                              ]}
                            >
                              {dia}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                )}
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Animated.View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  flex1: { flex: 1 },

  // Pantalla completa transparente (la ruta gestiona la transparencia)
  screen: { flex: 1 },

  // Fondo oscuro semitransparente — absoluteFill sobre la pantalla anterior
  backdrop: {
    backgroundColor: "#000000",
  },

  // Panel del bottom sheet (anclado al fondo)
  panel: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    // Bordes redondeados SOLO en la parte superior
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
    // Sombra superior
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 24,
  },

  // Área del drag handle (solo esta zona tiene el PanGestureHandler)
  handle_area: {
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 24,
    minHeight: 48,
  },
  drag_handle: {
    width: 42,
    height: 4,
    borderRadius: 2,
  },

  // Header: [Cancelar] [Nueva Meta] [Guardar]
  header_container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  header_title: {
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  header_side_text: {
    fontSize: 15,
    fontWeight: "500",
  },

  // Formulario
  scroll_content: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  image_picker_btn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignSelf: "center",
    marginBottom: 20,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  image_preview: { width: "100%", height: "100%" },
  placeholder_container: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  image_placeholder: { fontSize: 30 },
  remove_btn: {
    position: "absolute",
    top: 3,
    right: 3,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  remove_icon: { color: "#FFF", fontSize: 11, fontWeight: "800" },

  section: { marginBottom: 20 },
  section_title: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
    marginLeft: 12,
    letterSpacing: 0.5,
  },
  card: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
  },
  input_row: {
    paddingHorizontal: 16,
    paddingVertical: 2,
  },
  text_input: {
    height: 48,
    fontSize: 16,
    fontWeight: "500",
  },
  switch_row_wrapper: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },

  // Calendario
  calendar_container: {
    paddingHorizontal: 12,
    paddingBottom: 14,
  },
  selected_date_label: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },

  // Recordatorios
  reminder_container: {
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  reminder_info_text: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 12,
    textAlign: "center",
  },
  grid_container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
    justifyContent: "center",
  },
  dia_btn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  dia_text: { fontSize: 13, fontWeight: "600" },
});
