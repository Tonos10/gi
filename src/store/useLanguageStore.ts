/**
 * useLanguageStore.ts
 *
 * Store de Zustand para gestionar la preferencia de idioma del usuario.
 * Persiste la elección en AsyncStorage y actualiza i18next dinámicamente.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// IMPORTANTE: importamos el singleton global de i18next, NO una instancia privada.
import i18n from '../core/i18n';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type FixedLanguage = 'es' | 'en';
export type LanguagePreference = FixedLanguage; // Solo es o en

const SUPPORTED_LANGUAGES: ReadonlySet<FixedLanguage> = new Set(['es', 'en']);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function resolveI18nLanguage(preference: LanguagePreference): FixedLanguage {
  return preference;
}

// ─── Interface del Store ───────────────────────────────────────────────────────

interface LanguageState {
  preference: LanguagePreference;
  setLanguage: (preference: LanguagePreference) => void;
  hydrate: () => Promise<void>;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      preference: 'es', // Por defecto 'es' si no hay persistencia aún, pero hydrate lo cambiará por el default del dispositivo si se quiere, o lo dejamos como 'es' por simplicidad

      /**
       * Cambia el idioma de la app.
       *
       * ORDEN CRÍTICO:
       * 1. Actualiza Zustand PRIMERO → re-render inmediato del radio button.
       * 2. Luego cambia i18next en background (no bloquea la UI).
       */
      setLanguage: (preference) => {
        // 1️⃣ Estado actualizado de inmediato → UI reactiva al instante.
        set({ preference });

        // 2️⃣ Cambiar el idioma activo en i18next de forma no bloqueante.
        const lang = resolveI18nLanguage(preference);
        if (i18n.isInitialized && i18n.language !== lang) {
          i18n.changeLanguage(lang).catch(console.error);
        }
      },

      /**
       * Hidratación al arrancar la app.
       * Aplica la preferencia guardada a i18next una vez que está inicializado.
       */
      hydrate: async () => {
        const { preference } = get();
        const lang = resolveI18nLanguage(preference);
        if (i18n.isInitialized && i18n.language !== lang) {
          await i18n.changeLanguage(lang);
        }
      },
    }),
    {
      name: 'coinly-language',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ preference: state.preference }),
    },
  ),
);
