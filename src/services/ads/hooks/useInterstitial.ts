import { useCallback, useEffect } from 'react';
import { AdManager } from '../AdManager';
import { useAppStore } from '../../../store/useAppStore';

export function useInterstitial() {
  const isPremium = useAppStore(state => state.settings.isPremium);

  // Sincronizar el estado de Premium con el Singleton para limpieza/inicialización
  useEffect(() => {
    AdManager.setAdsEnabled(!isPremium);
  }, [isPremium]);

  const registerAction = useCallback(() => {
    // Si la pantalla se monta, nos aseguramos que el anuncio esté cargando
    AdManager.preload();
  }, []);

  const showNow = useCallback(async (): Promise<boolean> => {
    if (isPremium) return false;
    return await AdManager.showInterstitial();
  }, [isPremium]);

  const enableAds = useCallback((enabled: boolean) => {
    AdManager.setAdsEnabled(enabled);
  }, []);

  return {
    registerAction,
    showNow,
    enableAds,
  };
}
