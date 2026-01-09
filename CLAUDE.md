# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Speed Reader V2 is a React Native/Expo mobile application for speed reading training. The app features multiple reading modes (RSVP, Bionic, Chunk, Guided, Dual-Column), training exercises for visual skills, a PDF/text library system, and progress tracking.

**Tech Stack**: React Native 0.81.5, Expo SDK 54, TypeScript 5.9.2, NativeWind (Tailwind), React Navigation v7, React Native Reanimated v4.1, i18next (EN/TR)

**Note**: Expo's New Architecture is enabled (`newArchEnabled: true` in app.json)

## Development Commands

### Running the App
```bash
# Start development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run in web browser
npm run web
```

### Type Checking
```bash
# TypeScript compiler
npx tsc --noEmit
```

**Note**: This project currently has no dedicated test suite, linting, or build scripts. Type checking is done via `tsc --noEmit`.

## Import Path Aliases

The project uses path aliases configured in both `tsconfig.json` and `babel.config.js`:

```typescript
@/*              → src/*
@components/*    → src/components/*
@screens/*       → src/screens/*
@navigation/*    → src/navigation/*
@hooks/*         → src/hooks/*
@services/*      → src/services/*
@utils/*         → src/utils/*
@theme/*         → src/theme/*
@types/*         → src/types/*
@store/*         → src/store/*
@assets/*        → assets/*
```

**Always use these aliases** when importing from `src/` directories.

## Architecture Overview

### Core Reading Engine

**File**: `src/engine/useReadingEngine.ts`

This is the **central hook** that powers all 5 reading modes. It manages:
- Text processing and word/chunk generation
- Drift-correcting timer (prevents WPM accuracy drift over long sessions)
- Mode switching (RSVP, Bionic, Chunk, Guided, Dual-Column)
- Speed control (WPM adjustment)
- Progress tracking (currentIndex, percentage)

**Key pattern**: Single unified hook returns mode-agnostic state + mode-specific data:
```typescript
const {
  // Common state
  mode, wpm, isPaused, isPlaying, progress, currentIndex,
  // Actions
  start, pause, resume, reset, speedUp, slowDown, setMode,
  // Mode-specific data (only relevant values populated per mode)
  currentWord,      // RSVP
  bionicText,       // Bionic
  currentChunk,     // Chunk
  // etc.
} = useReadingEngine({ text, mode, initialWpm, chunkSize, useSmartChunking });
```

**Algorithm highlights**:
- **Drift correction**: Uses `expectedTimeRef` to calculate next delay and prevent setTimeout drift
- **Smart chunking**: Respects phrase boundaries (conjunctions, punctuation) with bilingual support (EN/TR)
- **Bionic text**: Bolds ~40% of each word adaptively based on length

### Library System (Books & PDF Import)

**Files**:
- `src/services/libraryStorage.ts` - CRUD operations for books
- `src/services/pdfService.ts` - Import pipeline (PDF/TXT)
- `src/types/libraryTypes.ts` - Type definitions

**Storage strategy** (hybrid):
1. **Metadata**: AsyncStorage at key `@speedreader/books`
   - Book info, progress, timestamps
2. **Content**: FileSystem at `{documentDirectory}/library/chunks/{bookId}_{chunkIndex}.txt`
   - Text split into 10,000-word chunks
   - Loaded on-demand for memory efficiency

**PDF import pipeline**:
1. Pick file via `expo-document-picker`
2. Extract text using OCR.space API (free tier, 5MB limit)
3. Chunk text into 10K word segments
4. Save metadata to AsyncStorage, chunks to FileSystem
5. Track import progress via callback (`ImportProgress` stages)

**Key function**: `importDocument(uri, progressCallback)` orchestrates the full flow.

### Component Organization

Three-tier architecture:
1. **Screens** (`src/screens/`) - Top-level compositions
2. **Components** (`src/components/`) - Reusable building blocks
   - `reading/displays/` - Pure presentation (e.g., `RSVPWordDisplay`)
   - `reading/controls/` - User interaction (e.g., `RSVPControls`)
   - `training/` - Exercise components (each with sub-components)
   - `library/` - Bookshelf, import, book cards
   - `ui/` - Generic primitives
3. **Hooks** (`src/hooks/`) - Stateful logic

**Example flow**:
```
ReadScreen → useReadingEngine hook → RSVPWordDisplay (presentation)
                                   → RSVPControls (interaction)
```

### Navigation Structure

**File**: `src/navigation/index.tsx`

