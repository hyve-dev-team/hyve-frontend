# Hyve Frontend

A modern React frontend for the Hyve property platform. This repository contains the single-page application used for landlord and tenant flows including listings, authentication, and account verification.

**Status:** Development branch.

**Overview**

The Hyve frontend is a React + Vite application using Tailwind CSS for UI. It provides pages and components for listing apartments, landlord and tenant dashboards, onboarding, authentication and account verification flows.

**Tech Stack**

- React (functional components + hooks)
- Vite (dev server + build tool)
- Tailwind CSS
- PostCSS + Autoprefixer
- React Router DOM
- Axios
- Framer Motion
- Swiper
- ESLint

## Quick Start

Prerequisites:

- Node.js (v18+ recommended)
- npm (or yarn/pnpm)

Clone and install:

```bash
git clone <repo-url> hyve-frontend
cd hyve-frontend
npm install
```

Run the dev server (accessible on LAN due to `--host`):

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

Run lint checks:

```bash
npm run lint
```

## Available Scripts

Defined in `package.json`:

- `dev` — `vite --host`
- `build` — `vite build`
- `preview` — `vite preview`
- `lint` — `eslint .`

## Project Structure (high-level)

- `index.html` — Vite entry
- `src/main.jsx` — app bootstrap
- `src/App.jsx` — routes and root layout
- `src/pages/` — page views including `landlord`, `tenant`, `authentication`, `onboarding`
- `src/components/` — reusable UI components and layout
- `src/context/` — React contexts (e.g. `AuthContext.jsx`)
- `src/hooks/` — custom hooks for fetching data and local logic
- `src/api/` — API helpers (where network calls can be centralized)
- `src/assets/` — fonts, images, global CSS
- `tailwind.config.js`, `postcss.config.js` — styling setup
- `vite.config.js` — app config

