# 📞 Buku Telepon

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](https://nodejs.org)

**Buku Telepon** is a community-driven public contact directory for Indonesian cities. Users can search, submit, and review public contacts — from hospitals and government offices to restaurants and local services.

> *Think of it as a modern, crowdsourced Yellow Pages for Indonesia.*

---

## ✨ Features

- 🔍 **Search & Browse** — Find public contacts by city, category, or keyword
- 📝 **Community Contributions** — Registered users can submit new contacts
- ⭐ **Reviews & Ratings** — Rate and review contacts to help others
- 🏙️ **Multi-city Support** — Browse contacts across Indonesian cities
- 🛡️ **Moderation System** — Admin approval workflow for submissions and reviews
- 📱 **Mobile-first UI** — Responsive design optimized for mobile devices
- 🔐 **Authentication** — Supabase-powered auth with email/password
- 👤 **Guest Access** — Limited browsing without registration (contribution wall)
- 📦 **Bulk Import** — Import contacts from your phone's contact list

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS |
| **Backend** | Node.js, Express, TypeScript |
| **Database** | PostgreSQL (via Supabase) |
| **ORM** | Prisma |
| **Auth** | Supabase Auth |
| **State** | TanStack Query (React Query) |
| **Containerization** | Docker, Docker Compose, Nginx |

## 📁 Project Structure

```
bukutelepon/
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # React context providers (Auth, City, Guest)
│   │   ├── hooks/          # Custom hooks
│   │   ├── lib/            # Axios & Supabase clients
│   │   ├── pages/          # Page components (public + admin)
│   │   └── types/          # TypeScript type definitions
│   ├── Dockerfile
│   └── package.json
├── server/                 # Express API server
│   ├── src/
│   │   ├── middleware/     # Auth, rate limiting, error handling, sanitization
│   │   ├── modules/       # Feature modules (contacts, reviews, cities, etc.)
│   │   └── utils/         # Prisma client, Supabase admin, logger
│   ├── Dockerfile
│   └── package.json
├── prisma/
│   ├── schema.prisma       # Database schema
│   ├── seed.ts             # Seed data for development
│   └── migrations/         # Database migrations
├── docker-compose.yml      # Development Docker setup
├── docker-compose.prod.yml # Production Docker setup
├── nginx.conf              # Nginx reverse proxy config
└── package.json            # Root workspace
```

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) ≥ 20
- [Docker](https://www.docker.com/) (optional, for containerized setup)
- A [Supabase](https://supabase.com/) project (free tier works)

### 1. Clone the Repository

```bash
git clone https://github.com/zikrulihsan/bukutelepon.git
cd bukutelepon
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and fill in the required values:

| Variable | Description |
|---|---|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anonymous/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) |
| `DATABASE_URL` | PostgreSQL connection string (pooled, via PgBouncer) |
| `DIRECT_URL` | PostgreSQL direct connection string (for migrations) |
| `PORT` | Server port (default: `3000`) |
| `NODE_ENV` | Environment (`development` or `production`) |
| `CLIENT_URL` | Frontend URL for CORS (default: `http://localhost:5173`) |
| `VITE_SUPABASE_URL` | Supabase URL for the client |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key for the client |
| `GUEST_VIEW_THRESHOLD` | Number of contacts a guest can view before being prompted to register |

### 3. Install Dependencies

```bash
# Root dependencies (Prisma)
npm install

# Server dependencies
cd server && npm install && cd ..

# Client dependencies
cd client && npm install && cd ..
```

### 4. Set Up the Database

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# (Optional) Seed the database with sample data
cd server && npm run db:seed && cd ..
```

### 5. Start Development Servers

**Option A: Run locally (two terminals)**

```bash
# Terminal 1 — API server (http://localhost:3000)
cd server && npm run dev

# Terminal 2 — Client dev server (http://localhost:5173)
cd client && npm run dev
```

**Option B: Run with Docker Compose**

```bash
docker compose up --build
```

This starts:
- **API** on port `3001`
- **Client** on port `5173`
- **Nginx** reverse proxy on port `80`

## 📡 API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/health` | — | Health check |
| `POST` | `/api/auth/register` | — | Register a new user |
| `GET` | `/api/auth/me` | ✅ | Get current user profile |
| `GET` | `/api/auth/my-contributions` | ✅ | Get user's submitted contacts |
| `GET` | `/api/contacts` | — | List approved contacts (paginated, filterable) |
| `GET` | `/api/contacts/:id` | — | Get contact details with reviews |
| `POST` | `/api/contacts` | ✅ | Submit a new contact |
| `POST` | `/api/contacts/bulk` | ✅ | Bulk submit contacts |
| `GET` | `/api/cities` | — | List all cities |
| `GET` | `/api/cities/:slug` | — | Get city details |
| `GET` | `/api/categories` | — | List all categories |
| `GET` | `/api/reviews?contactId=` | — | List reviews for a contact |
| `POST` | `/api/reviews` | ✅ | Submit a review |
| `POST` | `/api/guest/track` | — | Track guest session views |
| `GET` | `/api/guest/status/:token` | — | Get guest session status |
| `GET` | `/api/admin/stats` | 🔒 Admin | Dashboard statistics |
| `GET` | `/api/admin/contacts` | 🔒 Admin | List all contacts (filterable) |
| `POST` | `/api/admin/contacts` | 🔒 Admin | Create contact (auto-approved) |
| `POST` | `/api/admin/contacts/bulk` | 🔒 Admin | Bulk create contacts |
| `PUT` | `/api/admin/contacts/:id` | 🔒 Admin | Edit a contact |
| `PATCH` | `/api/admin/contacts/:id/approve` | 🔒 Admin | Approve a contact |
| `PATCH` | `/api/admin/contacts/:id/reject` | 🔒 Admin | Reject a contact |
| `GET` | `/api/admin/reviews` | 🔒 Admin | List all reviews |
| `PATCH` | `/api/admin/reviews/:id/approve` | 🔒 Admin | Approve a review |
| `PATCH` | `/api/admin/reviews/:id/reject` | 🔒 Admin | Reject a review |
| `GET` | `/api/admin/users` | 🔒 Admin | List all users |

> **Auth**: `✅` = requires Bearer token, `🔒 Admin` = requires admin role

## 🐳 Docker

### Development

```bash
docker compose up --build
```

### Production

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on how to submit pull requests, report issues, and contribute to the project.

Please note that this project adheres to a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold it.

## 🔒 Security

If you discover a security vulnerability, please follow our [Security Policy](SECURITY.md) for responsible disclosure.

## 📄 License

This project is licensed under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- [Supabase](https://supabase.com/) — Auth and database hosting
- [Prisma](https://www.prisma.io/) — Type-safe ORM
- [Vite](https://vitejs.dev/) — Lightning-fast frontend tooling
- [TanStack Query](https://tanstack.com/query) — Data fetching and caching