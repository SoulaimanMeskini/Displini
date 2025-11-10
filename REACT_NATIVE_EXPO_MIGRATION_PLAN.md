# React Native (Expo) Migration Plan

**Date:** November 4, 2025  
**Timeline:** 8 weeks  
**Approach:** Expo with TypeScript  
**Goal:** Native iOS & Android apps

---

## Overview

Create native mobile apps using React Native with Expo framework, reusing as much code as possible from your existing React web app.

**What Can Be Reused:** ~40% of code
- ✅ Design system (colors, typography)
- ✅ Error handling utilities
- ✅ Type definitions
- ✅ Business logic
- ✅ API client
- ✅ State management patterns

**What Needs Rewriting:** ~60% of code
- ❌ UI components (React → React Native)
- ❌ Styling (CSS/Tailwind → StyleSheet)
- ❌ Navigation (Wouter → React Navigation)
- ❌ Storage (localStorage → AsyncStorage)
- ❌ Animations (Some Framer Motion → Reanimated)

---

## Phase 1: Project Setup (Week 1)

### Day 1-2: Initialize Project

```bash
# Create Expo project with TypeScript
npx create-expo-app displini-mobile --template blank-typescript

cd displini-mobile

# Install essential dependencies
npm install @react-navigation/native
npm install @react-navigation/bottom-tabs
npm install @react-navigation/stack
npx expo install react-native-screens react-native-safe-area-context
npx expo install react-native-gesture-handler react-native-reanimated
npx expo install react-native-svg
npx expo install @react-native-async-storage/async-storage
npx expo install expo-haptics expo-notifications
npx expo install date-fns  # Already using in web app
```

### Day 3: Setup Folder Structure

```
displini-mobile/
├── src/
│   ├── shared/              ← Copy from web app
│   │   ├── lib/
│   │   │   ├── designSystem.ts      ✅ REUSE
│   │   │   ├── errorHandling.ts     ✅ REUSE (modify toast)
│   │   │   └── api/
│   │   │       └── client.ts        ✅ REUSE
│   │   ├── types/
│   │   │   └── types.ts             ✅ REUSE
│   │   └── utils/
│   │       └── validation.ts        ✅ REUSE
│   ├── components/          ← Rebuild for React Native
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   └── ...
│   │   ├── features/
│   │   │   ├── WaterIntakeCard.tsx
│   │   │   ├── TodoItem.tsx
│   │   │   └── ...
│   │   └── shared/
│   │       ├── LoadingScreen.tsx
│   │       └── ...
│   ├── screens/             ← Convert from pages
│   │   ├── TodoScreen.tsx
│   │   ├── CalendarScreen.tsx
│   │   ├── RemindersScreen.tsx
│   │   ├── AIScreen.tsx
│   │   └── ProfileScreen.tsx
│   ├── navigation/
│   │   └── AppNavigator.tsx
│   └── hooks/               ← Copy from web app
│       └── useAuth.ts               ✅ REUSE (modify)
├── assets/
│   ├── fonts/
│   ├── images/
│   └── icons/
├── app.json
└── package.json
```

### Day 4-5: Copy Reusable Code

**1. Design System (100% reusable!):**

```bash
# Copy design system
cp ../client/src/lib/designSystem.ts src/shared/lib/designSystem.ts
```

**2. Types (100% reusable!):**

```bash
# Copy types
cp ../client/src/app/types/types.ts src/shared/types/types.ts
```

**3. Error Handling (Modify for React Native):**

```typescript
// src/shared/lib/errorHandling.ts
import { Alert } from 'react-native';

// Instead of toast, use native Alert
export function handleError(error: unknown, options: ErrorHandlerOptions = {}) {
  const message = /* ... extract message ... */;
  
  Alert.alert(
    options.title || 'Error',
    message,
    [{ text: 'OK' }]
  );
}

export function handleSuccess(message: string, title = 'Success') {
  Alert.alert(title, message, [{ text: 'OK' }]);
}
```

---

## Phase 2: Core UI Components (Week 2-3)

### Build React Native UI Component Library

#### Button Component

