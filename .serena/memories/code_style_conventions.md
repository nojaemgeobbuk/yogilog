# Code Style & Conventions

## TypeScript
- **Strict mode enabled** (`"strict": true` in tsconfig.json)
- Use TypeScript for all code files (`.ts`, `.tsx`)
- Define interfaces in `types/index.ts`
- Use path aliases: `@/` for project root imports

## Naming Conventions
- **Components**: PascalCase (e.g., `SessionCard.tsx`, `AsanaInput.tsx`)
- **Hooks/Stores**: camelCase with "use" prefix (e.g., `useYogaStore.ts`)
- **Files**: Match component/export name
- **Interfaces**: PascalCase (e.g., `YogaSession`, `SessionCardProps`)
- **Props interfaces**: Component name + "Props" suffix

## Component Structure
- Functional components with TypeScript
- Props defined as interfaces
- Named exports preferred
- Hooks at the top of component body

## Styling
- **NativeWind/Tailwind CSS** for all styling
- Use `className` prop with Tailwind utilities
- Theme colors defined in `tailwind.config.js` and `constants/Colors.ts`
- Custom colors:
  - `background`: #121216 (dark)
  - `primary`: #A238FF (purple)
  - `accent`: #CCFF00 (neon yellow-green)
  - `card`: rgba(88, 28, 135, 0.8) (translucent purple)

## State Management
- Use Zustand stores in `store/` directory
- AsyncStorage for persistence
- Selectors for accessing store state

## File Organization
- Routes in `app/` following Expo Router conventions
- Reusable components in `components/`
- Types in `types/`
- Utilities in `utils/`
- Constants in `constants/`
- Store in `store/`

## No Linting/Formatting Tools Configured
- No ESLint or Prettier configuration files found
- Follow existing code patterns for consistency
