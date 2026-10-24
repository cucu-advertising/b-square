import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useReducedMotion } from '../hooks/useReducedMotion';
import Animated, { FadeInUp } from 'react-native-reanimated';

export default function FirstLaunch() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  useEffect(() => {
    const timeout = setTimeout(() => router.replace('/login'), reduceMotion ? 1500 : 2400);
    return () => clearTimeout(timeout);
  }, [router, reduceMotion]);
  return <LinearGradient colors={['#FFFFFF','#F8FAFE','#DCE9FF']} locations={[0,0.66,1]} style={[styles.container,{paddingTop:insets.top+38,paddingBottom:insets.bottom+46}]}>
    <Text style={styles.wordmark}>B SQUARE</Text>
    <View style={styles.copy}>
      <Animated.Text entering={reduceMotion ? undefined : FadeInUp.duration(650)} style={styles.heading}>
        Your next big opportunity begins with <Text style={styles.blue}>one connection.</Text>
      </Animated.Text>
      <Text style={styles.body}>A private network for ambitious founders, entrepreneurs and business leaders.</Text>
    </View>
    <Text style={styles.caption}>A BETTER WAY TO CONNECT</Text>
  </LinearGradient>;
}
const styles=StyleSheet.create({
  container:{flex:1,paddingHorizontal:32,justifyContent:'space-between'},
  wordmark:{fontFamily:'Ubuntu_700Bold',fontSize:15,letterSpacing:4,color:'#102758'},
  copy:{gap:22},heading:{fontFamily:'Ubuntu_700Bold',fontSize:43,lineHeight:52,letterSpacing:-1.8,color:'#18243A'},
  blue:{color:'#234FC8'},body:{fontFamily:'Ubuntu_400Regular',fontSize:16,lineHeight:26,color:'#62728C',maxWidth:310},
  caption:{fontFamily:'Ubuntu_500Medium',fontSize:11,letterSpacing:2,color:'#234FC8'},
});
