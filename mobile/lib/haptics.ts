import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

export type HapticKind = 'selection' | 'success' | 'warning' | 'light' | 'medium';

/** Tactile feedback without blocking navigation or form actions. */
export function haptic(kind: HapticKind = 'light') {
  if (Platform.OS === 'web') return;
  try {
    let task: Promise<void>;
    switch (kind) {
      case 'selection': task = Haptics.selectionAsync(); break;
      case 'success': task = Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); break;
      case 'warning': task = Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); break;
      case 'medium': task = Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); break;
      default: task = Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    void task.catch(() => {});
  } catch { /* Unsupported platform: visual interaction still works. */ }
}
