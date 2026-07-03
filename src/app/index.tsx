import { Redirect } from "expo-router";

export default function Index() {
  // Redirige al grupo de pestañas (tabs)
  return <Redirect href="/(tabs)" />;
}
