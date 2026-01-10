# Speed Reader Backend - Change Log

## 2026-01-10 - Hybrid Auth Implementation

### Schema Changes (`src/prisma/schema.prisma`)
- `User.email` → Optional (for guest users)
- `User.password` → Optional (for social auth)
- Added `authMethod` ('email' | 'google' | 'apple' | 'guest')
- Added `googleId` (unique, optional)
- Added `appleId` (unique, optional)
- Added `isGuest` boolean

### New Auth Endpoints (`src/routes/auth.routes.ts`)
- `POST /api/auth/guest` - Create guest account (no email needed)
- `POST /api/auth/google` - Google Sign-In
- `POST /api/auth/apple` - Apple Sign-In
- `POST /api/auth/convert` - Convert guest → full account

### Auth Service Updates (`src/services/auth.service.ts`)
- `createGuestUser()` - Guest account creation
- `googleAuth()` - Google login/register
- `appleAuth()` - Apple login/register
- `convertGuestToAccount()` - Guest conversion with data preservation
- Refresh token duration: 30 days → 1 year (mobile UX)
- Access token duration: 7 days → 15 min (security)

### Types Added (`src/types/index.ts`)
- `SocialAuthInput` - For Google/Apple auth
- `GuestConvertInput` - For guest conversion
- `AuthMethod` type
- `UserProfile` now includes `authMethod`, `isGuest`

### Validation Schemas (`src/middleware/validate.middleware.ts`)
- `socialAuthSchema` - Validates idToken, optional email/name/avatar
- `guestConvertSchema` - Validates conversion method and credentials

---

## 2026-01-10 - Initial Backend Setup

- Created Express + TypeScript backend
- Prisma schema with User, Book, TextChunk, ReadingProgress, etc.
- Auth with JWT (access + refresh tokens)
- 7 controllers: auth, book, progress, session, stats, training, pdf
- PDF parsing with `pdf-parse` library
