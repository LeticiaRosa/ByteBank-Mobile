import { useRef, useEffect, ReactNode } from "react";
import { Animated, ViewStyle } from "react-native";

interface FadeInViewProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  direction?: "up" | "down" | "left" | "right";
  style?: ViewStyle;
}

export function FadeInView({
  children,
  delay = 0,
  duration = 600,
  direction = "up",
  style,
}: FadeInViewProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateAnim = useRef(
    new Animated.Value(getInitialTranslate(direction))
  ).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  function getInitialTranslate(dir: string): number {
    switch (dir) {
      case "up":
        return 30;
      case "down":
        return -30;
      case "left":
        return 30;
      case "right":
        return -30;
      default:
        return 30;
    }
  }

  function getTransformProperty(dir: string) {
    switch (dir) {
      case "up":
      case "down":
        return { translateY: translateAnim };
      case "left":
      case "right":
        return { translateX: translateAnim };
      default:
        return { translateY: translateAnim };
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(translateAnim, {
          toValue: 0,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [fadeAnim, translateAnim, scaleAnim, delay, duration]);

  return (
    <Animated.View
      style={[
        {
          opacity: fadeAnim,
          transform: [getTransformProperty(direction), { scale: scaleAnim }],
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}

// Hook para criar animações de loading skeleton
export function useSkeletonAnimation() {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    pulseAnimation.start();

    return () => pulseAnimation.stop();
  }, [pulseAnim]);

  return { opacity: pulseAnim };
}
