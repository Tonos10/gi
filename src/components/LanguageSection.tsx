/**
 * LanguageSection.tsx
 *
 * Sección de selección de idioma para la pantalla de Ajustes de Coinly.
 * Consume useLanguageStore para leer/escribir la preferencia del usuario.
 */
import { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useAppTheme } from '../hooks/useAppTheme';
import {
  LanguagePreference,
  useLanguageStore,
} from '../store/useLanguageStore';

// ─── Opciones de idioma ────────────────────────────────────────────────────────

interface LanguageOption {
  value: LanguagePreference;
  label: string;
  flag: string;
  subtitle: string;
}

const get_language_options = (t: any): LanguageOption[] => [
  {
    value: 'es',
    label: t('settings.language_es'),
    flag: '🇲🇽',
    subtitle: t('settings.language_es_subtitle'),
  },
  {
    value: 'en',
    label: t('settings.language_en'),
    flag: '🇺🇸',
    subtitle: t('settings.language_en_subtitle'),
  },
];

// ─── Componente ────────────────────────────────────────────────────────────────

export function LanguageSection() {
  const { current_colors } = useAppTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => get_styles(current_colors), [current_colors]);

  const { preference, setLanguage } = useLanguageStore();
  const LANGUAGE_OPTIONS = get_language_options(t);

  return (
    <View style={styles.section}>
      <Text style={styles.section_title}>{t('settings.language')}</Text>

      <View style={styles.card}>
        {LANGUAGE_OPTIONS.map((option, index) => {
          const is_selected = preference === option.value;
          const is_last = index === LANGUAGE_OPTIONS.length - 1;

          return (
            <TouchableOpacity
              key={option.value}
              style={[styles.option_row, !is_last && styles.border_bottom]}
              onPress={() => setLanguage(option.value)}
              activeOpacity={0.7}
              accessibilityRole="radio"
              accessibilityState={{ checked: is_selected }}
              accessibilityLabel={option.label}
            >
              {/* Icono de bandera */}
              <View style={styles.flag_wrapper}>
                <Text style={styles.flag}>{option.flag}</Text>
              </View>

              {/* Texto */}
              <View style={styles.label_wrapper}>
                <Text
                  style={[
                    styles.option_label,
                    is_selected && styles.option_label_selected,
                  ]}
                >
                  {option.label}
                </Text>
                <Text style={styles.option_subtitle}>{option.subtitle}</Text>
              </View>

              {/* Radio button */}
              <View
                style={[
                  styles.radio_outer,
                  is_selected && styles.radio_outer_active,
                ]}
              >
                {is_selected && <View style={styles.radio_inner} />}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ─── Estilos ───────────────────────────────────────────────────────────────────

const get_styles = (theme_colors: any) =>
  StyleSheet.create({
    section: {
      marginBottom: 24,
    },
    section_title: {
      fontSize: 13,
      fontWeight: '600',
      color: theme_colors.textSecondary,
      marginBottom: 8,
      marginLeft: 12,
      letterSpacing: 0.5,
    },
    card: {
      backgroundColor: theme_colors.surface,
      borderRadius: 16,
      overflow: 'hidden',
      shadowColor: theme_colors.shadow_color,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    option_row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 16,
      gap: 12,
    },
    border_bottom: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme_colors.border,
    },
    flag_wrapper: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: theme_colors.iconBackground ?? theme_colors.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
    flag: {
      fontSize: 18,
    },
    label_wrapper: {
      flex: 1,
      gap: 2,
    },
    option_label: {
      fontSize: 15,
      fontWeight: '500',
      color: theme_colors.textPrimary,
    },
    option_label_selected: {
      color: theme_colors.brand ?? theme_colors.primary,
      fontWeight: '600',
    },
    option_subtitle: {
      fontSize: 12,
      color: theme_colors.textSecondary,
    },
    radio_outer: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      borderColor: theme_colors.border ?? theme_colors.textSecondary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    radio_outer_active: {
      borderColor: theme_colors.brand ?? theme_colors.primary,
    },
    radio_inner: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: theme_colors.brand ?? theme_colors.primary,
    },
  });
