import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { AdConfig } from './adConfig';
import { useAppStore } from '../../store/useAppStore';
import { AdManager } from './AdManager';

export const CoinlyBanner = () => {
  const isPremium = useAppStore(state => state.settings.isPremium);
  const [error, setError] = useState(false);

  // Asegurar que AdManager sincronice el estado Premium
  useEffect(() => {
    AdManager.setAdsEnabled(!isPremium);
  }, [isPremium]);

  if (isPremium || error) {
    return null;
  }

  return (
    <View style={styles.container}>
      <BannerAd
        unitId={AdConfig.bannerId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true, // Útil para cumplir GDPR de forma genérica
        }}
        onAdFailedToLoad={(err) => {
          // Log detailed error to help debug production issues (e.g. Error code 3)
          console.warn('Banner failed to load:', err.message, err.code);
          setError(true);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
});
