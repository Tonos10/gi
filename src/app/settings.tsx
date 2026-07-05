// src/app/(tabs)/settings.tsx
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";
import { LanguageSection } from "../components/LanguageSection";
import { scheduleMonthlyReminders } from "../core/notifications";
import { useAppTheme } from "../hooks/useAppTheme";
import { useAppStore } from "../store/useAppStore";
import { AdManager } from "../services/ads/AdManager";

export default function SettingsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { current_colors } = useAppTheme();
  const styles = useMemo(() => get_styles(current_colors), [current_colors]);

  const { settings, updateSettings } = useAppStore();

  const [show_time_picker, set_show_time_picker] = useState(false);
  const [show_currency_list, set_show_currency_list] = useState(false);

  // ── Interstitial Ad — interceptar el botón de salida ─────────────────────
  const pending_back = useRef(false);

  useEffect(() => {
    // Precargar el anuncio al montar la pantalla de configuración
    AdManager.preload();

    // Suscribirse al evento CLOSED para ejecutar el regreso
    const unsubscribe = AdManager.onAdClosed(() => {
      if (pending_back.current) {
        pending_back.current = false;
        router.back();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [router]);

  /**
   * Muestra el interstitial y regresa al cerrarse.
   * Si el anuncio no está listo, regresa de inmediato.
   */
  const handle_back_with_ad = async () => {
    pending_back.current = true;
    const shown = await AdManager.showInterstitial();
    if (!shown) {
      pending_back.current = false;
      router.back();
    }
  };

  const handle_theme_change = (theme: "system" | "light" | "dark") => {
    updateSettings({ theme });
  };

  const handle_time_change = (event: any, selectedDate?: Date) => {
    set_show_time_picker(Platform.OS === "ios");
    if (selectedDate) {
      const formatted_time = selectedDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      updateSettings({ reminderTime: formatted_time });

      // Actualizar notificaciones de las metas activas
      const activeGoals = useAppStore
        .getState()
        .goals.filter(
          (g) => g.hasReminder && g.reminderDays && g.reminderDays.length > 0,
        );
      activeGoals.forEach((g) => {
        const reminderDays = g.reminderDays;
        if (!reminderDays || reminderDays.length === 0) {
          return;
        }

        scheduleMonthlyReminders(
          g.id,
          g.name,
          reminderDays,
          formatted_time,
        ).catch(console.error);
      });
    }
  };

  const open_link = (url: string) => {
    Linking.openURL(url).catch(() => alert("No se pudo abrir el enlace."));
  };

  const handle_premium = () => {
    const isPremium = settings.isPremium;
    updateSettings({ isPremium: !isPremium });
    alert(!isPremium ? "¡Versión Premium Activada! Se han deshabilitado los anuncios." : "Versión Estándar Activada. Se muestran los anuncios.");
  };

  return (
    <SafeAreaView
      style={[styles.safe_area, { backgroundColor: current_colors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scroll_content}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity onPress={handle_back_with_ad} style={styles.back_btn}>
          <Text style={[styles.back_text, { color: current_colors.brand }]}>
            ‹ {t("common.back")}
          </Text>
        </TouchableOpacity>
        <Text style={styles.screen_title}>{t("settings.title")}</Text>

        {/* 1. APARIENCIA */}
        <View style={styles.section}>
          <Text style={styles.section_title}>{t("settings.appearance")}</Text>
          <View style={styles.card}>
            {(["system", "light", "dark"] as const).map((themeOption, index) => (
              <TouchableOpacity
                key={themeOption}
                style={[styles.option_row, index !== 2 && styles.border_bottom]}
                onPress={() => handle_theme_change(themeOption)}
              >
                <Text style={styles.option_label}>
                  {themeOption === "system"
                    ? t("settings.theme_system")
                    : themeOption === "light"
                      ? t("settings.theme_light")
                      : t("settings.theme_dark")}
                </Text>
                <View style={styles.radio_outer}>
                  {settings.theme === themeOption && <View style={styles.radio_inner} />}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 2. IDIOMA */}
        <LanguageSection />

        {/* 3. MONEDA */}
        <View style={styles.section}>
          <Text style={styles.section_title}>{t("settings.currency")}</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={[
                styles.option_row,
                show_currency_list && styles.border_bottom,
              ]}
              onPress={() => set_show_currency_list(!show_currency_list)}
              activeOpacity={0.7}
            >
              <Text style={styles.option_label}>{t("settings.currency_label")}</Text>
              <View style={styles.currency_selected_wrapper}>
                <Text style={styles.currency_selected_text}>
                  {settings.currencySymbol === "$" && "Dólar ($)"}
                  {settings.currencySymbol === "€" && "Euro (€)"}
                  {settings.currencySymbol === "£" && "Libra (£)"}
                  {settings.currencySymbol === "¥" && "Yen (¥)"}
                  {!["$", "€", "£", "¥"].includes(settings.currencySymbol) &&
                    `Otro (${settings.currencySymbol})`}
                </Text>
                <Text style={styles.dropdown_arrow}>
                  {show_currency_list ? "▲" : "▼"}
                </Text>
              </View>
            </TouchableOpacity>

            {show_currency_list && (
              <View style={styles.dropdown_list}>
                {[
                  { label: "Dólar ($)", symbol: "$" },
                  { label: "Euro (€)", symbol: "€" },
                  { label: "Libra (£)", symbol: "£" },
                  { label: "Yen (¥)", symbol: "¥" },
                ].map((c, index) => (
                  <TouchableOpacity
                    key={c.symbol}
                    style={[
                      styles.dropdown_item_row,
                      index !== 3 && styles.border_bottom,
                    ]}
                    onPress={() => {
                      updateSettings({ currencySymbol: c.symbol });
                      set_show_currency_list(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdown_item_label,
                        settings.currencySymbol === c.symbol &&
                          styles.selected_item_label,
                      ]}
                    >
                      {c.label}
                    </Text>
                    {settings.currencySymbol === c.symbol && (
                      <Text style={styles.check_icon}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* 3. RECORDATORIOS */}
        <View style={styles.section}>
          <Text style={styles.section_title}>{t("settings.reminders")}</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.option_row}
              onPress={() => set_show_time_picker(true)}
            >
              <Text style={styles.option_label}>{t("settings.reminder_time")}</Text>
              <Text style={styles.time_text}>{settings.reminderTime}</Text>
            </TouchableOpacity>
          </View>
          {show_time_picker && (
            <DateTimePicker
              value={new Date()}
              mode="time"
              display="default"
              onChange={handle_time_change}
              onDismiss={() => set_show_time_picker(false)}
            />
          )}
        </View>

        {/* 4. SIN ANUNCIOS (PREMIUM) */}
        <View style={styles.section}>
          <Text style={styles.section_title}>{t("settings.premium")}</Text>
          <TouchableOpacity
            style={[styles.card, styles.premium_card]}
            onPress={handle_premium}
          >
            <Text style={styles.premium_title}>
              {settings.isPremium ? "🌟 Versión Premium Activa" : t("settings.premium_title")}
            </Text>
            <Text style={styles.premium_desc}>
              {settings.isPremium ? "Disfruta de la app sin anuncios." : t("settings.premium_desc")}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 5. SECCIÓN LEGAL */}
        <View style={styles.section}>
          <Text style={styles.section_title}>{t("settings.legal")}</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={[styles.option_row, styles.border_bottom]}
              onPress={() =>
                open_link(
                  "https://sites.google.com/view/privacy-policy-coinly/p%C3%A1gina-principal",
                )
              }
            >
              <Text style={styles.option_label}>{t("settings.privacy_policy")}</Text>
              <Text style={styles.arrow_icon}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.option_row, styles.border_bottom]}
              onPress={() => open_link("market://details?id=com.coinly")}
            >
              <Text style={styles.option_label}>{t("settings.rate_app")}</Text>
              <Text style={styles.arrow_icon}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.option_row, styles.border_bottom]}
              onPress={() =>
                open_link(
                  "mailto:cobalto.apps@gmail.com?subject=Soporte%20App%20Coinly",
                )
              }
            >
              <Text style={styles.option_label}>
                {t("settings.support_email")}
              </Text>
              <Text style={styles.arrow_icon}>›</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const get_styles = (theme_colors: any) =>
  StyleSheet.create({
    safe_area: {
      flex: 1,
    },
    scroll_content: {
      padding: 20,
      paddingBottom: 40,
    },
    screen_title: {
      fontSize: 28,
      fontWeight: "bold",
      color: theme_colors.textPrimary,
      marginBottom: 24,
    },
    back_btn: {
      marginBottom: 16,
      paddingVertical: 8,
      alignSelf: "flex-start",
    },
    back_text: {
      fontSize: 18,
      fontWeight: "600",
    },
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
      shadowColor: theme_colors.shadow_color,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    option_row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 16,
      paddingHorizontal: 16,
    },
    border_bottom: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme_colors.border,
    },
    option_label: {
      fontSize: 16,
      color: theme_colors.textPrimary,
    },
    radio_outer: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      borderColor: theme_colors.primary,
      justifyContent: "center",
      alignItems: "center",
    },
    radio_inner: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: theme_colors.primary,
    },
    time_text: {
      fontSize: 16,
      color: theme_colors.brand,
      fontWeight: "600",
    },
    premium_card: {
      padding: 20,
      backgroundColor: theme_colors.iconBackground,
      alignItems: "center",
    },
    premium_title: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme_colors.textPrimary,
      marginBottom: 4,
    },
    premium_desc: {
      fontSize: 14,
      color: theme_colors.textSecondary,
    },
    arrow_icon: {
      fontSize: 20,
      color: theme_colors.textSecondary,
    },
    currency_selected_wrapper: {
      flexDirection: "row",
      alignItems: "center",
    },
    currency_selected_text: {
      fontSize: 16,
      color: theme_colors.brand,
      fontWeight: "600",
    },
    dropdown_arrow: {
      fontSize: 12,
      color: theme_colors.textSecondary,
      marginLeft: 8,
    },
    dropdown_list: {
      backgroundColor: theme_colors.surface,
    },
    dropdown_item_row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 14,
      paddingHorizontal: 24,
    },
    dropdown_item_label: {
      fontSize: 15,
      color: theme_colors.textSecondary,
    },
    selected_item_label: {
      color: theme_colors.textPrimary,
      fontWeight: "600",
    },
    check_icon: {
      fontSize: 16,
      color: theme_colors.brand,
      fontWeight: "bold",
    },
  });
