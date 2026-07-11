import type { ConfigContext, ExpoConfig } from "expo/config";

function parseCsv(value?: string): string[] {
  return (
    value
      ?.split(",")
      .map((item) => item.trim())
      .filter(Boolean) ?? []
  );
}

export default ({ config }: ConfigContext): ExpoConfig => {
  const plugins = (config.plugins ?? []).filter((plugin) => {
    return (
      !Array.isArray(plugin) || plugin[0] !== "react-native-google-mobile-ads"
    );
  });

  const androidAppId =
    process.env.EXPO_PUBLIC_ADMOB_ANDROID_APP_ID ||
    "ca-app-pub-8770610388319332~4020475367";
  const iosAppId = process.env.EXPO_PUBLIC_ADMOB_IOS_APP_ID?.trim();
  const userTrackingUsageDescription =
    process.env.EXPO_PUBLIC_ADMOB_USER_TRACKING_DESCRIPTION?.trim() ??
    "Esta aplicación utiliza tus datos de actividad para mostrarte anuncios personalizados y mantener la app gratuita.";
  const skAdNetworkItems = parseCsv(
    process.env.EXPO_PUBLIC_ADMOB_SKADNETWORK_ITEMS,
  );

  return {
    ...config,
    plugins: [
      ...plugins,
      [
        "react-native-google-mobile-ads",
        {
          androidAppId,
          ...(iosAppId ? { iosAppId } : {}),
          optimizeInitialization: true,
          optimizeAdLoading: true,
          ...(skAdNetworkItems.length > 0 ? { skAdNetworkItems } : {}),
          userTrackingUsageDescription,
        },
      ],
    ],
  };
};
