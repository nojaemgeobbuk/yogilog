# Task Completion Checklist

When completing a task in this project, ensure the following:

## Before Committing

### 1. Type Safety
- [ ] Run `npx tsc --noEmit` to check for TypeScript errors
- [ ] Ensure no type errors or warnings

### 2. Code Quality
- [ ] Follow existing code patterns and conventions
- [ ] Use NativeWind/Tailwind for styling
- [ ] Import from path aliases (`@/`) where appropriate
- [ ] Check that new components match existing component structure

### 3. Functionality
- [ ] Test on at least one platform (run `npm start` and test in Expo Go)
- [ ] Verify UI looks correct on mobile screen sizes
- [ ] Test any new interactive features

### 4. State Management
- [ ] If adding new state, use Zustand store pattern
- [ ] Ensure state persistence works with AsyncStorage if needed

## Common Issues to Check
- NativeWind classes applied correctly with `className`
- Expo Router file naming conventions followed
- Images and assets referenced correctly
- Safe area handling for different devices

## No Automated Checks Available
This project does not have:
- ESLint configuration
- Prettier configuration
- Test suite
- Pre-commit hooks

Manual review is essential for code quality.
