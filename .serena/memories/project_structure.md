# Project Structure

```
yogilog/
├── app/                          # Expo Router pages (file-based routing)
│   ├── (tabs)/                   # Tab navigator group
│   │   ├── _layout.tsx           # Tab navigator configuration
│   │   ├── index.tsx             # Home screen (session carousel)
│   │   ├── library.tsx           # Asana library grid
│   │   └── history.tsx           # Calendar with session history
│   ├── (modals)/                 # Modal screens group
│   │   └── write.tsx             # Create new session modal
│   ├── session/                  # Session routes
│   │   └── [id].tsx              # Session detail (dynamic route)
│   ├── library/                  # Library routes
│   │   └── [asanaName].tsx       # Asana detail (dynamic route)
│   ├── _layout.tsx               # Root layout
│   ├── +html.tsx                 # HTML wrapper for web
│   └── +not-found.tsx            # 404 page
│
├── components/                   # Reusable UI components
│   ├── AsanaInput.tsx            # Asana autocomplete input
│   ├── Carousel.tsx              # Cover flow carousel
│   ├── DurationBar.tsx           # Progress bar component
│   ├── SessionCard.tsx           # Album-style session card
│   └── ShareCard.tsx             # Export card for sharing
│
├── constants/                    # App constants
│   └── Colors.ts                 # Theme colors and spacing
│
├── store/                        # Zustand state stores
│   └── useYogaStore.ts           # Main yoga session store
│
├── types/                        # TypeScript type definitions
│   └── index.ts                  # YogaSession, YogaStore interfaces
│
├── utils/                        # Utility functions
│   └── share.ts                  # View capture & share helpers
│
├── assets/                       # Static assets (images, fonts)
│
├── .expo/                        # Expo cache/config
├── .vscode/                      # VS Code settings
│
├── global.css                    # Tailwind imports
├── tailwind.config.js            # Tailwind/NativeWind config
├── babel.config.js               # Babel config (NativeWind)
├── metro.config.js               # Metro bundler config
├── tsconfig.json                 # TypeScript configuration
├── app.json                      # Expo app configuration
└── package.json                  # Dependencies & scripts
```

## Key Files

| File | Purpose |
|------|---------|
| `store/useYogaStore.ts` | Central state management for sessions |
| `types/index.ts` | All TypeScript interfaces |
| `constants/Colors.ts` | Theme colors and design tokens |
| `tailwind.config.js` | Custom Tailwind colors & theme |
| `app/_layout.tsx` | Root navigation setup |
| `app/(tabs)/_layout.tsx` | Tab bar configuration |
