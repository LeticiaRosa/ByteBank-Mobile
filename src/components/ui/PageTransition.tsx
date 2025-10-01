import React, { useRef, useEffect, ReactNode } from 'react';
import { Animated, Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface PageTransitionProps {
  children: ReactNode;
  isVisible: boolean;
  transitionType?: 'slide' | 'fade' | 'scale';
  direction?: 'horizontal' | 'vertical';
  duration?: number;
}

export function PageTransition({
  children,
  isVisible,
  transitionType = 'slide',
  direction = 'horizontal',
  duration = 300,
}: PageTransitionProps) {
  const fadeAnim = useRef(new Animated.Value(isVisible ? 1 : 0)).current;
  const slideAnim = useRef(
    new Animated.Value(isVisible ? 0 : direction === 'horizontal' ? screenWidth : screenHeight)
  ).current;
  const scaleAnim = useRef(new Animated.Value(isVisible ? 1 : 0.8)).current;

  useEffect(() => {
    if (isVisible) {
      // Animação de entrada
      const animations = [];
      
      if (transitionType === 'fade' || transitionType === 'scale') {
        animations.push(
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration,
            useNativeDriver: true,
          })
        );
      }
      
      if (transitionType === 'slide') {
        animations.push(
          Animated.timing(slideAnim, {
            toValue: 0,
            duration,
            useNativeDriver: true,
          })
        );
      }
      
      if (transitionType === 'scale') {
        animations.push(
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          })
        );
      }

      Animated.parallel(animations).start();
    } else {
      // Animação de saída
      const animations = [];
      
      if (transitionType === 'fade' || transitionType === 'scale') {
        animations.push(
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: duration * 0.8,
            useNativeDriver: true,
          })
        );
      }
      
      if (transitionType === 'slide') {
        animations.push(
          Animated.timing(slideAnim, {
            toValue: direction === 'horizontal' ? -screenWidth : -screenHeight,
            duration: duration * 0.8,
            useNativeDriver: true,
          })
        );
      }
      
      if (transitionType === 'scale') {
        animations.push(
          Animated.timing(scaleAnim, {
            toValue: 0.8,
            duration: duration * 0.8,
            useNativeDriver: true,
          })
        );
      }

      Animated.parallel(animations).start();
    }
  }, [isVisible, fadeAnim, slideAnim, scaleAnim, transitionType, direction, duration]);

  const getAnimatedStyle = () => {
    const transform = [];

    if (transitionType === 'slide') {
      if (direction === 'horizontal') {
        transform.push({ translateX: slideAnim });
      } else {
        transform.push({ translateY: slideAnim });
      }
    }

    if (transitionType === 'scale') {
      transform.push({ scale: scaleAnim });
    }

    return {
      opacity: transitionType === 'fade' || transitionType === 'scale' ? fadeAnim : 1,
      transform: transform.length > 0 ? transform : undefined,
    };
  };

  return (
    <Animated.View
      style={[
        { flex: 1 },
        getAnimatedStyle(),
      ]}
    >
      {children}
    </Animated.View>
  );
}

// Hook para gerenciar transições entre múltiplas seções
export function useSectionTransition(sections: string[], initialSection: string = sections[0]) {
  const [currentSection, setCurrentSection] = React.useState(initialSection);
  const [isTransitioning, setIsTransitioning] = React.useState(false);

  const transitionTo = (section: string) => {
    if (sections.includes(section) && section !== currentSection && !isTransitioning) {
      setIsTransitioning(true);
      
      setTimeout(() => {
        setCurrentSection(section);
        setIsTransitioning(false);
      }, 150); // Metade da duração da transição
    }
  };

  return {
    currentSection,
    isTransitioning,
    transitionTo,
    isCurrentSection: (section: string) => section === currentSection,
  };
}