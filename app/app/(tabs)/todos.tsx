import { useState } from 'react'
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, SafeAreaView, ActivityIndicator, Alert,
} from 'react-native'
import { useTodoStore } from '@/store/todoStore'
import { THEME } from '@/lib/colors'
import { todayKST } from '@/lib/date'
import type { Todo, TodoFilter } from '@/types'

const FILTERS: { key: TodoFilter; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'active', label: '미완료' },
  { key: 'completed', label: '완료' },
]

export default function TodosScreen() {
  const { todos, isLoading, fetchError, requestRetry, addTodo, toggleTodo, deleteTodo } = useTodoStore()
  const [filter, setFilter] = useState<TodoFilter>('all')
  const [input, setInput]   = useState('')
  const [adding, setAdding] = useState(false)

  const filtered = todos.filter((t) => {
    if (filter === 'active')    return !t.completed
    if (filter === 'completed') return  t.completed
    return true
  })

  const handleAdd = () => {
    const title = input.trim()
    if (!title) return
    addTodo({
      id: Math.random().toString(36).slice(2),
      title,
      completed: false,
      priority: 'medium',
      createdAt: new Date().toISOString(),
    })
    setInput('')
    setAdding(false)
  }

  const handleDelete = (todo: Todo) => {
    Alert.alert('삭제', `"${todo.title}" 삭제할까요?`, [
      { text: '취소', style: 'cancel' },
      { text: '삭제', style: 'destructive', onPress: () => deleteTodo(todo.id) },
    ])
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator color={THEME.accent} />
      </SafeAreaView>
    )
  }

  if (fetchError) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.errorText}>불러오기 실패</Text>
        <TouchableOpacity onPress={requestRetry} style={styles.retryBtn}>
          <Text style={styles.retryBtnText}>다시 시도</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>할일</Text>
        <TouchableOpacity onPress={() => setAdding((v) => !v)} style={styles.addBtn}>
          <Text style={styles.addBtnText}>{adding ? '취소' : '+ 추가'}</Text>
        </TouchableOpacity>
      </View>

      {/* 입력창 */}
      {adding && (
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="할일 제목"
            placeholderTextColor={THEME.textMuted}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={handleAdd}
            autoFocus
            returnKeyType="done"
          />
          <TouchableOpacity onPress={handleAdd} style={styles.saveBtn}>
            <Text style={styles.saveBtnText}>추가</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 필터 탭 */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            onPress={() => setFilter(f.key)}
            style={[styles.filterBtn, filter === f.key && styles.filterBtnActive]}
          >
            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 할일 목록 */}
      <FlatList
        data={filtered}
        keyExtractor={(t) => t.id}
        contentContainerStyle={{ paddingBottom: 32, paddingHorizontal: 16 }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {filter === 'all' ? '할일이 없어요' : filter === 'active' ? '미완료 항목 없음' : '완료 항목 없음'}
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.todoItem}>
            <TouchableOpacity onPress={() => toggleTodo(item.id)} style={styles.checkbox}>
              <View style={[styles.checkboxInner, item.completed && styles.checkboxDone]}>
                {item.completed && <Text style={styles.checkmark}>✓</Text>}
              </View>
            </TouchableOpacity>
            <Text
              style={[styles.todoTitle, item.completed && styles.todoTitleDone]}
              numberOfLines={2}
            >
              {item.title}
            </Text>
            <TouchableOpacity onPress={() => handleDelete(item)} style={styles.deleteBtn}>
              <Text style={styles.deleteBtnText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.bg },
  center: { flex: 1, backgroundColor: THEME.bg, justifyContent: 'center', alignItems: 'center', gap: 12 },
  errorText: { color: THEME.danger, fontSize: 14 },
  retryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: THEME.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  retryBtnText: { color: THEME.text, fontSize: 13, fontWeight: '600' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: { color: THEME.text, fontSize: 20, fontWeight: '700' },
  addBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: THEME.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  addBtnText: { color: THEME.text, fontSize: 13, fontWeight: '500' },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  input: {
    flex: 1,
    backgroundColor: THEME.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: THEME.border2,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: THEME.text,
    fontSize: 14,
  },
  saveBtn: {
    backgroundColor: THEME.text,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  saveBtnText: { color: THEME.bg, fontSize: 14, fontWeight: '600' },

  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 6,
    marginBottom: 12,
  },
  filterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: THEME.card,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  filterBtnActive: { backgroundColor: THEME.text, borderColor: THEME.text },
  filterText: { color: THEME.textMuted, fontSize: 12, fontWeight: '500' },
  filterTextActive: { color: THEME.bg },

  emptyText: {
    color: THEME.textMuted,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 40,
  },

  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  checkbox: { padding: 2 },
  checkboxInner: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: THEME.border2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDone: { backgroundColor: THEME.accent, borderColor: THEME.accent },
  checkmark: { color: '#fff', fontSize: 12, fontWeight: '700' },
  todoTitle: { flex: 1, color: THEME.text, fontSize: 14 },
  todoTitleDone: { color: THEME.textMuted, textDecorationLine: 'line-through' },
  deleteBtn: { padding: 6 },
  deleteBtnText: { color: THEME.textMuted, fontSize: 14 },
})
