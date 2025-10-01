import React, { useRef } from 'react';
import { Animated, ScrollView, ScrollViewProps } from 'react-native';

interface AnimatedScrollViewProps extends ScrollViewProps {
  children: React.ReactNode;
  enableParallax?: boolean;
  parallaxFactor?: number;
}

export function AnimatedScrollView({
  children,
  enableParallax = false,
  parallaxFactor = 0.5,
  ...props
}: AnimatedScrollViewProps) {
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeHeaderAnim = useRef(new Animated.Value(1)).current;

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { 
      useNativeDriver: false,
      listener: (event: any) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        
        // Fade header baseado no scroll
        const headerOpacity = offsetY > 50 ? 0 : 1 - (offsetY / 50);
        fadeHeaderAnim.setValue(headerOpacity);
      }
    }
  );

  return (
    <ScrollView
      {...props}
      onScroll={handleScroll}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}

// Hook para criar efeitos de parallax em componentes filhos
export function useParallaxEffect(scrollY: Animated.Value, factor: number = 0.5) {
  return {
    transform: [
      {
        translateY: scrollY.interpolate({
          inputRange: [0, 300],
          outputRange: [0, 300 * factor],
          extrapolate: 'clamp',
        }),
      },
    ],
  };
}

// Hook para fade baseado no scroll
export function useScrollFade(scrollY: Animated.Value, threshold: number = 100) {
  return {
    opacity: scrollY.interpolate({
      inputRange: [0, threshold],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    }),
  };
}