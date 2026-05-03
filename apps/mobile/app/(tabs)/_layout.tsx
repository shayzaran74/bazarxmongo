// apps/mobile/app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router'
import { useColorScheme } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'

function TabIcon(props: { name: React.ComponentProps<typeof FontAwesome>['name']; color: string }) {
  return <FontAwesome size={22} style={{ marginBottom: -3 }} {...props} />
}

export default function TabLayout() {
  const scheme = useColorScheme()
  const tint = scheme === 'dark' ? '#60A5FA' : '#002444'

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: tint,
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: { borderTopColor: '#F1F5F9', paddingTop: 4 },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Ana Sayfa',
          tabBarIcon: ({ color }) => <TabIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Keşfet',
          tabBarIcon: ({ color }) => <TabIcon name="search" color={color} />,
        }}
      />
      <Tabs.Screen
        name="takas"
        options={{
          title: 'Takas',
          tabBarIcon: ({ color }) => <TabIcon name="exchange" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color }) => <TabIcon name="user" color={color} />,
        }}
      />
      {/* Gizli — tab bar'da görünmez */}
      <Tabs.Screen name="two" options={{ href: null }} />
    </Tabs>
  )
}
