import { useEffect, useState } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert,
} from 'react-native'
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin'
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { THEME } from '@/lib/colors'

GoogleSignin.configure({
  webClientId: '908860944655-1kgkelqbr0oh79eudt22i3e2vqbabr8f.apps.googleusercontent.com',
  offlineAccess: false,
})

export default function LoginScreen() {
  const [loading, setLoading] = useState(false)

  const signInWithGoogle = async () => {
    setLoading(true)
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true })
      const userInfo = await GoogleSignin.signIn()
      const idToken = userInfo.data?.idToken
      if (!idToken) throw new Error('idToken 없음')
      const credential = GoogleAuthProvider.credential(idToken)
      await signInWithCredential(auth, credential)
    } catch (e: any) {
      if (e.code === statusCodes.SIGN_IN_CANCELLED) {
        // 사용자가 직접 취소
      } else if (e.code === statusCodes.IN_PROGRESS) {
        // 이미 진행 중
      } else if (e.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert('오류', 'Google Play 서비스가 필요합니다.')
      } else {
        console.error('[login]', e)
        Alert.alert('로그인 실패', '다시 시도해주세요.')
      }
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.logoWrap}>
          <Text style={styles.logo}>
            <Text style={styles.logoWhite}>My All</Text>
            <Text style={styles.logoAccent}>~Day</Text>
          </Text>
          <Text style={styles.subtitle}>캘린더 · 할일 · 포모도로를 한 곳에</Text>
        </View>

        <View style={styles.divider} />

        <TouchableOpacity
          style={styles.googleBtn}
          onPress={signInWithGoogle}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#171717" />
          ) : (
            <>
              <Text style={styles.googleIconText}>G</Text>
              <Text style={styles.googleBtnText}>Google로 시작하기</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.hint}>로그인하면 모든 기기에서 데이터가 동기화돼요</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.bg,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: THEME.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: THEME.border,
    padding: 32,
    alignItems: 'center',
  },
  logoWrap: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -1,
    marginBottom: 8,
  },
  logoWhite: {
    color: THEME.text,
  },
  logoAccent: {
    color: '#818cf8',
  },
  subtitle: {
    color: THEME.textMuted,
    fontSize: 13,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: THEME.border,
    marginBottom: 24,
  },
  googleBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 12,
  },
  googleIconText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4285F4',
  },
  googleBtnText: {
    color: '#171717',
    fontSize: 15,
    fontWeight: '600',
  },
  hint: {
    color: THEME.textMuted,
    fontSize: 11,
    textAlign: 'center',
  },
})
