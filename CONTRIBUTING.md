# Contributing to Buku Telepon

Thank you for your interest in contributing to **Buku Telepon**! Every contribution helps make this project better for the Indonesian community.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Development Workflow](#development-workflow)
- [Coding Guidelines](#coding-guidelines)
- [Commit Messages](#commit-messages)
- [Pull Requests](#pull-requests)

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to [zikrulihsan2695@gmail.com](mailto:zikrulihsan2695@gmail.com).

## How Can I Contribute?

### 🐛 Report Bugs

Found a bug? Please [open an issue](https://github.com/zikrulihsan/bukutelepon/issues/new?template=bug_report.md) with:
- A clear, descriptive title
- Steps to reproduce the issue
- Expected vs actual behavior
- Screenshots if applicable

### 💡 Suggest Features

Have an idea? [Open a feature request](https://github.com/zikrulihsan/bukutelepon/issues/new?template=feature_request.md) describing:
- The problem you'd like to solve
- Your proposed solution
- Any alternative approaches you've considered

### 🔧 Submit Code Changes

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Development Setup

### Prerequisites

- Node.js ≥ 20
- Docker (optional)
- A Supabase project

### Quick Start

```bash
# Fork and clone
git clone https://github.com/<your-username>/bukutelepon.git
cd bukutelepon

# Install all dependencies
npm install
cd server && npm install && cd ..
cd client && npm install && cd ..

# Set up environment
cp .env.example .env
# Edit .env with your Supabase credentials

# Set up database
npx prisma generate
npx prisma migrate dev

# Start development
# Terminal 1: API server
cd server && npm run dev

# Terminal 2: Client
cd client && npm run dev
```

## Development Workflow

### Branch Naming

Use descriptive branch names with prefixes:

| Prefix | Purpose | Example |
|---|---|---|
| `feat/` | New feature | `feat/search-autocomplete` |
| `fix/` | Bug fix | `fix/login-redirect-loop` |
| `docs/` | Documentation | `docs/api-endpoints` |
| `refactor/` | Code refactoring | `refactor/contact-module` |
| `chore/` | Maintenance | `chore/update-dependencies` |

### Branch Strategy

- `main` — Production-ready code
- `develop` — Integration branch for features
- `feat/*`, `fix/*` — Branch off from `develop`

## Coding Guidelines

### TypeScript

- Use TypeScript for all new code (both client and server)
- Avoid `any` types; use proper typing
- Use `interface` for object shapes and `type` for unions/intersections

### Server (Express)

- Place new feature modules in `server/src/modules/<feature>/`
- Each module should have its own router file
- Use Zod for request validation
- Use the `AppError` class for error responses
- Apply appropriate middleware (auth, rate limiting, sanitization)

### Client (React)

- Use functional components with hooks
- Place page components in `client/src/pages/`
- Place reusable components in `client/src/components/`
- Use TanStack Query for data fetching
- Follow the existing Tailwind CSS patterns

### Database

- Add Prisma migrations for schema changes: `npx prisma migrate dev --name <description>`
- Update `prisma/seed.ts` if adding new seed data
- Keep indexes on commonly queried fields

## Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | Description |
|---|---|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation only changes |
| `style` | Code style changes (formatting, no logic change) |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `perf` | Performance improvement |
| `test` | Adding or updating tests |
| `chore` | Maintenance tasks |

### Examples

```
feat(contacts): add search autocomplete suggestions
fix(auth): resolve redirect loop on expired session
docs(readme): add API endpoint table
refactor(server): extract validation schemas to shared module
```

## Pull Requests

### Before Submitting

- [ ] Code compiles without errors (`cd server && npm run build && cd ../client && npm run build`)
- [ ] Changes follow the coding guidelines above
- [ ] Commit messages follow conventional commits format
- [ ] Documentation is updated if needed

### PR Process

1. Fill in the pull request template
2. Link any related issues
3. Request a review from a maintainer
4. Address any feedback
5. Once approved, a maintainer will merge your PR

### Review Criteria

- **Correctness** — Does it solve the problem?
- **Code quality** — Is it clean, readable, and maintainable?
- **Security** — Does it introduce any vulnerabilities?
- **Performance** — Are there any performance concerns?

## 🙏 Thank You!

Your contributions make Buku Telepon better for everyone. Whether it's fixing a typo, reporting a bug, or building a new feature — every contribution matters!
