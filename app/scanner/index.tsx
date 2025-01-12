import React, { useRef, useEffect, useState } from "react";
import {
  AppState,
  Linking,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
} from "react-native";
import { Stack } from "expo-router";
import { CameraView } from "expo-camera";
import { Overlay } from "./Overlay";
import ScannedLayout from "../security/Scannedmenu";
import { scanUrl, getAnalysis } from "../security/virustotalservice";

export default function Home() {
  const qrLock = useRef(false);
  const appState = useRef(AppState.currentState);
  const [showScannedLayout, setShowScannedLayout] = useState(false);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<string | any>(null);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        qrLock.current = false;
      }
      appState.current = nextAppState;
    });

    return () => {
      sub.remove();
    };
  }, []);

  const handleClose = () => {
    setShowScannedLayout(false);
    setScannedData(null);
    setAnalysisData(null);
    qrLock.current = false;
  };

  const handleRetry = async () => {
    if (scannedData) {
      try {
        const analysisId = await scanUrl(scannedData);
        const analysis = await getAnalysis(analysisId);
        setAnalysisData(analysis);
        setShowScannedLayout(true);
      } catch (e) {
        console.error("Error at scanning or getting analysis", e);
      }
    }
  };

  return (
    <SafeAreaView style={StyleSheet.absoluteFillObject}>
      <Stack.Screen
        options={{
          title: "Overview",
          headerShown: false,
        }}
      />
      {Platform.OS === "android" ? <StatusBar translucent /> : null}
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={async ({ data }) => {
          setScannedData(data);
          if (data && !qrLock.current) {
            qrLock.current = true;
            try {
              const analysisId = await scanUrl(data);
              const analysis = await getAnalysis(analysisId);
              setAnalysisData(analysis);
              setShowScannedLayout(true);
            } catch (e) {
              console.error("Error at scanning or getting analysis", e);
            }
          }
        }}
      />
      <Overlay />
      {showScannedLayout && scannedData && (
        <ScannedLayout
          data={scannedData}
          analysis={analysisData}
          onClose={handleClose}
          onRetry={handleRetry}
        />
      )}
    </SafeAreaView>
  );
}
