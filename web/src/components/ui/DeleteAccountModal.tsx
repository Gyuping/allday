'use client'

import { useState, useRef } from 'react'
import { FirebaseError } from 'firebase/app'
import { AlertTriangle } from 'lucide-react'
import Modal from './Modal'
import { useAuth } from '@/contexts/AuthContext'
import {
  deleteFirestoreData,
  deleteLocalStorage,
  reauthenticateGoogle,
  deleteAuthAccount,
} from '@/lib/firestore/deleteAccount'

type Step = 'confirm' | 'deleting' | 'auth-failed' | 'fs-failed' | 'auth-del-failed'

export default function DeleteAccountModal({ onClose }: { onClose: () => void }) {
  const { user, logout } = useAuth()
  const [step, setStep] = useState<Step>('confirm')
  const [input, setInput] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const running = useRef(false)

  const run = async () => {
    if (!user || running.current) return
    running.current = true
    setStep('deleting')

    try {
      await reauthenticateGoogle(user)
    } catch (e) {
      running.current = false
      if (e instanceof FirebaseError) {
        if (e.code === 'auth/popup-closed-by-user' || e.code === 'auth/cancelled-popup-request') {
          setStep('confirm'); return
        }
        if (e.code === 'auth/user-mismatch') {
          setErrorMsg('다른 Google 계정을 선택하셨어요. 삭제할 계정과 동일한 계정으로 재인증해주세요.')
          setStep('auth-failed'); return
        }
      }
      setErrorMsg('재인증 중 오류가 발생했어요. 다시 시도해주세요.')
      setStep('auth-failed'); return
    }

    try {
      await deleteFirestoreData(user.uid)
    } catch {
      running.current = false
      setErrorMsg('데이터 삭제 중 오류가 발생했어요. 다시 시도하면 안전하게 재실행됩니다.')
      setStep('fs-failed'); return
    }

    deleteLocalStorage(user.uid)

    try {
      await deleteAuthAccount(user)
      // onAuthStateChanged → user: null → AppShell이 LoginScreen 표시
    } catch {
      running.current = false
      setErrorMsg('데이터는 삭제됐지만 계정 제거 중 오류가 발생했어요.')
      setStep('auth-del-failed')
    }
  }

  const retry = () => { running.current = false; run() }

  if (step === 'deleting') {
    return (
      <Modal title="계정 삭제 중" onClose={() => {}}>
        <div className="flex flex-col items-center gap-4 p-8">
          <div className="w-8 h-8 border-2 border-neutral-700 border-t-red-400 rounded-full animate-spin" />
          <p className="text-sm text-neutral-400">데이터를 삭제하고 있어요…</p>
        </div>
      </Modal>
    )
  }

  if (step === 'auth-failed') {
    return (
      <Modal title="재인증 실패" onClose={onClose}>
        <div className="p-5 flex flex-col gap-4">
          <p className="text-sm text-neutral-300">{errorMsg}</p>
          <div className="flex flex-col gap-2">
            <button onClick={() => { running.current = false; setStep('confirm') }}
              className="w-full py-2.5 rounded-xl bg-neutral-700 text-sm hover:bg-neutral-600 transition-colors">
              다시 시도
            </button>
            <button onClick={onClose}
              className="w-full py-2.5 text-sm text-neutral-500 hover:text-neutral-300 transition-colors">
              취소
            </button>
          </div>
        </div>
      </Modal>
    )
  }

  if (step === 'fs-failed') {
    return (
      <Modal title="삭제 실패" onClose={onClose}>
        <div className="p-5 flex flex-col gap-4">
          <p className="text-sm text-neutral-300">{errorMsg}</p>
          <div className="flex flex-col gap-2">
            <button onClick={retry}
              className="w-full py-2.5 rounded-xl bg-neutral-700 text-sm hover:bg-neutral-600 transition-colors">
              재인증 후 다시 시도
            </button>
            <button onClick={onClose}
              className="w-full py-2.5 text-sm text-neutral-500 hover:text-neutral-300 transition-colors">
              취소
            </button>
          </div>
        </div>
      </Modal>
    )
  }

  if (step === 'auth-del-failed') {
    return (
      <Modal title="계정 삭제 오류" onClose={onClose}>
        <div className="p-5 flex flex-col gap-4">
          <p className="text-sm text-neutral-300">{errorMsg}</p>
          <div className="flex flex-col gap-2">
            <button onClick={retry}
              className="w-full py-2.5 rounded-xl bg-neutral-700 text-sm hover:bg-neutral-600 transition-colors">
              재인증 후 다시 시도
            </button>
            <button onClick={() => logout()}
              className="w-full py-2.5 rounded-xl text-sm text-neutral-500 hover:bg-neutral-800 transition-colors">
              로그아웃
            </button>
            <a href={`mailto:u48743499@gmail.com?subject=${encodeURIComponent('AllDay 계정 삭제 오류 문의')}`}
              className="w-full py-2.5 text-sm text-neutral-500 hover:text-neutral-300 text-center transition-colors">
              문의하기
            </a>
          </div>
        </div>
      </Modal>
    )
  }

  return (
    <Modal title="계정 및 데이터 삭제" onClose={onClose}>
      <div className="p-5 flex flex-col gap-5">
        <div className="flex gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
          <AlertTriangle size={16} className="text-red-400 shrink-0 mt-0.5" />
          <div className="text-xs text-red-300 leading-relaxed">
            <p className="font-medium mb-1">다음 데이터가 영구 삭제됩니다</p>
            <ul className="list-disc list-inside space-y-0.5 text-red-400">
              <li>모든 캘린더 일정</li>
              <li>모든 할 일</li>
              <li>색상 라벨 이름 (이 기기)</li>
              <li>포모도로 설정 및 세션 횟수 (이 기기)</li>
              <li>Google 계정 연결</li>
            </ul>
          </div>
        </div>

        <div>
          <label className="block text-xs text-neutral-400 mb-2">
            계속하려면 아래에 <span className="text-white font-medium">삭제</span>를 입력하세요
          </label>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="삭제"
            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm focus:outline-none focus:border-red-500"
          />
        </div>

        <div className="flex gap-2">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-neutral-800 text-sm hover:bg-neutral-700 transition-colors">
            취소
          </button>
          <button onClick={run} disabled={input !== '삭제'}
            className="flex-1 py-2.5 rounded-xl bg-red-600 text-sm font-medium hover:bg-red-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
            삭제
          </button>
        </div>
      </div>
    </Modal>
  )
}
