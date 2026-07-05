import { Image } from "expo-image";
import { SymbolView } from "expo-symbols";
import {
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Reemplazo local mínimo para evitar dependencias faltantes
const BottomTabInset = 34;
const MaxContentWidth = 880;
const Spacing = {
  one: 4,
  two: 8,
  three: 12,
  four: 16,
  five: 20,
  six: 24,
};

function useTheme() {
  return { background: "#ffffff", text: "#111111" };
}

export default function TabTwoScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };
  const theme = useTheme();

  const contentPlatformStyle = Platform.select({
    android: {
      paddingTop: insets.top,
      paddingLeft: insets.left,
      paddingRight: insets.right,
      paddingBottom: insets.bottom,
    },
    web: {
      paddingTop: Spacing.six,
      paddingBottom: Spacing.four,
    },
  });

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentInset={insets}
      contentContainerStyle={[styles.contentContainer, contentPlatformStyle]}
    >
      <View style={styles.container}>
        <View style={styles.titleContainer}>
          <Text style={styles.subtitle}>Explore</Text>
          <Text style={[styles.centerText, { color: theme.text }]}>
            This starter app includes example{`\n`}code to help you get started.
          </Text>

          <Pressable
            onPress={() => Linking.openURL("https://docs.expo.dev")}
            style={({ pressed }) => (pressed ? styles.pressed : undefined)}
          >
            <View style={[styles.linkButton, { backgroundColor: "#f1f1f1" }]}>
              <Text style={{ color: theme.text }}>Expo documentation</Text>
              <SymbolView
                tintColor={theme.text}
                name={{
                  ios: "arrow.up.right.square",
                  android: "link",
                  web: "link",
                }}
                size={12}
              />
            </View>
          </Pressable>
        </View>

        <View style={styles.sectionsWrapper}>
          <View style={styles.collapsibleCard}>
            <Text style={styles.collapsibleTitle}>File-based routing</Text>
            <Text style={styles.smallText}>
              This app has two screens:{" "}
              <Text style={styles.code}>src/app/index.tsx</Text> and{" "}
              <Text style={styles.code}>src/app/explore.tsx</Text>
            </Text>
            <Text style={styles.smallText}>
              The layout file in{" "}
              <Text style={styles.code}>src/app/_layout.tsx</Text> sets up the
              tab navigator.
            </Text>
          </View>

          <View style={[styles.collapsibleCard, styles.collapsibleContent]}>
            <Text style={styles.collapsibleTitle}>
              Android, iOS, and web support
            </Text>
            <Text style={styles.smallText}>
              You can open this project on Android, iOS, and the web. To open
              the web version, press <Text style={styles.smallBold}>w</Text> in
              the terminal running this project.
            </Text>
            <Image
              source={require("../../assets/icono.png")}
              style={styles.imageTutorial}
            />
          </View>

          <View style={styles.collapsibleCard}>
            <Text style={styles.collapsibleTitle}>Images</Text>
            <Text style={styles.smallText}>
              For static images, you can use the{" "}
              <Text style={styles.code}>@2x</Text> and{" "}
              <Text style={styles.code}>@3x</Text> suffixes to provide files for
              different screen densities.
            </Text>
            <Image
              source={require("../../assets/icono.png")}
              style={styles.imageReact}
            />
          </View>

          <View style={styles.collapsibleCard}>
            <Text style={styles.collapsibleTitle}>
              Light and dark mode components
            </Text>
            <Text style={styles.smallText}>
              This template has light and dark mode support. The{" "}
              <Text style={styles.code}>useColorScheme()</Text> hook lets you
              inspect what the user&apos;s current color scheme is, and so you
              can adjust UI colors accordingly.
            </Text>
          </View>

          <View style={styles.collapsibleCard}>
            <Text style={styles.collapsibleTitle}>Animations</Text>
            <Text style={styles.smallText}>
              This template includes an example of an animated component. The{" "}
              <Text style={styles.code}>src/components/ui/collapsible.tsx</Text>{" "}
              component uses the powerful{" "}
              <Text style={styles.code}>react-native-reanimated</Text> library
              to animate opening this hint.
            </Text>
          </View>
        </View>
        {Platform.OS === "web" && (
          <Text style={{ textAlign: "center", marginTop: 12 }}>Web badge</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  container: {
    maxWidth: MaxContentWidth,
    flexGrow: 1,
  },
  titleContainer: {
    gap: Spacing.three,
    alignItems: "center",
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.six,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  collapsibleCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e6e6e6",
    padding: 12,
    backgroundColor: "#fff",
  },
  collapsibleTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 8,
  },
  smallText: {
    fontSize: 13,
    marginBottom: 8,
  },
  code: {
    fontFamily: Platform.OS === "web" ? "monospace" : undefined,
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 12,
  },
  smallBold: { fontWeight: "700" },
  centerText: {
    textAlign: "center",
  },
  pressed: {
    opacity: 0.7,
  },
  linkButton: {
    flexDirection: "row",
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.five,
    justifyContent: "center",
    gap: Spacing.one,
    alignItems: "center",
  },
  sectionsWrapper: {
    gap: Spacing.five,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
  },
  collapsibleContent: {
    alignItems: "center",
  },
  imageTutorial: {
    width: "100%",
    aspectRatio: 296 / 171,
    borderRadius: Spacing.three,
    marginTop: Spacing.two,
  },
  imageReact: {
    width: 100,
    height: 100,
    alignSelf: "center",
  },
});
