import * as Device from "expo-device";
import { Platform } from "react-native";
import { TestIds } from "react-native-google-mobile-ads";

const isDev = __DEV__;

const bannerAdUnitId = isDev
  ? TestIds.BANNER
  : Platform.OS === "android"
    ? (process.env.EXPO_PUBLIC_ADMOB_BANNER_UNIT_ID?.trim() ??
      "ca-app-pub-8770610388319332/5360678434")
    : (process.env.EXPO_PUBLIC_ADMOB_IOS_BANNER_UNIT_ID?.trim() ?? "");

const interstitialAdUnitId = isDev
  ? TestIds.INTERSTITIAL
  : Platform.OS === "android"
    ? (process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_UNIT_ID?.trim() ??
      "ca-app-pub-8770610388319332/9544264789")
    : (process.env.EXPO_PUBLIC_ADMOB_IOS_INTERSTITIAL_UNIT_ID?.trim() ?? "");

export const areAdsSupported =
  Device.isDevice && Boolean(bannerAdUnitId) && Boolean(interstitialAdUnitId);

export const AdConfig = {
  bannerId: bannerAdUnitId,
  interstitialId: interstitialAdUnitId,
};
