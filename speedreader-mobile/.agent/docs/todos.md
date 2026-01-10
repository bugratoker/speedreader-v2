# Speed Reader Backend Integration TODOs

## Phase 1: Backend Setup & Authentication 🔐

### 1.1 Project Initialization
- [ ] Create `backend/` folder in project root
- [ ] Initialize Node.js project with `npm init`
- [ ] Install core dependencies:
  - `express` - Web framework
  - `typescript` - Type safety
  - `prisma` - ORM for database
  - `@prisma/client` - Prisma client
  - `jsonwebtoken` - JWT authentication
  - `bcryptjs` - Password hashing
  - `cors` - Cross-origin requests
  - `helmet` - Security headers
  - `express-rate-limit` - Rate limiting
  - `zod` - Request validation
  - `dotenv` - Environment variables
- [ ] Install dev dependencies:
  - `ts-node-dev` - Development server with hot reload
  - `@types/express`, `@types/node`, `@types/bcryptjs`, `@types/jsonwebtoken`
  - `eslint`, `prettier`
- [ ] Configure `tsconfig.json` for Node.js
- [ ] Create folder structure:
  ```
  backend/
  ├── src/
  │   ├── controllers/
  │   ├── middleware/
  │   ├── routes/
  │   ├── services/
  │   ├── prisma/
  │   ├── types/
  │   ├── utils/
  │   └── index.ts
  ├── .env
  ├── .env.example
  ├── package.json
  └── tsconfig.json
  ```

### 1.2 Database Setup (PostgreSQL/SQLite)
- [ ] Initialize Prisma with `npx prisma init`
- [ ] Design and create Prisma schema with models:
  - `User` - id, email, password, name, avatarUrl, createdAt, updatedAt
  - `Book` - id, userId, title, author, sourceType, totalWords, totalChunks, coverColor, importedAt
  - `TextChunk` - id, bookId, chunkIndex, content, wordCount, startWord, endWord
  - `ReadingProgress` - id, userId, bookId, chunkIndex, wordIndex, percentage, lastReadAt
  - `ReadingSession` - id, userId, bookId, startedAt, endedAt, wordsRead, wpm, mode
  - `UserStats` - id, userId, totalBooksRead, totalWordsRead, currentStreak, longestStreak, currentWpm, bestWpm
  - `TrainingSession` - id, userId, exerciseType, score, duration, completedAt
- [ ] Run `npx prisma migrate dev` to create tables
- [ ] Generate Prisma client

### 1.3 Authentication System
- [ ] Create `auth.controller.ts`:
  - POST `/api/auth/register` - Create new user account
  - POST `/api/auth/login` - Login with email/password, return JWT
  - POST `/api/auth/refresh` - Refresh expired JWT token
  - POST `/api/auth/logout` - Invalidate refresh token
  - GET `/api/auth/me` - Get current user profile
- [ ] Create `auth.middleware.ts`:
  - JWT validation middleware
  - Attach user to request object
- [ ] Create `auth.service.ts`:
  - Password hashing/verification
  - JWT token generation/verification
  - Refresh token handling
- [ ] Create validation schemas with Zod:
  - RegisterSchema (email, password, name)
  - LoginSchema (email, password)

---

## Phase 2: Core API Endpoints 📚

### 2.1 User Management
- [ ] Create `user.controller.ts`:
  - GET `/api/users/profile` - Get user profile with stats
  - PUT `/api/users/profile` - Update user profile (name, avatar)
  - PUT `/api/users/password` - Change password
  - DELETE `/api/users/account` - Delete account and all data

### 2.2 Library & Books API
- [ ] Create `book.controller.ts`:
  - GET `/api/books` - List all user's books (with pagination)
  - GET `/api/books/:id` - Get single book details
  - POST `/api/books` - Create/import new book
  - PUT `/api/books/:id` - Update book metadata
  - DELETE `/api/books/:id` - Delete book and its chunks
- [ ] Create `chunk.controller.ts`:
  - GET `/api/books/:bookId/chunks` - Get all chunks for a book
  - GET `/api/books/:bookId/chunks/:index` - Get specific chunk
  - POST `/api/books/:bookId/chunks` - Upload chunks (batch)

