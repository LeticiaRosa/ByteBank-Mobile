import { useRef } from 'react';
import { Animated } from 'react-native';

interface StaggeredAnimationConfig {
  itemCount: number;
  duration?: number;
  staggerDelay?: number;
  initialDelay?: number;
  initialOpacity?: number;
  initialTranslateY?: number;
  initialScale?: number;
}

export function useStaggeredAnimation({
  itemCount,
  duration = 600,
  staggerDelay = 150,
  initialDelay = 0,
  initialOpacity = 0,
  initialTranslateY = 30,
  initialScale = 0.9,
}: StaggeredAnimationConfig) {
  const fadeAnims = useRef(
    Array.from({ length: itemCount }, () => new Animated.Value(initialOpacity))
  ).current;

  const translateYAnims = useRef(
    Array.from({ length: itemCount }, () => new Animated.Value(initialTranslateY))
  ).current;

  const scaleAnims = useRef(
    Array.from({ length: itemCount }, () => new Animated.Value(initialScale))
  ).current;

  const createStaggeredAnimation = () => {
    const animations = fadeAnims.map((fadeAnim, index) =>
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration,
          delay: initialDelay + index * staggerDelay,
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnims[index], {
          toValue: 0,
          duration,
          delay: initialDelay + index * staggerDelay,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnims[index], {
          toValue: 1,
          duration,
          delay: initialDelay + index * staggerDelay,
          useNativeDriver: true,
        }),
      ])
    );

    return Animated.stagger(100, animations);
  };

  const resetAnimations = () => {
    fadeAnims.forEach(anim => anim.setValue(initialOpacity));
    translateYAnims.forEach(anim => anim.setValue(initialTranslateY));
    scaleAnims.forEach(anim => anim.setValue(initialScale));
  };

  const startAnimations = () => {
    createStaggeredAnimation().start();
  };

  const getAnimatedStyle = (index: number) => ({
    opacity: fadeAnims[index],
    transform: [
      { translateY: translateYAnims[index] },
      { scale: scaleAnims[index] },
    ],
  });

  return {
    startAnimations,
    resetAnimations,
    getAnimatedStyle,
    fadeAnims,
    translateYAnims,
    scaleAnims,
  };
}