```typescript
// src/components/ui/Button.tsx
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '../../shared/lib/designSystem';

interface ButtonProps {
  onPress: () => void;
  children: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
}

export function Button({ 
  onPress, 
  children, 
  variant = 'default',
  size = 'md',
  disabled = false,
  loading = false
}: ButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles[variant],
        styles[size],
        disabled && styles.disabled
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text style={[styles.text, styles[`${variant}Text`]]}>{children}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  default: {
    backgroundColor: colors.brand.primary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.brand.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  sm: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  md: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  lg: {
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  defaultText: {
    color: '#FFFFFF',
  },
  outlineText: {
    color: colors.brand.primary,
  },
  ghostText: {
    color: colors.brand.primary,
  },
});
```

#### Card Component

```typescript
// src/components/ui/Card.tsx
import { View, StyleSheet, ViewProps } from 'react-native';

export function Card({ children, style, ...props }: ViewProps) {
  return (
    <View style={[styles.card, style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3, // Android shadow
  },
});
```

#### Input Component

```typescript
// src/components/ui/Input.tsx
import { TextInput, StyleSheet, TextInputProps } from 'react-native';
import { colors } from '../../shared/lib/designSystem';

export function Input(props: TextInputProps) {
  return (
    <TextInput
      style={[styles.input, props.style]}
      placeholderTextColor="#9CA3AF"
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
});
```

---

## Phase 3: Navigation (Week 3)

### Setup React Navigation

```typescript
// src/navigation/AppNavigator.tsx
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CheckSquare, Bell, Calendar, Sparkles } from 'lucide-react-native';
import { colors } from '../shared/lib/designSystem';

import TodoScreen from '../screens/TodoScreen';
import RemindersScreen from '../screens/RemindersScreen';
import CalendarScreen from '../screens/CalendarScreen';
import AIScreen from '../screens/AIScreen';

const Tab = createBottomTabNavigator();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: colors.brand.primary,
          tabBarInactiveTintColor: '#9CA3AF',
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopColor: '#E5E7EB',
            paddingBottom: 8,
            paddingTop: 8,
            height: 65,
          },
          headerShown: false,
        }}
      >
        <Tab.Screen 
          name="Todo" 
          component={TodoScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <CheckSquare color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen 
          name="Reminders" 
          component={RemindersScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Bell color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen 
          name="Calendar" 
          component={CalendarScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Calendar color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen 
          name="AI" 
          component={AIScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Sparkles color={color} size={size} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
```

---

## Phase 4: Screen Migration (Week 4-6)

### Convert Web Pages to Mobile Screens

#### Todo Screen Example

```typescript
// src/screens/TodoScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../shared/lib/designSystem';
import { Task } from '../shared/types/types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export default function TodoScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const saved = await AsyncStorage.getItem('todos');
      if (saved) {
        setTasks(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load tasks', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTasks();
    setRefreshing(false);
  };

  const toggleComplete = async (taskId: string) => {
    const updated = tasks.map(t => 
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    setTasks(updated);
    await AsyncStorage.setItem('todos', JSON.stringify(updated));
  };

  const todayTasks = tasks.filter(task => {
    // Filter logic
    return true; // Simplified
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Today's Tasks</Text>
        <TouchableOpacity style={styles.addButton}>
          <Plus color="#FFFFFF" size={24} />
        </TouchableOpacity>
      </View>

      {/* Task List */}
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {todayTasks.map(task => (
          <TouchableOpacity 
            key={task.id}
            onPress={() => toggleComplete(task.id)}
          >
            <Card style={styles.taskCard}>
              <View style={styles.taskContent}>
                <View style={[
                  styles.checkbox,
                  task.completed && styles.checkboxCompleted
                ]} />
                <Text style={[
                  styles.taskTitle,
                  task.completed && styles.taskTitleCompleted
                ]}>
                  {task.title}
                </Text>
              </View>
            </Card>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.light,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  addButton: {
    backgroundColor: colors.brand.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskCard: {
    marginHorizontal: 16,
    marginVertical: 6,
  },
  taskContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.brand.primary,
  },
  checkboxCompleted: {
    backgroundColor: colors.brand.primary,
  },
  taskTitle: {
    fontSize: 16,
    color: '#111827',
    flex: 1,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
});
```

### Features to Migrate (Priority Order)

**Week 4:**
1. Todo Screen
2. Add Task functionality
3. Task completion with confetti

**Week 5:**
4. Calendar Screen
5. Water Intake feature
6. Reminders Screen

**Week 6:**
7. Sleep Schedule
8. Menstrual Cycle Tracker
9. Medication Tracker
10. Journal feature

---

## Phase 5: Native Features (Week 7)

### Push Notifications

