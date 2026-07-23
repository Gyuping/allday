import { getApp } from '@react-native-firebase/app'
import { getAuth } from '@react-native-firebase/auth'
import { getFirestore } from '@react-native-firebase/firestore'

// google-services.json / GoogleService-Info.plist에서 네이티브가 자동으로 앱을 초기화한다.
// 오프라인 캐시도 네이티브 SDK 기본값으로 항상 켜져 있다 (JS SDK와 달리 별도 설정 불필요).
export const auth = getAuth(getApp())
export const db   = getFirestore(getApp())