**Flow**:
```
App.tsx (providers)
  └─ RootNavigator
      ├─ Onboarding (first launch)
      │   ├─ WelcomeScreen (3 slides)
      │   └─ AssessmentScreen (WPM calibration)
      └─ MainTabNavigator (bottom tabs)
          ├─ Home (dashboard, stats)
          ├─ Library (bookshelf, import, news)
          ├─ Read (5 reading modes)
          ├─ Training (4 exercises)
          └─ Profile (settings, language)
```

**Persistent state**: AsyncStorage key `@speedreader/onboardingCompleted` determines if onboarding shows.

### Training Exercises

**Location**: `src/components/training/`

All exercises follow this pattern:
- **Hub view** (TrainingScreen) - 2x2 grid of exercise cards
- **Detail view** - Instructions, scientific basis (PubMed links), start button
- **Active view** - Exercise execution component

**4 exercises**:
1. **SchulteTable** - Peripheral vision (find numbers 1-25 in grid)
2. **SaccadicJumps** - Anti-regression (follow jumping dot)
3. **EyeStretch** (Infinity) - Ocular flexibility (trace infinity symbol)
4. **PeripheralCatch** - Parafoveal processing (6 sub-components, most complex)

**Completion callback**: Each exercise calls `onComplete(score)` when finished.

### State Management

**Global state** (minimal):
- **File**: `src/store/index.tsx`
- **Pattern**: Context API with reducer
- **State**: `{ user, isAuthenticated, themeMode, isLoading }`
- **Access**: `useAppState()`, `useAppDispatch()`, `useApp()`

**Local state**: Most state is screen-scoped (reading progress, settings, modals) and managed via hooks (`useReadingEngine`, `useLibrary`) or component `useState`.

### Theme System

**File**: `src/theme/index.ts`

Modular design tokens:
- `colors.ts` - Palettes (primary, secondary, text, surface, glassBorder)
- `typography.ts` - Font families (Inter, Playfair, Merriweather, Atkinson Hyperlegible), sizes, weights
- `spacing.ts` - Scale (xs to 3xl), border radii, layout constants
- `shadows.ts` - Shadow/glow definitions for depth

**Access**: `const { colors, spacing, fontFamily } = useTheme();`

**Multiple fonts available** for reading customization, including Atkinson Hyperlegible (dyslexia-friendly).

### Internationalization

**Setup**: `src/i18n/index.ts` (i18next + react-i18next + expo-localization)

**Languages**: English (en), Turkish (tr)

**Translation files**: `src/i18n/locales/{en,tr}.json` (360+ keys)

**Usage**:
```typescript
const { t } = useTranslation();
<Text>{t('training.exercises.schulte.title')}</Text>
```

**Auto-detection**: Uses device language via `expo-localization`.

## Key Files Reference

When working on specific features, start with these files:

**Reading Engine**:
- `src/engine/useReadingEngine.ts` - Central hook for all modes
- `src/engine/utils.ts` - Text processing algorithms
- `src/screens/ReadScreen/ReadScreen.tsx` - Main reading interface

**Library System**:
- `src/services/libraryStorage.ts` - Storage operations
- `src/services/pdfService.ts` - Import pipeline
- `src/types/libraryTypes.ts` - Type definitions
- `src/components/library/BookshelfView.tsx` - Library UI
- `src/components/library/ImportModal.tsx` - Import UI

**Training**:
- `src/screens/TrainingScreen/TrainingScreen.tsx` - Hub/detail/active states
- `src/components/training/{ExerciseName}/` - Individual exercises

**Navigation**:
- `src/navigation/index.tsx` - App navigation structure

**Theme & i18n**:
- `src/theme/index.ts` - Design system
- `src/i18n/index.ts` - Translation setup
- `src/i18n/locales/en.json` - All translation keys

## Common Patterns & Best Practices

### Reading Position Tracking

Reading position is stored as:
```typescript
interface ReadingPosition {
  chunkIndex: number;    // Which 10K-word chunk
  wordIndex: number;     // Position within chunk
  percentage: number;    // Overall progress (0-100)
}
```

**Calculation**:
```typescript
const globalPosition = chunkIndex * 10000 + wordIndex;
const percentage = (globalPosition / totalWords) * 100;
```

**Update**: Call `updateReadingPosition(bookId, chunkIndex, wordIndex)` when user progresses.

### Adding New Reading Modes