```typescript
// src/services/notifications.ts
import * as Notifications from 'expo-notifications';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function requestPermissions() {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleWaterReminder(time: string) {
  const [hours, minutes] = time.split(':').map(Number);
  
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "💧 Drink Water",
      body: "Time for your water intake! Stay hydrated.",
      data: { type: 'water' },
    },
    trigger: {
      hour: hours,
      minute: minutes,
      repeats: true,
    },
  });
}
```

### Haptic Feedback

```typescript
// src/utils/haptics.ts
import * as Haptics from 'expo-haptics';

export const haptics = {
  light: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  medium: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  heavy: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
  success: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  error: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
};

// Usage
import { haptics } from '../utils/haptics';

const handleComplete = async () => {
  await haptics.success();
  completeTask();
};
```

### Platform-Specific Code

```typescript
// src/utils/platform.ts
import { Platform } from 'react-native';

export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';

// Platform-specific styling
export const platformStyles = {
  shadow: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    android: {
      elevation: 3,
    },
  }),
};
```

---

## Phase 6: Data Storage (Week 7)

### Replace localStorage with AsyncStorage

```typescript
// src/services/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
  async getTodos(): Promise<Task[]> {
    try {
      const todos = await AsyncStorage.getItem('todos');
      return todos ? JSON.parse(todos) : [];
    } catch (error) {
      console.error('Failed to load todos', error);
      return [];
    }
  },

  async saveTodos(todos: Task[]): Promise<void> {
    try {
      await AsyncStorage.setItem('todos', JSON.stringify(todos));
    } catch (error) {
      console.error('Failed to save todos', error);
    }
  },

  async getReminders(): Promise<Reminder[]> {
    try {
      const reminders = await AsyncStorage.getItem('reminders');
      return reminders ? JSON.parse(reminders) : [];
    } catch (error) {
      console.error('Failed to load reminders', error);
      return [];
    }
  },

  async saveReminders(reminders: Reminder[]): Promise<void> {
    try {
      await AsyncStorage.setItem('reminders', JSON.stringify(reminders));
    } catch (error) {
      console.error('Failed to save reminders', error);
    }
  },

  // Add methods for each feature
};
```

---

## Phase 7: Polish & Testing (Week 8)

### iOS-Specific Adjustments

```typescript
// Handle safe areas
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function MyScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
      {/* Content */}
    </View>
  );
}
```

### Android-Specific Adjustments

```typescript
// Handle back button
import { BackHandler } from 'react-native';

useEffect(() => {
  const backHandler = BackHandler.addEventListener(
    'hardwareBackPress',
    () => {
      // Handle back button
      return true; // Prevent default behavior
    }
  );

  return () => backHandler.remove();
}, []);
```

### Testing on Devices

```bash
# iOS (requires macOS)
npx expo run:ios

# Android
npx expo run:android

# Or use Expo Go for quick testing
npx expo start
# Scan QR code with Expo Go app
```

---

## Phase 8: Build & Deploy

### Configure App Settings

```json
// app.json
{
  "expo": {
    "name": "Displini",
    "slug": "displini",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#30C4FF"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.displini.app",
      "buildNumber": "1.0.0"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#30C4FF"
      },
      "package": "com.displini.app",
      "versionCode": 1
    },
    "plugins": [
      "expo-notifications"
    ]
  }
}
```

