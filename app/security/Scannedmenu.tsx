import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Animated,
  StyleSheet,
  Dimensions,
  Easing,
  Platform,
} from "react-native";

const { height } = Dimensions.get("window");

export default function ScannedLayout({
  data,
  analysis,
}: {
  data: string;
  analysis: any;
}) {
  const slideAnim = useRef(new Animated.Value(height)).current;
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: height / 4,
      duration: 350,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
  }, []);

  // Debugging: Log the received props
  console.log("ScannedLayout received data:", data);
  console.log("ScannedLayout received analysis:", analysis);

  return (
    <Animated.View
      style={
        Platform.OS === "android" ? { flex: 1 } : StyleSheet.absoluteFillObject,
        [
        styles.menu,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Text style={styles.menuText}>QR Code Scanned!</Text>
      <Text style={styles.menuText}>Data: {data}</Text>
      <Text style={styles.menuText}>Analysis:</Text>
      {analysis && (
        <View>
          {Object.entries(analysis.data.attributes.results).map(
            ([key, value]) => (
              <Text key={key} style={styles.menuText}>
                {key}: {(value as { result: string }).result}
              </Text>
            )
          )}
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  menu: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: (3 * height) / 2.8,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  menuText: {
    fontSize: 18,
    margin: 10,
  },
});
