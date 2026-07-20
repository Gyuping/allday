import { Tabs } from 'expo-router'
import { View, StyleSheet } from 'react-native'
import { THEME } from '@/lib/colors'

// 탭 아이콘 — SVG 없이 심플 텍스트/이모지로 구현 (나중에 아이콘 라이브러리로 교체)
function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <View style={[styles.icon, focused && styles.iconActive]}>
      <View style={{ opacity: focused ? 1 : 0.5 }}>
        {/* emoji 텍스트 대신 실제 아이콘을 써야 한다면 @expo/vector-icons 사용 */}
      </View>
    </View>
  )
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: THEME.text,
        tabBarInactiveTintColor: THEME.textMuted,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: '캘린더', tabBarIcon: ({ focused }) => <TabIcon emoji="📅" focused={focused} /> }}
      />
      <Tabs.Screen
        name="todos"
        options={{ title: '할일', tabBarIcon: ({ focused }) => <TabIcon emoji="✅" focused={focused} /> }}
      />
      <Tabs.Screen
        name="timer"
        options={{ title: '타이머', tabBarIcon: ({ focused }) => <TabIcon emoji="⏱️" focused={focused} /> }}
      />
      <Tabs.Screen
        name="settings"
        options={{ title: '설정', tabBarIcon: ({ focused }) => <TabIcon emoji="⚙️" focused={focused} /> }}
      />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: THEME.card,
    borderTopColor: THEME.border,
    borderTopWidth: 1,
    height: 56,
    paddingBottom: 8,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
  icon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconActive: {
    // focused 상태 스타일
  },
})
