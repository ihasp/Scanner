import { StyleSheet, View, Text, Pressable, Linking } from "react-native";
import { useCameraPermissions } from "expo-camera";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, Redirect, Stack } from "expo-router";

export default function HomeScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const isPermissionGranted = Boolean(permission?.granted);
  return (
    <SafeAreaView style={StyleSheet.absoluteFill}>
      <Stack.Screen
        options={{ title: "Overview", headerShown: false }}
      ></Stack.Screen>
      <View
        style={{ gap: 20, marginTop: 500, marginLeft: 40, marginRight: 40 }}
      >
        <Pressable
          onPress={requestPermission}
          style={
            !isPermissionGranted
              ? styles.buttonStyle
              : styles.buttonRequestPermissions
          }
        >
          <Text
            style={
              !isPermissionGranted
                ? styles.buttonText
                : styles.buttonRequestPermissions
            }
          >
            Zezwól na uprawnienia
          </Text>
        </Pressable>

        {isPermissionGranted && <Redirect href="/scanner" />}

        <Link href="/scanner" asChild>
          <Pressable style={styles.buttonStyle}>
            <Text>Skanuj</Text>
          </Pressable>
        </Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  buttonRequestPermissions: {
    visibility: "hidden",
    opacity: 0,
  },
  buttonStyle: {
    height: 60,
    marginTop: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    backgroundColor: "skyblue",
  },
  buttonText: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "bold",
    letterSpacing: 0.25,
    color: "white",
  },
});
