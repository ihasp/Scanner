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
import { Link, Stack } from "expo-router";
import GlowOverlay from "./GlowOverlay";
const { height, width } = Dimensions.get("window");

interface Analysis {
  data: {
    attributes: {
      status: "queued" | "completed";
      results: {
        [key: string]: {
          result: "clean" | "unrated" | "malicious" | "phishing" | "suspicious";
        };
      };
    };
  };
}

interface ScannedLayoutProps {
  data: string;
  analysis: Analysis;
  onClose: () => void;
  onRetry: () => void;
}

export default function ScannedLayout({
  data,
  analysis,
  onClose,
  onRetry,
}: ScannedLayoutProps) {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const [showActivityIndicator, setShowActivityIndicator] = useState(true);
  const [showGlow, setShowGlow] = useState(false);
  const [isSafe, setIsSafe] = useState(true);

  //debug
  console.log("ScannedLayout received analysis:", analysis);

  // Animacja otwarcia menu
  useEffect(() => {
    const animation = Animated.timing(slideAnim, {
      toValue: 1,
      duration: 400,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    });
    animation.start();
    return () => {
      animation.stop();
      slideAnim.setValue(0);
    };
  }, [slideAnim]);

  // Animacja zamknięcia menu
  const handleClose = () => {
    const animClose = Animated.timing(slideAnim, {
      toValue: 0,
      duration: 400,
      easing: Easing.in(Easing.exp),
      useNativeDriver: true,
    });
    animClose.start(() => {
      onClose();
      animClose.stop();
    });
    setTimeout(() => {
      animClose.stop();
    }, 500);
  };

  //scroll na dół strony
  const handleScrollToEnd = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  //Style wyników
  const getResultText = (result: string) => {
    switch (result) {
      case "clean":
        return { text: "Brak zagrożenia", color: "green", priority: 4 };
      case "unrated":
        return { text: "", color: "", priority: 5 };
      case "malicious":
        return { text: "Niebezpieczny link", color: "red", priority: 1 };
      case "phishing":
        return { text: "Phishing", color: "orange", priority: 2 };
      case "suspicious":
        return { text: "Podejrzany link", color: "yellow", priority: 3 };
      default:
        return { text: result, color: "black", priority: 6 };
    }
  };

  useEffect(() => {
    //Jeżeli status od api !== completed, wykonuj interwał
    const interval = setInterval(async () => {
      if (analysis.data.attributes.status !== "completed") {
        await onRetry();
      } else {
        clearInterval(interval);
        //Ekran ładowania
        setShowActivityIndicator(false);
        //Podświetlenie
        const hasDangerousResults = sortedResults.some(
          ({ text }) =>
            text === "Niebezpieczny link" ||
            text === "Phishing" ||
            text === "Podejrzany link"
        );
        setIsSafe(!hasDangerousResults);
        setShowGlow(true);
        setTimeout(() => setShowGlow(false), 2000);
      }
    }, 1000);


    

    return () => clearInterval(interval);
  }, [onRetry, analysis.data.attributes.status]);

  //sortowanie wyników skanowania + style
  const sortedResults = Object.entries(analysis.data.attributes.results)
    .map(([key, value]) => {
      const { text, color, priority } = getResultText(
        (value as { result: string }).result
      );
      return { key, text, color, priority };
    })
    .filter(({ text }) => text !== "")
    .sort((a, b) => a.priority - b.priority);

  const hasDangerousResults = sortedResults.some(
    ({ text }) =>
      text === "Niebezpieczny link" ||
      text === "Phishing" ||
      text === "Podejrzany link"
  );

  return (
    <SafeAreaView style={[StyleSheet.absoluteFillObject, { flex: 1 }]}>
      <Stack.Screen
        options={{
          title: "menu",
          headerShown: false,
        }}
      />
      <GlowOverlay isSafe={isSafe} visible={showGlow} />
      <Animated.View
        style={[
          {
            transform: [
              {
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [height, 0],
                }),
              },
            ],
          },
          StyleSheet.absoluteFill,
          styles.menu,
        ]}
      >
        <Text style={styles.titleMenuText}>Wynik skanu:</Text>
        <Text style={styles.titleMenuTextScanned}>{data}</Text>
        <Pressable style={styles.scrollButtonStyle} onPress={handleScrollToEnd}>
          <Text style={styles.ButtonText}>\/</Text>
        </Pressable>
        {analysis.data.attributes.status === "queued" && (
          <View>
            {showActivityIndicator ? (
              <>
                <Text style={styles.queuedText}>Skanowanie</Text>
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
            ref={scrollViewRef}
            style={styles.scanResultsBlock}
            contentContainerStyle={{ flexGrow: 1 }}
          >
            <View style={{ flexGrow: 1 }}>
              {sortedResults.map(({ key, text, color }) => (
                <View key={key}>
                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                    }}
                  >
                    <Text style={styles.keyText}>{key}: </Text>
                    <Text style={[styles.valueText, { color }]}>{text}</Text>
                  </View>
                </View>
              ))}
              <Pressable
                style={[
                  styles.openURLButtonStyle,
                  hasDangerousResults && { backgroundColor: "#ff4336" },
                ]}
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
    flexGrow: 1,
  },
  titleMenuText: {
    alignSelf: "center",
    fontWeight: "bold",
    fontSize: 20,
    marginTop: 10,
  },
  titleMenuTextScanned: {
    alignSelf: "center",
    fontWeight: "normal",
    fontSize: 13,
    textDecorationLine: "underline",
    marginBottom: 5,
  },
  keyText: {
    fontSize: 13,
    fontWeight: "bold",
    marginLeft: 32,
    color: "black",
    flexGrow: 1,
  },
  valueText: {
    fontSize: 13,
    fontWeight: "bold",
    marginRight: 32,
  },
  queuedText: {
    fontSize: 45,
    fontWeight: "bold",
    color: "#3675ff",
    alignSelf: "center",
    marginTop: 20,
  },
  openURLButtonStyle: {
    alignSelf: "center",
    height: 60,
    width: width / 1.2,
    marginTop: 12,
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
    fontWeight: "bold",
    outlineColor: "black",
    color: "white",
    shadowColor: "black",
    shadowOffset: { width: 0, height: 1 },
  },
  closeButtonStyle: {
    alignSelf: "center",
    height: 60,
    width: width / 1.2,
    marginTop: 12,
    marginBottom: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    backgroundColor: "#3675ff",
  },
  scrollButtonStyle: {
    position: "absolute",
    bottom: 0,
    right: 0,
    marginBottom: 25,
    marginRight: 10,
    zIndex: 300,
    height: 50,
    width: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 100,
    backgroundColor: "black",
    opacity: 0.6,
  },
});
