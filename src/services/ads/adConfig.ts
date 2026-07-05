import { Platform } from "react-native";
import { TestIds } from "react-native-google-mobile-ads";

const isDev = __DEV__;

// En producción deberás sustituir los IDs reales por los que te proporcione AdMob
export const AdConfig = {
  bannerId: (isDev
    ? TestIds.BANNER
    : Platform.OS === "android"
      ? "ca-app-pub-8770610388319332/5360678434"
      : TestIds.BANNER) as string,

  interstitialId: (isDev
    ? TestIds.INTERSTITIAL
    : Platform.OS === "android"
      ? "ca-app-pub-8770610388319332/9544264789"
      : TestIds.INTERSTITIAL) as string,
};