### Build for App Stores

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Or build both
eas build --platform all
```

---

## Code Reuse Checklist

### ✅ Can Reuse Directly

- [ ] `designSystem.ts` (colors, typography)
- [ ] `types.ts` (all TypeScript interfaces)
- [ ] Validation schemas (Zod)
- [ ] Date utilities (date-fns)
- [ ] Business logic functions
- [ ] API client structure
- [ ] Error messages/copy

### ⚠️ Needs Modification

- [ ] `errorHandling.ts` (toast → Alert.alert)
- [ ] `useAuth.ts` (adapt for React Native)
- [ ] Event handlers (onClick → onPress)
- [ ] Form components

### ❌ Must Rewrite

- [ ] All UI components (div → View, button → TouchableOpacity)
- [ ] All styling (className → StyleSheet)
- [ ] Navigation (Wouter → React Navigation)
- [ ] Storage (localStorage → AsyncStorage)
- [ ] Some animations (Framer Motion → Reanimated)

---

## Comparison: Web vs React Native

| Feature | Web (React) | Mobile (React Native) |
|---------|-------------|----------------------|
| **Layout** | `<div>` | `<View>` |
| **Text** | `<p>`, `<span>` | `<Text>` |
| **Button** | `<button>` | `<TouchableOpacity>` |
| **Image** | `<img>` | `<Image>` |
| **Input** | `<input>` | `<TextInput>` |
| **Scroll** | `<div>` with overflow | `<ScrollView>` |
| **Styling** | CSS/Tailwind | `StyleSheet.create()` |
| **Navigation** | Wouter | React Navigation |
| **Storage** | localStorage | AsyncStorage |
| **Gestures** | onClick | onPress |

---

## Testing Strategy

### Week 8: Comprehensive Testing

**Functional Testing:**
- [ ] Create todo
- [ ] Complete todo
- [ ] Delete todo
- [ ] Add water intake
- [ ] Create calendar event
- [ ] Set reminder
- [ ] Track menstrual cycle
- [ ] Log medication

**Platform Testing:**
- [ ] iOS simulator
- [ ] Real iPhone
- [ ] Android emulator
- [ ] Real Android device
- [ ] iPad (if supporting tablets)

**Performance Testing:**
- [ ] App launch time (< 3 seconds)
- [ ] Screen transitions (< 300ms)
- [ ] List scrolling (60 FPS)
- [ ] Memory usage

---

## App Store Requirements

### iOS App Store

**Required Assets:**
- App Icon (1024x1024)
- Screenshots:
  - 6.5" iPhone (1284x2778)
  - 12.9" iPad Pro (2048x2732)
- Privacy Policy URL
- Support URL
- App description (up to 4000 chars)
- Keywords (up to 100 chars)
- Promotional text (170 chars)

**Submission:**
1. Create App Store Connect account ($99/year)
2. Create app listing
3. Upload build via EAS
4. Submit for review (1-2 days)

### Google Play Store

**Required Assets:**
- App Icon (512x512)
- Feature Graphic (1024x500)
- Screenshots:
  - Phone (min 2, max 8)
  - 7" Tablet (optional)
  - 10" Tablet (optional)
- Privacy Policy URL
- App description (up to 4000 chars)
- Short description (80 chars)

**Submission:**
1. Create Play Console account ($25 one-time)
2. Create app listing
3. Upload build via EAS
4. Submit for review (few hours - 1 day)

---

## Estimated Timeline & Cost

### Timeline

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| Setup | 1 week | Project initialized |
| UI Components | 2 weeks | Core components done |
| Screen Migration | 3 weeks | All features working |
| Native Features | 1 week | Push notifications, haptics |
| Testing & Polish | 1 week | Bug-free, optimized |
| **Total** | **8 weeks** | **Apps ready for stores** |

### Cost

| Item | Cost |
|------|------|
| Apple Developer Account | $99/year |
| Google Play Console | $25 one-time |
| **Total** | **$124** |

*(Assuming you do all development yourself)*

---

## Recommended Path

### Option 1: Do React Native Now (If You Have Time)

**Pros:**
- True native apps
- Best performance
- Full control

**Timeline:**
- 8 weeks development
- +2 weeks app store approval
- **Total: 10 weeks**

### Option 2: PWA First, Then React Native (Recommended)

**Pros:**
- Get mobile app in 1 week (PWA)
- Test with users
- Gather feedback
- Then build native based on feedback

**Timeline:**
- Week 1: PWA (works on mobile browsers)
- Weeks 2-10: React Native (based on learnings)

### Option 3: Capacitor (Easiest)

**Pros:**
- Reuse 90% of web code
- Wrap in native container
- Faster than React Native rewrite

**Timeline:**
- 3 weeks vs 8 weeks for React Native

---

## My Recommendation

**Best Path:**
1. **This month:** Finish web app backend API
2. **Next month:** Deploy PWA (quick mobile solution)
3. **Month 3-4:** Build React Native app properly

**Why:**
- Don't rush React Native
- PWA gives you mobile users immediately
- Backend API needed anyway
- React Native done right takes time

---

## Summary

**Reusable from Web App:**
- Design system (100%)
- Types (100%)
- Business logic (80%)
- Error handling (with modifications)

**Must Rebuild:**
- All UI components
- Styling
- Navigation
- Platform-specific features

**Timeline:** 8 weeks  
**Cost:** $124  
**Result:** Native iOS + Android apps

**Ready to start when you are!** 🚀

