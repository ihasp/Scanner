import { scale } from "@shopify/react-native-skia";
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Animated,
  StyleSheet,
  Dimensions,
  Easing,
  SafeAreaView,
  Pressable,
  ActivityIndicator,
  Linking,
  ScrollView,
} from "react-native";
import { Link } from "expo-router";

const { height, width } = Dimensions.get("window");

export default function ScannedLayout({
  data,
  analysis,
  onClose,
  onRetry,
}: {
  data: string;
  analysis: any;
  onClose: () => void;
  onRetry: () => void;
}) {
  const slideAnim = useRef(new Animated.Value(height)).current;
  const [showActivityIndicator, setShowActivityIndicator] = useState(true);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: height / 600,
      duration: 400,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      setShowActivityIndicator(false);
      onRetry();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onRetry]);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 400,
      easing: Easing.in(Easing.exp),
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  console.log("ScannedLayout received analysis:", analysis);

  return (
    <SafeAreaView style={[StyleSheet.absoluteFillObject, { flex: 1 }]}>
      <Animated.View
        style={[
          { transform: [{ translateY: slideAnim }] },
          StyleSheet.absoluteFill,
          styles.menu,
        ]}
      >
        <Text style={styles.titleMenuText}>Wynik skanu:</Text>
        <Text style={styles.titleMenuTextScanned}>{data}</Text>

        {analysis.data.attributes.status === "queued" && (
          <View>
            {showActivityIndicator ? (
              <>
                <Text style={styles.queuedText}>
                  Czekam na odpowiedź serwera
                </Text>
                <ActivityIndicator
                  size={"large"}
                  style={[
                    {
                      marginTop: 30,
                      transform: [{ scale: 2 }],
                    },
                  ]}
                />
              </>
            ) : null}
          </View>
        )}

        {analysis.data.attributes.status === "completed" && (
          <ScrollView
            style={styles.scanResultsBlock}
            contentContainerStyle={{ flexGrow: 1 }}
          >
            <View style={{ flexGrow: 1 }}>
              {Object.entries(analysis.data.attributes.results).map(
                ([key, value]) => (
                  <View key={key}>
                    <View
                      style={{
                        flexDirection: "row",
                        flexWrap: "wrap",
                      }}
                    >
                      <Text style={styles.keyText}>{key}: </Text>
                      <Text style={styles.valueText}>
                        {(value as { result: string }).result}
                      </Text>
                    </View>
                  </View>
                )
              )}
              <Pressable
                style={styles.openURLButtonStyle}
                onPress={() => {
                  Linking.openURL(data);
                }}
              >
                <Text style={styles.ButtonText}>Przejdź do strony</Text>
              </Pressable>
              <Link href="/scanner" asChild>
                <Pressable
                  style={styles.closeButtonStyle}
                  onPress={handleClose}
                >
                  <Text style={styles.ButtonText}>Skanuj ponownie</Text>
                </Pressable>
              </Link>
            </View>
          </ScrollView>
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  menu: {
    position: "absolute",
    top: 100,
    justifyContent: "flex-start",
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    backgroundColor: "white",
    elevation: 5,
  },
  scanResultsBlock: {
    width: width,
    marginTop: 5,
    flexGrow: 1,
  },
  titleMenuText: {
    alignSelf: "center",
    fontFamily: "Lato",
    fontWeight: "bold",
    fontSize: 20,
    marginTop: 10,
  },
  titleMenuTextScanned: {
    alignSelf: "center",
    fontWeight: "normal",
    fontSize: 13,
    textDecorationLine: "underline",
    marginBottom: 10,
  },
  keyText: {
    fontFamily: "Lato",
    fontSize: 13,
    fontWeight: "normal",
    marginLeft: 10,
    color: "#2cdb38",
    flexGrow: 1,
  },
  valueText: {
    fontFamily: "Lato",
    fontSize: 13,
    fontWeight: "bold",
    marginRight: 10,
  },
  queuedText: {
    fontFamily: "Lato",
    fontSize: 45,
    fontWeight: "bold",
    color: "orange",
    alignSelf: "center",
    marginTop: 20,
  },
  openURLButtonStyle: {
    alignSelf: "center",
    height: 60,
    width: width / 1.2,
    marginTop: 10,
    marginBottom: 5,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    backgroundColor: "#6ae66e",
  },
  ButtonText: {
    fontSize: 16,
    lineHeight: 21,
    fontFamily: "Lato",
    fontWeight: "bold",
  },
  closeButtonStyle: {
    alignSelf: "center",
    height: 60,
    width: width / 1.2,
    marginTop: 12,
    marginBottom: 5,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    backgroundColor: "skyblue",
  },
});
