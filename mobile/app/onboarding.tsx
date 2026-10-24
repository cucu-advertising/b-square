import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { ScalePressable } from '../components/AnimatedUI';
import { PrimaryButton } from '../components/PrimaryButton';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useAuthStore } from '../lib/store';
import { INDUSTRIES } from '../lib/mockData';
import { haptic } from '../lib/haptics';

const prompts = [
  { eyebrow: 'YOUR AMBITION', lead: 'I want B Square to help me...', answers: ['grow my business.', 'find the right people.', 'learn from other founders.', 'open new doors.'], response: 'Your next connection should move you forward.' },
  { eyebrow: 'YOUR PEOPLE', lead: 'The people I want to meet are...', answers: ['founders building serious companies.', 'investors and strategic partners.', 'operators who know how to scale.', 'people who think like I do.'], response: 'We will shape discovery around your interests.' },
  { eyebrow: 'YOUR STYLE', lead: 'The conversations I value most are...', answers: ['honest and direct.', 'thoughtful and long-term.', 'practical and opportunity-led.', 'a mix of everything.'], response: 'Good connections start with good conversations.' },
];
export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const businessName = useAuthStore(s => s.businessName);
  const setBusinessName = useAuthStore(s => s.setBusinessName);
  const industry = useAuthStore(s => s.industry);
  const setIndustry = useAuthStore(s => s.setIndustry);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>(['','','']);
  const [showResponse, setShowResponse] = useState(false);
  const question = prompts[step];
  const choose = (answer: string) => {
    haptic('selection');
    setAnswers(old => old.map((v,i) => i === step ? answer : v));
    setShowResponse(true);
  };
  const advance = () => {
    haptic('medium');
    if (step < 3) { setStep(s => s+1); setShowResponse(false); }
    else router.push('/eligibility');
  };
  return <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{flex:1}}>
    <LinearGradient colors={['#FFFFFF','#F8FAFE','#E6EFFF']} locations={[0,0.7,1]} style={{flex:1}}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[styles.scroll,{paddingTop:insets.top+32,paddingBottom:insets.bottom+32}]}>
        <View style={styles.header}>
          <Text style={styles.brand}>B SQUARE</Text>
          <Text style={styles.counter}>{String(step+1).padStart(2,'0')} / 04</Text>
        </View>
        <View style={styles.track}><View style={[styles.progress,{width:`${(step+1)*25}%` as `${number}%`}]} /></View>
        {step < 3 ? <Animated.View key={step} entering={reduceMotion ? undefined : FadeInRight.duration(360)} exiting={reduceMotion ? undefined : FadeOutLeft.duration(180)} style={styles.question}>
          <Text style={styles.eyebrow}>{question.eyebrow}</Text>
          <Text style={styles.title}>{question.lead.split('...')[0]}<Text style={styles.blue}>...</Text></Text>
          <View style={styles.answers}>{question.answers.map((answer,i) => {
            const selected = answers[step] === answer;
            return <ScalePressable key={answer} onPress={()=>choose(answer)} style={[styles.answer,selected&&styles.selected]}>
              <Text style={[styles.answerText,selected&&styles.answerActive]}>{answer}</Text>
              <Text style={[styles.arrow,selected&&styles.answerActive]}>{selected?'✓':'→'}</Text>
            </ScalePressable>;
          })}</View>
          {showResponse && <Text style={styles.feedback}>{question.response}</Text>}
        </Animated.View> : <Animated.View entering={reduceMotion?undefined:FadeInRight.duration(360)} style={styles.question}>
          <Text style={styles.eyebrow}>YOUR BUSINESS</Text>
          <Text style={styles.title}>Let's make your <Text style={styles.blue}>introduction.</Text></Text>
          <Text style={styles.support}>A few details help other verified members know who they're meeting.</Text>
          <Text style={styles.fieldLabel}>COMPANY NAME</Text>
          <TextInput value={businessName} onChangeText={setBusinessName} placeholder="Your company name" placeholderTextColor="#8A9AB2" style={styles.input}/>
          <Text style={styles.fieldLabel}>INDUSTRY</Text>
          <View style={styles.chips}>{INDUSTRIES.map(item=><ScalePressable key={item} onPress={()=>setIndustry(item)} style={[styles.chip,industry===item&&styles.selected]}><Text style={[styles.chipText,industry===item&&styles.answerActive]}>{item}</Text></ScalePressable>)}</View>
        </Animated.View>}
        <View style={styles.spacer}/>
        <PrimaryButton label={step===3?'Continue to verification':'Continue  →'} disabled={step===3?(!businessName.trim()||!industry):!answers[step]} onPress={advance}/>
        {step>0&&<ScalePressable onPress={()=>{setStep(s=>s-1);setShowResponse(false);}} style={styles.back}><Text style={styles.backText}>←  Previous question</Text></ScalePressable>}
      </ScrollView>
    </LinearGradient>
  </KeyboardAvoidingView>;
}
const styles=StyleSheet.create({
 scroll:{paddingHorizontal:26,flexGrow:1},header:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},
 brand:{fontFamily:'Ubuntu_700Bold',color:'#102758',fontSize:13,letterSpacing:3},
 counter:{fontFamily:'Ubuntu_500Medium',fontSize:12,color:'#7385A3'},
 track:{height:3,borderRadius:3,backgroundColor:'#E0E8F5',marginTop:24,overflow:'hidden'},
 progress:{height:3,backgroundColor:'#234FC8',borderRadius:3},
 question:{paddingTop:36,gap:12},
 eyebrow:{fontFamily:'Ubuntu_700Bold',fontSize:11,letterSpacing:2.4,color:'#234FC8'},
 title:{fontFamily:'Ubuntu_700Bold',fontSize:32,lineHeight:40,color:'#18243A',letterSpacing:-1.3,marginTop:8,marginBottom:16},
 blue:{color:'#234FC8'},support:{fontFamily:'Ubuntu_400Regular',color:'#667894',fontSize:15,lineHeight:23,marginBottom:14},
 answers:{gap:5},answer:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',borderBottomColor:'#E1E9F4',borderBottomWidth:1,paddingVertical:17,paddingHorizontal:12,borderRadius:12},
 selected:{backgroundColor:'#DFEAFF',borderColor:'#B6CCF9',borderWidth:1},
 answerText:{fontFamily:'Ubuntu_500Medium',fontSize:16,color:'#25344E',flex:1,paddingRight:10},
 arrow:{fontFamily:'Ubuntu_500Medium',color:'#8092AE',fontSize:20},answerActive:{color:'#234FC8'},
 feedback:{fontFamily:'Ubuntu_400Regular',fontSize:13,color:'#5873A6',marginTop:12},
 spacer:{flex:1,minHeight:24},back:{padding:19,alignItems:'center'},backText:{fontFamily:'Ubuntu_500Medium',color:'#647592',fontSize:13},
 fieldLabel:{fontFamily:'Ubuntu_700Bold',letterSpacing:1.6,fontSize:11,color:'#71819E',marginTop:16},
 input:{backgroundColor:'#FFFFFF',borderColor:'#DEE7F5',borderWidth:1,borderRadius:16,paddingHorizontal:17,paddingVertical:17,fontFamily:'Ubuntu_500Medium',fontSize:16,color:'#18243A'},
 chips:{flexDirection:'row',flexWrap:'wrap',gap:9,marginTop:2},
 chip:{borderColor:'#DEE7F5',borderWidth:1,paddingHorizontal:14,paddingVertical:11,borderRadius:999,backgroundColor:'#FFFFFF'},
 chipText:{fontFamily:'Ubuntu_500Medium',color:'#536782',fontSize:13},
});
