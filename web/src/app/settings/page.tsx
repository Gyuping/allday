import Link from 'next/link'
import CategoryManager from '@/components/calendar/CategoryManager'

export default function SettingsPage() {
  return (
    <div className="max-w-lg mx-auto px-6 py-10">
      <Link
        href="/calendar"
        className="inline-block text-sm text-neutral-500 hover:text-neutral-300 transition-colors mb-8"
      >
        ← 캘린더로 돌아가기
      </Link>

      <h1 className="text-lg font-semibold text-white mb-8">설정</h1>

      <section>
        <h2 className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-3">카테고리 관리</h2>
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
          <CategoryManager />
        </div>
      </section>
    </div>
  )
}
