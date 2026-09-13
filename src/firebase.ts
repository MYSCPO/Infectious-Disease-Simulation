import { initializeApp } from 'firebase/app'
import { connectAuthEmulator, getAuth, signInAnonymously } from 'firebase/auth'
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)

const useEmulator = import.meta.env.VITE_USE_EMULATOR === 'true'
let emulatorsConnected = false
if (useEmulator && !emulatorsConnected) {
  emulatorsConnected = true
  connectFirestoreEmulator(db, '127.0.0.1', 8080)
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
}

let signInPromise: Promise<unknown> | null = null

// 로그인 UI 없이 세션 참여를 허용하기 위한 익명 인증. 보안 규칙은 인증 여부만 확인한다.
export function ensureSignedIn() {
  if (!signInPromise) {
    signInPromise = signInAnonymously(auth)
  }
  return signInPromise
}
