// 태그 입력 로직을 재사용하기 위한 커스텀 훅
// AddTodoModal과 EditTodoModal에서 동일한 태그 추가/삭제 기능이 필요해서 분리했다.
import { useState, useCallback } from 'react'

export function useTagInput(initialTags: string[] = []) {
  const [tags, setTags] = useState<string[]>(initialTags)
  const [tagInput, setTagInput] = useState('')

  // 태그 추가 — '#' 접두사를 제거하고 소문자로 통일해 중복을 방지한다.
  const addTag = useCallback(() => {
    const t = tagInput.trim().replace(/^#/, '').toLowerCase()
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t])
    setTagInput('')  // 입력창 초기화
  }, [tagInput, tags])

  const removeTag = useCallback((tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag))
  }, [])

  return { tags, setTags, tagInput, setTagInput, addTag, removeTag }
}
