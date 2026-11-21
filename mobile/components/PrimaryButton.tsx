import { Text, View } from 'react-native';
import { ArrowRight } from 'lucide-react-native';
import { ScalePressable } from './AnimatedUI';
import { useThemeColors } from '../lib/theme';

type PrimaryButtonProps = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  fullWidth?: boolean;
};

export function PrimaryButton({ label, onPress, disabled = false, fullWidth = true }: PrimaryButtonProps) {
  const colors = useThemeColors();
  return <ScalePressable
    accessibilityRole="button"
    accessibilityLabel={label}
    accessibilityState={{ disabled }}
    onPress={onPress}
    disabled={disabled}
    style={{ width: fullWidth ? '100%' : undefined, alignSelf: fullWidth ? 'stretch' : 'flex-start', minHeight: 54, backgroundColor: colors.accent, borderRadius: 13, paddingVertical: 16, paddingHorizontal: 19, opacity: disabled ? 0.46 : 1 }}
  >
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
      <Text style={{ color: colors.onAccent, fontFamily: 'Ubuntu_700Bold', fontSize: 15, flexShrink: 1, textAlign: 'center' }}>{label}</Text>
      <ArrowRight size={17} color={colors.onAccent} strokeWidth={2.2} />
    </View>
  </ScalePressable>;
}