### 2.3 Reading Progress API
- [ ] Create `progress.controller.ts`:
  - GET `/api/progress/:bookId` - Get current reading position
  - PUT `/api/progress/:bookId` - Update reading position
  - POST `/api/progress/:bookId/sync` - Sync local progress to cloud

### 2.4 Reading Sessions API
- [ ] Create `session.controller.ts`:
  - GET `/api/sessions` - List all reading sessions (with filters)
  - GET `/api/sessions/stats` - Get aggregated session stats
  - POST `/api/sessions` - Create new reading session
  - PUT `/api/sessions/:id` - Update session (end time, stats)

### 2.5 PDF Text Extraction API
- [ ] Install PDF processing library (`pdf-parse` or `pdf-lib`)
- [ ] Create `pdf.controller.ts`:
  - POST `/api/pdf/parse` - Upload PDF and extract text
    - Accept multipart/form-data with PDF file
    - Return extracted text, title, author, page count
  - POST `/api/pdf/parse-url` - Extract text from PDF URL
- [ ] Create `pdf.service.ts`:
  - PDF text extraction logic
  - Metadata extraction (title, author, pages)
  - Text cleaning and normalization
  - Handle OCR fallback for scanned PDFs (optional)
- [ ] Add file upload middleware (multer)
- [ ] Add file size limits (e.g., 50MB max)

---

## Phase 3: Statistics & Analytics 📊

### 3.1 User Statistics API
- [ ] Create `stats.controller.ts`:
  - GET `/api/stats/overview` - Get overall user stats (books read, words, streak, WPM)
  - GET `/api/stats/weekly` - Get weekly activity data
  - GET `/api/stats/progress` - Get WPM progress over time
  - GET `/api/stats/goals` - Get goal progress

### 3.2 Training Statistics
- [ ] Create `training.controller.ts`:
  - GET `/api/training/history` - List training sessions
  - GET `/api/training/stats` - Get training statistics per exercise type
  - POST `/api/training/session` - Log completed training session

### 3.3 Leaderboard (Optional)
- [ ] GET `/api/leaderboard/wpm` - Top users by WPM
- [ ] GET `/api/leaderboard/streak` - Top users by reading streak
- [ ] GET `/api/leaderboard/books` - Top users by books completed

---

## Phase 4: AI Integration Backend 🤖

### 4.1 AI Content Generation
- [ ] Create `ai.controller.ts`:
  - POST `/api/ai/generate-passage` - Generate reading passage with AI
  - POST `/api/ai/generate-questions` - Generate comprehension questions
  - POST `/api/ai/generate-image` - Generate image via SiliconFlow/Flux API
  - POST `/api/ai/summarize` - Summarize text

### 4.2 AI Service Integration
- [ ] Create `ai.service.ts`:
  - OpenAI API integration for text generation
  - SiliconFlow (Flux.1-Schnell) integration for image generation
  - Rate limiting for AI requests
  - Caching for generated content

---

## Phase 5: Cloud Sync 🔄

### 5.1 Sync Infrastructure
- [ ] Create `sync.controller.ts`:
  - POST `/api/sync/upload` - Upload local data to cloud
  - GET `/api/sync/download` - Download cloud data to local
  - POST `/api/sync/merge` - Merge local and cloud data with conflict resolution

### 5.2 Sync Logic
- [ ] Create `sync.service.ts`:
  - Last-write-wins conflict resolution
  - Incremental sync based on timestamps
  - Chunked upload for large books

---

## Phase 6: Mobile App Integration 📱

### 6.1 Update Mobile API Service
- [ ] Update `src/services/api.ts`:
  - Add auth headers (Bearer token)
  - Add token refresh interceptor
  - Add offline detection
- [ ] Create `src/services/authService.ts`:
  - Register, login, logout functions
  - Secure token storage (expo-secure-store)
  - Auto-refresh token logic

### 6.2 Update Mobile Store
- [ ] Update `src/store/index.tsx`:
  - Add auth state (token, user, isAuthenticated)
  - Add sync state (lastSynced, isSyncing)
  - Add stats state (from API)
- [ ] Create authentication actions

### 6.3 Auth Screens (Mobile)
- [ ] Create `LoginScreen.tsx`:
  - Email/password form
  - Error handling
  - "Remember me" option
  - Social login buttons (future)
- [ ] Create `RegisterScreen.tsx`:
  - Name, email, password form
  - Password strength indicator
  - Terms acceptance
