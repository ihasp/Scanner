import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Animated,
  StyleSheet,
  Dimensions,
  Easing,
  Platform,
  SafeAreaView,
} from "react-native";
import { ScrollView } from "react-native";

const { height, width } = Dimensions.get("window");

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
  // console.log("ScannedLayout received data:", data);
  console.log("ScannedLayout received analysis:", analysis);

  return (
    <SafeAreaView style={StyleSheet.absoluteFillObject}>
      <Animated.View
        style={
          (Platform.OS === "android"
            ? { flex: 1 }
            : StyleSheet.absoluteFillObject,
          [
            styles.menu,
            {
              transform: [{ translateY: slideAnim }],
            },
          ])
        }
      >
        <Text style={styles.menuText}>Analysis:</Text>
        {analysis.data.attributes.status === "queued" && (
          <Text style={styles.menuText}>Queued</Text>
        )}

        {analysis.data.attributes.status === "completed" && (
          <ScrollView style={styles.scrollView}>
            {Object.entries(analysis.data.attributes.results).map(
              ([key, value]) => (
                <Text key={key} style={styles.menuText}>
                  {key}: {(value as { result: string }).result}
                </Text>
              )
            )}
          </ScrollView>
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  menu: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: (3 * height) / 2.8,
    width: width,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  scrollView: {
    flex: 1,
    width: width,
  },
  menuText: {
    fontFamily: "Lato",
    fontSize: 13,
  },
});
