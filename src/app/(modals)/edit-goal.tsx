// app/(modals)/edit-goal.tsx
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { FilaInterruptor } from "../../components/FilaInterruptor";
import { CustomInput } from "../../components/modal/CustomInput";
import { DangerButton } from "../../components/modal/DangerButton";
import { ModalCard } from "../../components/modal/ModalCard";
import { ModalHeader } from "../../components/modal/ModalHeader";
import {
  cancelGoalNotifications,
  scheduleMonthlyReminders,
} from "../../core/notifications";
import { useAppTheme } from "../../hooks/useAppTheme";
import { useInterstitial } from "../../services/ads/hooks/useInterstitial";
import { useAppStore } from "../../store/useAppStore";
import { useTranslation } from "react-i18next";

export default function EditGoalModal() {
  const { t } = useTranslation();
  const router = useRouter();
  const { current_colors } = useAppTheme();
  const { registerAction, showNow } = useInterstitial();

  const { goalId: goal_id } = useLocalSearchParams<{ goalId: string }>();
  const {
    goals,
    updateGoal: update_goal,
    deleteGoal: delete_goal,
    settings,
  } = useAppStore();
  const current_goal = goals.find((g) => g.id === goal_id);
  const currency_symbol = settings.currencySymbol;

  const [modal_visible, set_modal_visible] = useState(true);

  const [meta_nombre, set_meta_nombre] = useState(current_goal?.name || "");
  const [meta_ahorro, set_meta_ahorro] = useState(
    current_goal?.targetAmount?.toString() || "",
  );
  const [foto_uri, set_foto_uri] = useState<string | null>(
    current_goal?.photoUri || null,
  );
  const [recordatorio_activo, set_recordatorio_activo] = useState(
    current_goal?.hasReminder || false,
  );
  const [dias_seleccionados, set_dias_seleccionados] = useState<number[]>(
    current_goal?.reminderDays || [],
  );

  // ── Handlers ────────────────────────────────────────────────────────────────

  // Registrar acción en mount para ir precargando
  useEffect(() => {
    registerAction();
  }, [registerAction]);

  const close_modal_handler = async () => {
    set_modal_visible(false);

    // Mostramos el anuncio antes de navegar hacia atrás si hubo un cambio (o siempre que se cierre)
    // Para no mostrarlo si cancela sin hacer nada, lo mostramos en el submit en lugar de aquí.
    setTimeout(() => router.back(), 250);
  };

  const pick_image_handler = async () => {
    const permission_result =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permission_result.granted === false) {
      Alert.alert("Oops!", t("goals.permissions_needed"));
      return;
    }

    const picker_result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!picker_result.canceled && picker_result.assets.length > 0) {
      set_foto_uri(picker_result.assets[0].uri);
    }
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

  const save_data_handler = () => {
    if (!current_goal) return;

    if (!meta_nombre.trim() || !meta_ahorro.trim()) {
      Alert.alert(
        t("goals.incomplete_data"),
        t("goals.error_required_fields"),
      );
      return;
    }
    const id = current_goal.id;

    update_goal(id, {
      name: meta_nombre.trim(),
      targetAmount: parseFloat(meta_ahorro) || 0,
      photoUri: foto_uri,
      hasReminder: recordatorio_activo,
      reminderDays: dias_seleccionados,
    });

    // Configurar notificaciones actualizadas
    if (recordatorio_activo && dias_seleccionados.length > 0) {
      const reminderTime = useAppStore.getState().settings.reminderTime;
      scheduleMonthlyReminders(
        id,
        meta_nombre.trim(),
        dias_seleccionados,
        reminderTime,
      ).catch(console.error);
    } else {
      cancelGoalNotifications(id).catch(console.error);
    }

    set_modal_visible(false);

    // Intenta mostrar el anuncio y luego navega
    showNow().finally(() => {
      setTimeout(() => router.back(), 250);
    });
  };

  const delete_goal_handler = () => {
    if (!current_goal) return;

    const id = current_goal.id;

    Alert.alert(
      t("goals.delete_confirm"),
      t("goals.delete_message"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: () => {
            set_modal_visible(false);
            router.navigate("/(tabs)");
            cancelGoalNotifications(id).catch(console.error);
            setTimeout(() => {
              delete_goal(id);
            }, 300);
          },
        },
      ],
    );
  };

  // ── Render days grid ─────────────────────────────────────────────────────────

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

  // ── JSX ──────────────────────────────────────────────────────────────────────

  if (!current_goal) return null;

  return (
    <ModalCard isVisible={modal_visible} onClose={close_modal_handler}>
      {/* Cabecera fija: [Cancelar] [Editar Meta] [Guardar] */}
      <ModalHeader
        title={t("goals.edit_goal")}
        subtitle={current_goal.name}
        onLeftPress={close_modal_handler}
        leftLabel={t("common.cancel")}
        onRightPress={save_data_handler}
        rightLabel={t("common.save")}
      />

      {/* ScrollView ocupa el espacio restante con flexShrink.
           Cuando el contenido supera maxHeight del card, Yoga
           comprime este ScrollView y activa el desplazamiento. */}
      <ScrollView
        style={styles.scroll_shrink}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scroll_content}
      >
        {/* Selector de foto — más compacto */}
        <TouchableOpacity
          style={[
            styles.image_picker_btn,
            { backgroundColor: current_colors.iconBackground },
          ]}
          onPress={pick_image_handler}
          activeOpacity={0.8}
        >
          {foto_uri ? (
            <Image
              key={foto_uri}
              source={{ uri: foto_uri }}
              style={styles.image_preview}
              resizeMode="cover"
            />
          ) : (
            <Text style={styles.image_placeholder}>📷</Text>
          )}
        </TouchableOpacity>

        {/* ── Sección: Información de la meta ─────────────────────────────── */}
        <Text
          style={[
            styles.section_title,
            { color: current_colors.textSecondary },
          ]}
        >
          {t("goals.main_info")}
        </Text>

        <CustomInput
          placeholder={t("goals.goal_name")}
          value={meta_nombre}
          onChangeText={set_meta_nombre}
          returnKeyType="next"
        />

        <CustomInput
          placeholder={`${currency_symbol} ${t("goals.financial_target")}`}
          keyboardType="numeric"
          value={meta_ahorro}
          onChangeText={set_meta_ahorro}
          returnKeyType="done"
        />

        {/* ── Sección: Recordatorios ───────────────────────────────────────── */}
        <Text
          style={[
            styles.section_title,
            { color: current_colors.textSecondary, marginTop: 8 },
          ]}
        >
          {t("settings.reminders")}
        </Text>

        <View
          style={[
            styles.switch_wrapper,
            { borderColor: current_colors.border },
          ]}
        >
          <FilaInterruptor
            label={t("goals.remind_me")}
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
              {t("goals.select_reminder_days")}
            </Text>
            {render_dias_grid()}
          </View>
        )}

        {/* ── Acciones ────────────────────────────────────────────────────── */}
        {/* Guardar está en el header (arriba derecha). Solo queda Eliminar. */}
        <View style={styles.actions_container}>
          <DangerButton title={t("goals.delete_confirm")} onPress={delete_goal_handler} />
        </View>
      </ScrollView>
    </ModalCard>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // flexShrink:1 → cuando el contenido excede maxHeight del card,
  // Yoga comprime el ScrollView y activa el desplazamiento interno.
  scroll_shrink: { flexShrink: 1 },
  scroll_content: { paddingBottom: 16 },
  image_picker_btn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignSelf: "center",
    marginBottom: 16,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  image_preview: { width: "100%", height: "100%" },
  image_placeholder: { fontSize: 28 },
  section_title: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  switch_wrapper: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: 4,
    marginBottom: 10,
  },
  reminder_container: { marginTop: 6, marginBottom: 12 },
  reminder_info_text: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 10,
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
  actions_container: { marginTop: 20, gap: 12 },
});