- [ ] Create `ForgotPasswordScreen.tsx`:
  - Email input
  - Reset link sent confirmation

### 6.4 Update Existing Screens
- [ ] Update `HomeScreen.tsx`:
  - Replace mock data with API calls
  - Show real statistics
  - Handle loading/error states
- [ ] Update `ProfileScreen.tsx`:
  - Show real user profile
  - Add logout button
  - Add sync status indicator
- [ ] Update `LibraryScreen.tsx`:
  - Sync books with cloud
  - Show sync status per book

---

## Phase 7: Push Notifications 🔔 (Optional)

### 7.1 Backend Setup
- [ ] Install `firebase-admin` for FCM
- [ ] Create `notification.controller.ts`:
  - POST `/api/notifications/register` - Register device token
  - DELETE `/api/notifications/unregister` - Unregister device

### 7.2 Notification Types
- [ ] Daily reading reminder
- [ ] Streak at risk warning
- [ ] New AI-generated content notification
- [ ] Achievement unlocked notification

---

## Phase 8: Deployment & DevOps 🚀

### 8.1 Backend Deployment
- [ ] Create Dockerfile for backend
- [ ] Create docker-compose.yml (backend + postgres)
- [ ] Set up Railway/Render/Fly.io deployment
- [ ] Configure environment variables
- [ ] Set up SSL/HTTPS

### 8.2 Database
- [ ] Set up production PostgreSQL database
- [ ] Configure connection pooling (PgBouncer)
- [ ] Set up automated backups

### 8.3 Monitoring
- [ ] Add logging (Winston/Pino)
- [ ] Add error tracking (Sentry)
- [ ] Add API monitoring (uptime checks)

---

## Tech Stack Summary

| Component | Technology |
|-----------|-----------|
| **Backend Runtime** | Node.js + TypeScript |
| **Web Framework** | Express.js |
| **Database** | PostgreSQL (prod) / SQLite (dev) |
| **ORM** | Prisma |
| **Authentication** | JWT + bcrypt |
| **Validation** | Zod |
| **AI Services** | OpenAI API, SiliconFlow (Flux) |
| **Mobile** | React Native + Expo |
| **State Management** | React Context (existing) |
| **Secure Storage** | expo-secure-store |
| **Push Notifications** | Firebase Cloud Messaging (optional) |

---

## API Endpoints Summary

```
Authentication:
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh
POST   /api/auth/logout
GET    /api/auth/me

Users:
GET    /api/users/profile
PUT    /api/users/profile
PUT    /api/users/password
DELETE /api/users/account

Books:
GET    /api/books
GET    /api/books/:id
POST   /api/books
PUT    /api/books/:id
DELETE /api/books/:id
GET    /api/books/:id/chunks
GET    /api/books/:id/chunks/:index
POST   /api/books/:id/chunks

Progress:
GET    /api/progress/:bookId
PUT    /api/progress/:bookId
POST   /api/progress/:bookId/sync

Sessions:
GET    /api/sessions
GET    /api/sessions/stats
POST   /api/sessions
PUT    /api/sessions/:id

Statistics:
GET    /api/stats/overview
GET    /api/stats/weekly
GET    /api/stats/progress
GET    /api/stats/goals

Training:
GET    /api/training/history
GET    /api/training/stats
POST   /api/training/session

AI:
POST   /api/ai/generate-passage
POST   /api/ai/generate-questions
POST   /api/ai/generate-image
POST   /api/ai/summarize

Sync:
POST   /api/sync/upload
GET    /api/sync/download
POST   /api/sync/merge

Notifications:
POST   /api/notifications/register
DELETE /api/notifications/unregister
```

---

## Priority Order

1. ⭐ **Phase 1** - Backend Setup & Auth (MUST HAVE)
2. ⭐ **Phase 2** - Core API Endpoints (MUST HAVE)
3. ⭐ **Phase 6** - Mobile Integration (MUST HAVE)
4. 🔶 **Phase 3** - Statistics API (SHOULD HAVE)
5. 🔶 **Phase 4** - AI Integration (SHOULD HAVE)
6. 🔶 **Phase 5** - Cloud Sync (SHOULD HAVE)
7. ⚪ **Phase 7** - Push Notifications (NICE TO HAVE)
8. ⚪ **Phase 8** - Deployment (WHEN READY)
