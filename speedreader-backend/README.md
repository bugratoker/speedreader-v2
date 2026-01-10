# Speed Reader Backend

Node.js + TypeScript backend for the Speed Reader mobile application.

## Quick Start

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Create database
npm run db:push

# Start development server
npm run dev
```

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/health` | Health check | No |
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login | No |
| POST | `/api/auth/refresh` | Refresh token | No |
| GET | `/api/auth/me` | Get current user | Yes |
| GET | `/api/books` | List books | Yes |
| POST | `/api/books` | Create book | Yes |
| POST | `/api/pdf/import` | Import PDF | Yes |
| GET | `/api/stats/overview` | User stats | Yes |
| POST | `/api/training/session` | Log training | Yes |

## Scripts

- `npm run dev` - Start dev server with hot reload
- `npm run build` - Build for production
- `npm run start` - Run production build
- `npm run db:studio` - Open Prisma Studio

## Tech Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Database**: SQLite (dev) / PostgreSQL (prod)
- **ORM**: Prisma
- **Auth**: JWT + bcrypt
- **Validation**: Zod
