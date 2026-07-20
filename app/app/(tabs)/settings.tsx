import { useState } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  SafeAreaView, ScrollView, Alert, ActivityIndicator,
} from 'react-native'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useCategoryStore } from '@/store/categoryStore'
import { getEventCountByCategory } from '@/lib/firestore/categories'
import { THEME, PRESET_COLORS } from '@/lib/colors'
import type { Category } from '@/lib/categories'

export default function SettingsScreen() {
  const { categories, userId, addCategory, updateCategory, deleteCategory } = useCategoryStore()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft]         = useState({ label: '', color: PRESET_COLORS[0] as string })
  const [addMode, setAddMode]     = useState(false)
  const [addDraft, setAddDraft]   = useState({ label: '', color: PRESET_COLORS[0] as string })
  const [checking, setChecking]   = useState(false)

  const startEdit = (cat: Category) => {
    setEditingId(cat.id)
    setDraft({ label: cat.label, color: cat.color })
    setAddMode(false)
  }

  const saveEdit = () => {
    if (!editingId || !draft.label.trim()) return
    updateCategory(editingId, { label: draft.label.trim(), color: draft.color })
    setEditingId(null)
  }

  const handleDelete = async (cat: Category) => {
    if (categories.length <= 1) {
      Alert.alert('삭제 불가', '카테고리는 최소 1개 이상 있어야 해요.')
      return
    }
    setChecking(true)
    try {
      const count  = userId ? await getEventCountByCategory(userId, cat.id) : 0
      const target = categories.find((c) => c.id !== cat.id)!
      Alert.alert(
        '카테고리 삭제',
        count > 0
          ? `'${cat.label}' 삭제 시 일정 ${count}개가 '${target.label}'로 이동됩니다.`
          : `'${cat.label}'를 삭제할까요?`,
        [
          { text: '취소', style: 'cancel' },
          {
            text: '삭제',
            style: 'destructive',
            onPress: () => deleteCategory(cat.id, target.id),
          },
        ]
      )
    } catch {
      Alert.alert('오류', '일정 수 확인에 실패했어요.')
    } finally {
      setChecking(false)
    }
  }

  const handleAdd = () => {
    if (!addDraft.label.trim()) return
    addCategory({
      id: Math.random().toString(36).slice(2),
      label: addDraft.label.trim(),
      color: addDraft.color,
    })
    setAddDraft({ label: '', color: PRESET_COLORS[0] as string })
    setAddMode(false)
  }

  const handleLogout = () => {
    Alert.alert('로그아웃', '로그아웃할까요?', [
      { text: '취소', style: 'cancel' },
      { text: '로그아웃', style: 'destructive', onPress: () => signOut(auth) },
    ])
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>설정</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* 카테고리 섹션 */}
        <SectionHeader title="카테고리" />
        <View style={styles.card}>
          {categories.map((cat) =>
            editingId === cat.id ? (
              <View key={cat.id} style={styles.editRow}>
                <ColorPicker
                  selected={draft.color}
                  onSelect={(c) => setDraft((d) => ({ ...d, color: c }))}
                />
                <TextInput
                  style={styles.editInput}
                  value={draft.label}
                  onChangeText={(t) => setDraft((d) => ({ ...d, label: t }))}
                  maxLength={10}
                  autoFocus
                  onSubmitEditing={saveEdit}
                  returnKeyType="done"
                />
                <TouchableOpacity onPress={saveEdit} style={styles.iconBtn}>
                  <Text style={styles.iconBtnText}>✓</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setEditingId(null)} style={styles.iconBtn}>
                  <Text style={[styles.iconBtnText, { color: THEME.textMuted }]}>✕</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View key={cat.id} style={styles.catRow}>
                <View style={[styles.catDot, { backgroundColor: cat.color }]} />
                <Text style={styles.catLabel}>{cat.label}</Text>
                <TouchableOpacity onPress={() => startEdit(cat)} style={styles.iconBtn}>
                  <Text style={styles.iconBtnSmall}>✎</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDelete(cat)}
                  disabled={checking}
                  style={styles.iconBtn}
                >
                  {checking ? (
                    <ActivityIndicator size="small" color={THEME.textMuted} />
                  ) : (
                    <Text style={[styles.iconBtnSmall, { color: THEME.danger }]}>✕</Text>
                  )}
                </TouchableOpacity>
              </View>
            )
          )}

          {/* 추가 행 */}
          {addMode ? (
            <View style={styles.editRow}>
              <ColorPicker
                selected={addDraft.color}
                onSelect={(c) => setAddDraft((d) => ({ ...d, color: c }))}
              />
              <TextInput
                style={styles.editInput}
                value={addDraft.label}
                onChangeText={(t) => setAddDraft((d) => ({ ...d, label: t }))}
                maxLength={10}
                placeholder="카테고리 이름"
                placeholderTextColor={THEME.textMuted}
                autoFocus
                onSubmitEditing={handleAdd}
                returnKeyType="done"
              />
              <TouchableOpacity onPress={handleAdd} style={styles.iconBtn}>
                <Text style={styles.iconBtnText}>✓</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setAddMode(false)} style={styles.iconBtn}>
                <Text style={[styles.iconBtnText, { color: THEME.textMuted }]}>✕</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => { setAddMode(true); setEditingId(null) }}
              style={styles.addCatBtn}
            >
              <Text style={styles.addCatBtnText}>+ 카테고리 추가</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 계정 섹션 */}
        <SectionHeader title="계정" />
        <View style={styles.card}>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>로그아웃</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

function SectionHeader({ title }: { title: string }) {
  return (
    <Text style={styles.sectionTitle}>{title}</Text>
  )
}

function ColorPicker({ selected, onSelect }: { selected: string; onSelect: (c: string) => void }) {
  return (
    <View style={cpStyles.grid}>
      {PRESET_COLORS.map((c) => (
        <TouchableOpacity
          key={c}
          onPress={() => onSelect(c)}
          style={[
            cpStyles.dot,
            { backgroundColor: c },
            selected === c && cpStyles.dotSelected,
          ]}
        />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.bg },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: { color: THEME.text, fontSize: 20, fontWeight: '700' },

  sectionTitle: {
    color: THEME.textMuted,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  card: {
    marginHorizontal: 16,
    backgroundColor: THEME.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.border,
    overflow: 'hidden',
  },

  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
    gap: 10,
  },
  catDot: { width: 12, height: 12, borderRadius: 6 },
  catLabel: { flex: 1, color: THEME.text, fontSize: 14 },

  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
    gap: 8,
  },
  editInput: {
    flex: 1,
    color: THEME.text,
    fontSize: 14,
    backgroundColor: THEME.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  iconBtn: { padding: 6 },
  iconBtnText: { color: THEME.text, fontSize: 16, fontWeight: '600' },
  iconBtnSmall: { color: THEME.textMuted, fontSize: 15 },

  addCatBtn: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  addCatBtnText: { color: THEME.textMuted, fontSize: 14 },

  logoutBtn: { paddingHorizontal: 16, paddingVertical: 16 },
  logoutText: { color: THEME.danger, fontSize: 15, fontWeight: '500' },
})

const cpStyles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 80,
    gap: 4,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  dotSelected: {
    borderWidth: 2,
    borderColor: THEME.text,
  },
})
