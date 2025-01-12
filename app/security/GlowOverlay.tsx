import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface GlowOverlayProps {
    isSafe: boolean;
    duration?: number;
}

const GlowOverlay: React.FC<GlowOverlayProps> = ({ isSafe, duration = 3000 }) => {
    const [visible, setVisible] = useState(true);
    const opacity = new Animated.Value(1);

    useEffect(() => {
        Animated.timing(opacity, {
            toValue: 0,
            duration: duration,
            useNativeDriver: true,
        }).start(() => setVisible(false));
    }, [duration]);

    if (!visible) return null;

    return (
        <Animated.View style={[styles.overlay, { backgroundColor: isSafe ? 'rgba(0, 255, 0, 0.5)' : 'rgba(255, 0, 0, 0.5)', opacity }]}>
            <View style={styles.glow} />
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    glow: {
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'white',
        opacity: 0.5,
    },
});

export default GlowOverlay;