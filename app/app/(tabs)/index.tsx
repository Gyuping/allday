import { useState, useMemo } from 'react'
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, ActivityIndicator,
} from 'react-native'
import { useCalendarStore } from '@/store/calendarStore'
import { useCategoryStore } from '@/store/categoryStore'
import { THEME } from '@/lib/colors'
import { toDateStr, todayStr, getDateRange, formatDateLabel } from '@/lib/date'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']
const MONTHS   = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월']

export default function CalendarScreen() {
  const [year, setYear]   = useState(() => new Date().getFullYear())
  const [month, setMonth] = useState(() => new Date().getMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const { events, isLoading, fetchError, requestRetry } = useCalendarStore()
  const categories = useCategoryStore((s) => s.categories)

  const today = todayStr()

  const cells = useMemo(() => {
    const firstDay   = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const result: (number | null)[] = [
      ...Array<null>(firstDay).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ]
    while (result.length % 7 !== 0) result.push(null)
    return result
  }, [year, month])

  const eventsByDate = useMemo(() =>
    events.reduce<Record<string, typeof events>>((acc, e) => {
      const dates = e.endDate ? getDateRange(e.date, e.endDate) : [e.date]
      dates.forEach((d) => { if (!acc[d]) acc[d] = []; acc[d].push(e) })
      return acc
    }, {}),
    [events]
  )

  const selectedEvents = selectedDate ? (eventsByDate[selectedDate] ?? []) : []

  const prevMonth = () => {
    if (month === 0) { setYear((y) => y - 1); setMonth(11) }
    else setMonth((m) => m - 1)
  }
  const nextMonth = () => {
    if (month === 11) { setYear((y) => y + 1); setMonth(0) }
    else setMonth((m) => m + 1)
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator color={THEME.accent} />
        <Text style={styles.loadingText}>불러오는 중...</Text>
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
        <TouchableOpacity onPress={prevMonth} style={styles.navBtn}>
          <Text style={styles.navBtnText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{year}년 {MONTHS[month]}</Text>
        <TouchableOpacity onPress={nextMonth} style={styles.navBtn}>
          <Text style={styles.navBtnText}>›</Text>
        </TouchableOpacity>
      </View>

      {/* 요일 헤더 */}
      <View style={styles.weekRow}>
        {WEEKDAYS.map((d, i) => (
          <Text
            key={d}
            style={[
              styles.weekDay,
              i === 0 && styles.sunday,
              i === 6 && styles.saturday,
            ]}
          >
            {d}
          </Text>
        ))}
      </View>

      {/* 날짜 그리드 */}
      <View style={styles.grid}>
        {cells.map((day, idx) => {
          if (day === null) {
            return <View key={`empty-${idx}`} style={styles.cell} />
          }
          const dateStr  = toDateStr(year, month, day)
          const isToday  = dateStr === today
          const isSel    = dateStr === selectedDate
          const dayEvents = eventsByDate[dateStr] ?? []
          const colIdx   = idx % 7

          return (
            <TouchableOpacity
              key={dateStr}
              style={[
                styles.cell,
                isSel && styles.cellSelected,
              ]}
              onPress={() => setSelectedDate(isSel ? null : dateStr)}
              activeOpacity={0.7}
            >
              <View style={[styles.dayCircle, isToday && styles.dayCircleToday]}>
                <Text style={[
                  styles.dayNum,
                  colIdx === 0 && styles.sunday,
                  colIdx === 6 && styles.saturday,
                  isToday && styles.dayNumToday,
                ]}>
                  {day}
                </Text>
              </View>
              {/* 이벤트 도트 */}
              {dayEvents.length > 0 && (
                <View style={styles.dotRow}>
                  {dayEvents.slice(0, 3).map((ev, i) => {
                    const cat = categories.find((c) => c.id === ev.category)
                    return (
                      <View
                        key={i}
                        style={[styles.dot, { backgroundColor: cat?.color ?? ev.color ?? THEME.accent }]}
                      />
                    )
                  })}
                </View>
              )}
            </TouchableOpacity>
          )
        })}
      </View>

      {/* 선택된 날짜의 이벤트 목록 */}
      {selectedDate && (
        <ScrollView style={styles.eventList} contentContainerStyle={{ paddingBottom: 16 }}>
          <Text style={styles.eventListTitle}>{formatDateLabel(selectedDate)}</Text>
          {selectedEvents.length === 0 ? (
            <Text style={styles.emptyText}>일정 없음</Text>
          ) : (
            selectedEvents.map((ev) => {
              const cat = categories.find((c) => c.id === ev.category)
              return (
                <View key={ev.id} style={styles.eventItem}>
                  <View
                    style={[styles.eventDot, { backgroundColor: cat?.color ?? ev.color ?? THEME.accent }]}
                  />
                  <View style={styles.eventInfo}>
                    <Text style={styles.eventTitle}>{ev.title}</Text>
                    {ev.startTime && (
                      <Text style={styles.eventTime}>
                        {ev.startTime}{ev.endTime ? ` - ${ev.endTime}` : ''}
                      </Text>
                    )}
                  </View>
                </View>
              )
            })
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

const CELL_SIZE = 48

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.bg },
  center: { flex: 1, backgroundColor: THEME.bg, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { color: THEME.textMuted, fontSize: 14 },
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
  headerTitle: { color: THEME.text, fontSize: 17, fontWeight: '700' },
  navBtn: { padding: 8 },
  navBtnText: { color: THEME.text, fontSize: 22, fontWeight: '300' },

  weekRow: { flexDirection: 'row', paddingHorizontal: 8, marginBottom: 4 },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '500',
    color: THEME.textMuted,
    paddingVertical: 6,
  },
  sunday:   { color: '#f87171' },
  saturday: { color: '#60a5fa' },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
  },
  cell: {
    width: `${100 / 7}%`,
    alignItems: 'center',
    paddingVertical: 4,
    minHeight: CELL_SIZE,
  },
  cellSelected: {
    backgroundColor: THEME.border,
    borderRadius: 8,
  },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleToday: { backgroundColor: THEME.text },
  dayNum: { fontSize: 13, color: THEME.textSub, fontWeight: '400' },
  dayNumToday: { color: THEME.bg, fontWeight: '700' },

  dotRow: { flexDirection: 'row', gap: 2, marginTop: 2 },
  dot: { width: 4, height: 4, borderRadius: 2 },

  eventList: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },
  eventListTitle: {
    color: THEME.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  emptyText: { color: THEME.textMuted, fontSize: 13 },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  eventDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
  eventInfo: { flex: 1 },
  eventTitle: { color: THEME.text, fontSize: 14, fontWeight: '500' },
  eventTime: { color: THEME.textMuted, fontSize: 12, marginTop: 2 },
})
