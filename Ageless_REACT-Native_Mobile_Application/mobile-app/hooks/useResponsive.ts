import { useState, useEffect } from 'react';
import { Dimensions, useWindowDimensions } from 'react-native';

export interface ResponsiveLayout {
  isLandscape: boolean;
  isPortrait: boolean;
  screenWidth: number;
  screenHeight: number;
  isSmallDevice: boolean;
  isMediumDevice: boolean;
  isLargeDevice: boolean;
  containerWidth: number;
  numColumns: number;
}

/**
 * Hook for handling responsive design and orientation changes
 * Provides layout information and handles landscape/portrait transitions
 */
export const useResponsive = (): ResponsiveLayout => {
  const dimensions = useWindowDimensions();
  const [layout, setLayout] = useState<ResponsiveLayout>(() => calculateLayout(dimensions));

  useEffect(() => {
    const updateLayout = () => {
      const newDimensions = Dimensions.get('window');
      setLayout(calculateLayout(newDimensions));
    };

    const subscription = Dimensions.addEventListener('change', updateLayout);
    return () => subscription?.remove();
  }, []);

  return layout;
};

const calculateLayout = (dimensions: any): ResponsiveLayout => {
  const { width, height } = dimensions;
  const isLandscape = width > height;
  const isPortrait = !isLandscape;

  // Device size classification
  const isSmallDevice = width < 375;
  const isMediumDevice = width >= 375 && width < 480;
  const isLargeDevice = width >= 480;

  // Container width accounting for padding
  const padding = 16;
  const containerWidth = width - padding * 2;

  // Dynamic column count based on orientation and device size
  let numColumns = 1;
  if (isLandscape) {
    numColumns = isSmallDevice ? 2 : 3;
  } else {
    numColumns = 1;
  }

  return {
    isLandscape,
    isPortrait,
    screenWidth: width,
    screenHeight: height,
    isSmallDevice,
    isMediumDevice,
    isLargeDevice,
    containerWidth,
    numColumns,
  };
};

/**
 * Hook for managing landscape-specific UI adjustments
 * Returns object with landscape-aware dimension values
 */
export const useLandscapeAware = () => {
  const responsive = useResponsive();

  return {
    ...responsive,
    // Adjusted sizes for landscape mode
    headerHeight: responsive.isLandscape ? 48 : 56,
    contentPaddingHorizontal: responsive.isLandscape ? 24 : 16,
    contentPaddingVertical: responsive.isLandscape ? 12 : 16,
    scrollViewEnabled: !responsive.isLandscape || responsive.screenHeight < 600,
  };
};
