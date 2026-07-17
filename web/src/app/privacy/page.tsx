import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AllDay — 개인정보처리방침',
}

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-12 text-neutral-300">
      <Link
        href="/"
        className="text-sm text-indigo-400 hover:text-indigo-300 mb-8 inline-block transition-colors"
      >
        ← AllDay로 돌아가기
      </Link>

      <h1 className="text-2xl font-bold text-white mb-2">개인정보처리방침</h1>
      <p className="text-xs text-neutral-500 mb-10">시행일: 2026년 7월 17일</p>

      <Section title="1. 수집하는 정보">
        <p className="text-sm mb-2">서버(Firebase)에 저장되는 정보:</p>
        <List items={[
          'Google에서 제공받는 이름, 이메일 주소, 프로필 이미지 (Google 로그인 시)',
          '사용자가 입력한 캘린더 일정 및 할 일 목록',
        ]} />
        <p className="text-sm mt-4 mb-2">이 기기(브라우저)에만 저장되는 정보 — 서버에 전송되지 않음:</p>
        <List items={[
          '색상 라벨 이름, 포모도로 타이머 설정 및 세션 횟수',
        ]} />
        <p className="text-sm mt-4 mb-2">자동으로 수집되는 정보:</p>
        <List items={[
          'IP 주소, 접속 시각, 요청 URL, 브라우저 정보 (Vercel 수집)',
          '오류 발생 시 스택 트레이스, 페이지 URL, 브라우저 정보 (Sentry 수집)',
        ]} />
      </Section>

      <Section title="2. 수집 목적">
        <List items={[
          '로그인 및 기기 간 데이터 동기화',
          '캘린더 일정·할 일 저장 및 제공',
          '서비스 오류 분석 및 품질 개선',
        ]} />
      </Section>

      <Section title="3. 보관 및 삭제">
        <p className="text-sm text-neutral-400 leading-relaxed mb-3">
          계정 삭제 요청 시 서비스 활성 데이터(일정, 할 일, Google 계정 연결 정보)를 삭제합니다.
          다만 법령상 보관 의무, 보안 로그, Firebase·Vercel·Sentry 백업 시스템의 순환 주기에 따라
          일부 정보가 제한된 기간 동안 보관될 수 있습니다.
        </p>
        <p className="text-sm text-neutral-400 leading-relaxed">
          이 기기의 브라우저 저장 정보(색상 라벨, 포모도로 설정)는 계정 삭제 시 해당 기기에서 함께 삭제됩니다.
          다른 기기의 로컬 데이터는 해당 기기에서 별도로 삭제해야 합니다.
        </p>
      </Section>

      <Section title="4. 제3자 제공 및 처리 위탁">
        <p className="text-sm text-neutral-400 mb-3">
          개인정보를 외부에 판매하거나 임의로 제공하지 않습니다.
          서비스 운영을 위해 아래 업체를 이용합니다:
        </p>
        <List items={[
          'Google Firebase — 인증, 데이터베이스',
          'Vercel — 웹 호스팅, 접속 로그',
          'Sentry — 오류 모니터링',
        ]} />
        <p className="text-sm text-neutral-500 mt-3">각 업체의 개인정보 처리는 해당 업체의 정책을 따릅니다.</p>
      </Section>

      <Section title="5. 이용자 권리">
        <p className="text-sm text-neutral-400">
          사이드바 메뉴의 계정 삭제 기능을 통해 언제든지 활성 데이터 삭제를 요청할 수 있습니다.
        </p>
      </Section>

      <Section title="6. 법적 고지">
        <p className="text-sm text-neutral-400">
          본 방침은 법률 자문을 대체하지 않습니다. 서비스 규모가 커지면 전문가 검토를 권장합니다.
        </p>
      </Section>

      <Section title="7. 문의">
        <p className="text-sm text-neutral-400">
          개인정보 관련 문의:{' '}
          <a href="mailto:u48743499@gmail.com" className="text-indigo-400 hover:underline">
            u48743499@gmail.com
          </a>
        </p>
      </Section>

      <div className="mt-12 pt-6 border-t border-neutral-800 text-xs text-neutral-600">
        본 방침은 변경될 수 있으며, 변경 시 이 페이지에 게시됩니다.
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-base font-semibold text-white mb-3">{title}</h2>
      {children}
    </section>
  )
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="text-sm list-disc list-inside space-y-1 text-neutral-400">
      {items.map((item) => <li key={item}>{item}</li>)}
    </ul>
  )
}
