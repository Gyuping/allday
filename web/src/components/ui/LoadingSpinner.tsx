export default function LoadingSpinner({ message = '불러오는 중...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-3 text-neutral-600">
      <div className="w-7 h-7 border-2 border-neutral-700 border-t-indigo-400 rounded-full animate-spin" />
      <p className="text-sm">{message}</p>
    </div>
  )
}
