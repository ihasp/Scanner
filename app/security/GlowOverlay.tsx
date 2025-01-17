import React, { useEffect, useRef, useMemo } from "react";
import {StyleSheet, Animated } from "react-native";

interface GlowOverlayProps {
  isSafe: boolean;
  visible: boolean;
  duration?: number;
}
const GlowOverlay: React.FC<GlowOverlayProps> = ({
  isSafe,
  visible,
  duration = 2000,
}) => {
  const opacity = useRef(new Animated.Value(0)).current;

  const backgroundColor = useMemo(
    () => (isSafe ? "rgba(0, 255, 0, 0.5)" : "rgba(255, 0, 0, 0.5)"),
    [isSafe]
  );
  const animatedStyle = useMemo(
    () => [styles.overlay, { backgroundColor, opacity }],
    [backgroundColor, opacity]
  );
  useEffect(() => {
    let animationSequence: Animated.CompositeAnimation;
    if (visible) {
      animationSequence = Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 0,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration,
          useNativeDriver: true,
        }),
      ]);
      animationSequence.start();
    }
    return () => {
      animationSequence?.stop();
      opacity.setValue(0);
    };
  }, [visible, duration, opacity]);

  if (!visible) return null;

  return <Animated.View style={animatedStyle} />;
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 90,
  },
});

export default React.memo(GlowOverlay);
