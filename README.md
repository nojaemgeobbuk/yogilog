# Yogilog (요기로그)

A kitschy yoga tracker app with a music player aesthetic, built with React Native and Expo.

## Tech Stack

| Category | Technology | Version |
|----------|------------|---------|
| Framework | React Native (Expo) | 54.x |
| Navigation | Expo Router | 6.x |
| Styling | NativeWind (Tailwind CSS) | 4.x |
| Animations | React Native Reanimated | 4.x |
| Gestures | React Native Gesture Handler | 2.x |
| State Management | Zustand | 5.x |
| Storage | AsyncStorage | 2.x |
| Icons | Lucide React Native | 0.562.x |

## Dependencies

### Core Dependencies

```json
{
  "expo": "~54.0.31",
  "expo-router": "~6.0.21",
  "react": "19.1.0",
  "react-native": "0.81.5"
}
```

### Styling & Animation

| Module | Purpose |
|--------|---------|
| `nativewind` | Tailwind CSS for React Native |
| `tailwindcss` | Utility-first CSS framework |
| `react-native-reanimated` | High-performance animations |
| `react-native-gesture-handler` | Touch gesture handling |

### State & Storage

| Module | Purpose |
|--------|---------|
| `zustand` | Lightweight state management |
| `@react-native-async-storage/async-storage` | Persistent local storage |
| `expo-crypto` | UUID generation |

### UI Components

| Module | Purpose |
|--------|---------|
| `lucide-react-native` | Icon library |
| `react-native-calendars` | Calendar component |
| `@react-native-community/datetimepicker` | Native date/time picker |
| `react-native-svg` | SVG support for icons |

### Media & Sharing

| Module | Purpose |
|--------|---------|
| `expo-image-picker` | Photo selection from gallery |
| `react-native-view-shot` | Capture views as images |
| `expo-sharing` | Native share sheet |

---

## App Routes (Screens)

| Route | File | Description |
|-------|------|-------------|
| `/` | `app/(tabs)/index.tsx` | Home screen with session carousel |
| `/library` | `app/(tabs)/library.tsx` | Asana library grid (Top Artists) |
| `/history` | `app/(tabs)/history.tsx` | Calendar view with session history |
| `/session/[id]` | `app/session/[id].tsx` | Session detail (Now Playing view) |
| `/library/[asanaName]` | `app/library/[asanaName].tsx` | Asana detail (Artist page) |
| `/(modals)/write` | `app/(modals)/write.tsx` | Create new session modal |

---

## Data Store API

The app uses Zustand for state management with AsyncStorage persistence.

### Store: `useYogaStore`

**Location:** `store/useYogaStore.ts`

#### State

```typescript
interface YogaStore {
  sessions: YogaSession[];
}
```

#### Actions

| Method | Parameters | Return | Description |
|--------|------------|--------|-------------|
| `addSession` | `Omit<YogaSession, "id">` | `void` | Create a new yoga session |
| `updateSession` | `id: string, updates: Partial<YogaSession>` | `void` | Update existing session |
| `deleteSession` | `id: string` | `void` | Delete a session |
| `getSession` | `id: string` | `YogaSession \| undefined` | Get session by ID |

#### Usage Example

```typescript
import { useYogaStore } from "@/store/useYogaStore";

// Read sessions
const sessions = useYogaStore((state) => state.sessions);

// Add session
const addSession = useYogaStore((state) => state.addSession);
addSession({
  title: "Morning Flow",
  images: [],
  note: "Felt great!",
  date: new Date().toISOString(),
  duration: 30,
  intensity: 3,
  hashtags: ["morning", "energizing"],
  asanas: ["Downward Dog", "Warrior I"],
});

// Delete session
const deleteSession = useYogaStore((state) => state.deleteSession);
deleteSession("session-id-here");
```

---

## Data Types

### YogaSession

**Location:** `types/index.ts`

```typescript
interface YogaSession {
  id: string;          // UUID (auto-generated)
  title: string;       // Session title
  images: string[];    // Array of local image URIs
  note: string;        // Session notes
  date: string;        // ISO date string
  duration: number;    // Duration in minutes
  intensity: number;   // 1-5 scale
  hashtags: string[];  // Tags without # prefix
  asanas: string[];    // List of pose names
}
```

---

## Theme & Colors

**Location:** `constants/Colors.ts`

```typescript
const Colors = {
  background: "#121216",  // Dark background
  primary: "#A238FF",     // Purple
  accent: "#CCFF00",      // Neon yellow-green
  card: "rgba(88, 28, 135, 0.8)",  // Transparent purple
  cardSolid: "#581C87",   // Solid purple
  text: "#FFFFFF",        // White text
  textMuted: "#9CA3AF",   // Gray text
  border: "#374151",      // Dark gray border
};
```

---

## Project Structure

```
yogilog/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx      # Tab navigator
│   │   ├── index.tsx        # Home (Playlist)
│   │   ├── library.tsx      # Asana Library
│   │   └── history.tsx      # Calendar
│   ├── (modals)/
│   │   └── write.tsx        # New session modal
│   ├── session/
│   │   └── [id].tsx         # Session detail
│   ├── library/
│   │   └── [asanaName].tsx  # Asana detail
│   ├── _layout.tsx          # Root layout
│   └── +not-found.tsx       # 404 page
├── components/
│   ├── AsanaInput.tsx       # Asana autocomplete
│   ├── Carousel.tsx         # Cover flow carousel
│   ├── DurationBar.tsx      # Progress bar
│   ├── SessionCard.tsx      # Album-style card
│   └── ShareCard.tsx        # Export card for sharing
├── constants/
│   └── Colors.ts            # Theme colors
├── store/
│   └── useYogaStore.ts      # Zustand store
├── types/
│   └── index.ts             # TypeScript interfaces
├── utils/
│   └── share.ts             # View capture & share
├── global.css               # Tailwind imports
├── tailwind.config.js       # Tailwind configuration
├── babel.config.js          # Babel with NativeWind
└── metro.config.js          # Metro with NativeWind
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Expo Go app (iOS/Android)

### Installation

```bash
# Install dependencies
npm install

# Start development server
npx expo start
```

### Running on Device

1. Install **Expo Go** from App Store / Play Store
2. Scan QR code from terminal
3. App will load on your device

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start Expo dev server |
| `npm run android` | Start on Android |
| `npm run ios` | Start on iOS |
| `npm run web` | Start on web browser |

---

## License

MIT
