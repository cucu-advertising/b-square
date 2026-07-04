import { useIsFocused } from 'expo-router';

/**
 * Works around a react-navigation bottom-tabs issue where inactive tab
 * screens remain mounted as full-screen siblings and can intercept touches
 * meant for the focused tab (both on native and web). Apply the returned
 * value to the screen's outermost container style.
 */
export function useFocusPointerEvents(): 'auto' | 'none' {
  const isFocused = useIsFocused();
  return isFocused ? 'auto' : 'none';
}