1. Add mode to `ReadingMode` enum in `src/engine/types.ts`
2. Implement text processing logic in `useReadingEngine.ts`
3. Create display component in `src/components/reading/displays/`
4. Add mode selector tab in `ReadingModeSelector.tsx`
5. Conditionally render display in `ReadScreen.tsx`
6. Add translations in `src/i18n/locales/en.json`

### Adding New Training Exercises

1. Create component directory: `src/components/training/NewExercise/`
2. Implement main component with `onComplete(score: number)` prop
3. Add exercise metadata to `TrainingScreen.tsx` exercises array:
   ```typescript
   {
     id: 'new-exercise',
     icon: LucideIcon,
     title: t('training.exercises.newExercise.title'),
     description: t('training.exercises.newExercise.description'),
     academicBasis: t('training.exercises.newExercise.academicBasis'),
     pubmedLink: 'https://pubmed.ncbi.nlm.nih.gov/...'
   }
   ```
4. Add translations for title, description, academicBasis
5. Handle detail → active state transition in `TrainingScreen`

### Working with Animations

**Library**: `react-native-reanimated` v4.1

**Common patterns**:
```typescript
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

<Animated.View entering={FadeInDown.delay(200).springify()}>
  {/* content */}
</Animated.View>
```

**Pre-built animations**: `FadeIn`, `FadeInDown`, `FadeInUp`, `FadeOut`, `Scale`, `Spring`

### Error Handling for Imports

**PDF imports** can fail for:
- File size > 5MB (OCR.space free tier limit)
- OCR processing errors
- Network issues
- Empty text extraction (scanned images without text)

**Handle errors** in `importDocument` via `progressCallback`:
```typescript
progressCallback({
  stage: 'error',
  progress: 0,
  error: 'Detailed error message'
});
```

**Show user-friendly errors** in `ImportModal.tsx` based on error stage.

## Important Notes

### OCR.space API Key
**File**: `src/services/pdfService.ts`

OCR.space API key is hardcoded in `pdfService.ts`. **For production**:
1. Move API key to environment variable
2. Add `.env` to `.gitignore`
3. Use `expo-constants` to access: `Constants.expoConfig?.extra?.ocrApiKey`

### AsyncStorage Keys
All AsyncStorage keys are prefixed with `@speedreader/`:
- `@speedreader/books` - Book metadata
- `@speedreader/onboardingCompleted` - Onboarding status
- (Add new keys with same prefix for consistency)

### FileSystem Paths
All book content stored at:
```
{documentDirectory}/library/chunks/{bookId}_{chunkIndex}.txt
```

**Always use** `FileSystem.documentDirectory` from `expo-file-system`.

### TypeScript Strict Mode
`strict: true` is enabled. All new code must:
- Have proper type annotations
- Avoid `any` (use `unknown` + type guards if needed)
- Handle null/undefined explicitly

### NativeWind (Tailwind CSS)
Styling uses NativeWind v4. **Prefer Tailwind classes** over StyleSheet:
```typescript
// Good
<View className="flex-1 bg-white p-4">

// Avoid (unless dynamic styles needed)
<View style={styles.container}>
```

**Access theme colors**: Use `useTheme()` hook for dynamic colors that aren't in Tailwind palette.

## Common Issues

### Timer Drift in Reading Modes
If WPM feels inaccurate over long sessions, verify `expectedTimeRef` logic in `useReadingEngine.ts`. The drift-correcting timer should maintain precision by calculating next delay based on expected time, not fixed interval.

### PDF Import Failures
Check:
1. File size (must be < 5MB)
2. OCR.space API response format (may change)
3. Base64 encoding (must be prefixed with `data:application/pdf;base64,`)
4. Network connectivity

### Missing Translations
If text shows as `translation.key.path`, add the key to both `src/i18n/locales/en.json` and `tr.json`.

### Chunk Loading Issues
If book content doesn't load:
1. Verify chunk files exist: `FileSystem.getInfoAsync(chunkPath)`
2. Check `totalChunks` matches actual chunk count
3. Ensure UTF-8 encoding in `saveTextChunk`

## Future Development Considerations

- **Testing**: No test suite exists. Consider adding Jest + React Native Testing Library.
- **Linting**: No ESLint config. Consider adding for code consistency.
- **CI/CD**: No automated builds. Consider GitHub Actions for Expo EAS builds.
- **Analytics**: No analytics implemented. Consider Expo Analytics or Mixpanel.
- **Authentication**: Auth system is stubbed (useAppState). Implement if needed.
- **Cloud Sync**: All storage is local. Consider backend for cross-device sync.
- **More languages**: Currently EN/TR. i18n infrastructure ready for more.
