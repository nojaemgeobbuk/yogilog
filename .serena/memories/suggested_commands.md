# Suggested Commands

## Development Commands

### Start Development Server
```bash
npm start
# or
npx expo start
```
This starts the Expo development server. Scan the QR code with Expo Go app.

### Platform-Specific
```bash
npm run android    # Start on Android emulator/device
npm run ios        # Start on iOS simulator/device
npm run web        # Start in web browser
```

### Install Dependencies
```bash
npm install
```

### Type Checking
```bash
npx tsc --noEmit
```
No dedicated type-check script, but TypeScript is configured with strict mode.

## System Utilities (Windows)

### File Operations
```powershell
dir          # List directory (like ls)
type         # Display file contents (like cat)
copy         # Copy files
move         # Move files
del          # Delete files
mkdir        # Create directory
rmdir        # Remove directory
```

### Git Commands
```bash
git status
git add .
git commit -m "message"
git push
git pull
git log --oneline
git diff
```

### Navigation
```powershell
cd path\to\dir   # Change directory
cd ..            # Go up one level
cd \             # Go to root
```

## Notes
- No test suite configured (react-test-renderer is a devDependency but no test scripts)
- No linting or formatting scripts configured
- Project uses Expo managed workflow
