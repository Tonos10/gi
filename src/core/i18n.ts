/**
 * i18n.ts
 *
 * Configuración del singleton global de i18next para Coinly.
 * Exporta la instancia global y la función `initI18n()` para arrancar.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "../locales/en.json";
import es from "../locales/es.json";

// ─── Recursos ─────────────────────────────────────────────────────────────────

export const resources = {
  en: { translation: en },
  es: { translation: es },
} as const;

// ─── Tipos ────────────────────────────────────────────────────────────────────

type SupportedLang = "es" | "en";
const SUPPORTED: ReadonlySet<SupportedLang> = new Set(["es", "en"]);

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Lee la preferencia de idioma guardada en AsyncStorage (clave zustand persist)
 * y la resuelve al código de idioma real. Si nula, usa el
 * locale del dispositivo como fallback con 'en' como último recurso.
 */
async function resolveInitialLanguage(): Promise<SupportedLang> {
  try {
    const raw = await AsyncStorage.getItem("coinly-language");
    if (raw) {
      const parsed = JSON.parse(raw) as { state?: { preference?: string } };
      const pref = parsed?.state?.preference;
      if (pref && SUPPORTED.has(pref as SupportedLang)) {
        return pref as SupportedLang;
      }
    }
  } catch {
    // Continuar con el fallback del dispositivo si falla AsyncStorage.
  }

  const deviceCode = Localization.getLocales()[0]?.languageCode ?? "en";
  return SUPPORTED.has(deviceCode as SupportedLang)
    ? (deviceCode as SupportedLang)
    : "en";
}

// ─── Inicialización ────────────────────────────────────────────────────────────

/**
 * Inicializa el singleton global de i18next.
 * Debe llamarse UNA VEZ en RootLayout antes de que se renderice la app.
 * Es idempotente: si ya fue inicializado, solo cambia el idioma si es necesario.
 */
export async function initI18n(): Promise<void> {
  const language = await resolveInitialLanguage();

  if (i18n.isInitialized) {
    if (i18n.language !== language) {
      await i18n.changeLanguage(language);
    }
    return;
  }

  await i18n.use(initReactI18next).init({
    resources,
    lng: language,
    fallbackLng: "en",
    interpolation: { escapeValue: false },
    compatibilityJSON: "v4",
  });
}

// Exportamos el singleton global para que useLanguageStore lo consuma.
export default i18n;
