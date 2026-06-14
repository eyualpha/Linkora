# Linkora Client

Modern React frontend for the Linkora social media platform.

## Stack

- **React 19** + **Vite 8** + **TypeScript**
- **Tailwind CSS v4** + **shadcn-style** Radix UI components
- **TanStack Query** — server state & caching
- **Zustand** — auth persistence
- **React Router v7** — routing
- **Axios** — typed API layer

## Getting started

```bash
cd client
npm install
cp .env.example .env
npm run dev
```

Ensure the backend is running on `http://localhost:5000`. The Vite dev server proxies `/api` automatically.

## Project structure

```
src/
├── components/
│   ├── layout/       # App shell, sidebar, top bar
│   ├── shared/       # Reusable domain components
│   └── ui/           # shadcn-style primitives
├── features/         # Feature modules (posts, stories)
├── lib/api/          # Typed API client & endpoints
├── pages/            # Route-level pages
├── stores/           # Zustand stores
└── types/            # Shared TypeScript types
```

## Features

- Auth (login, register, OTP verify, forgot password)
- Feed with infinite scroll
- Stories (upload, view, 24h expiry)
- Create posts with images
- Like, comment, save posts
- Explore trending & follow suggestions
- User profiles & follow/unfollow
- Notifications
- User search
- Profile settings

## Production build

```bash
npm run build
npm run preview
```

Set `VITE_API_URL` to your deployed API URL for production.
