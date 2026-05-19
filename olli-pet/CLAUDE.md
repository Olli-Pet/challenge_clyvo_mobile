# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Run these from the `olli-pet/` directory:

```bash
npm start          # Start Expo dev server (opens Expo Go QR code)
npm run android    # Run on Android emulator
npm run ios        # Run on iOS simulator
npm run web        # Run on web browser
npm run lint       # Run ESLint
```

There are no unit tests configured.

## Architecture

**Olli Pet** is a cross-platform pet health management app built with Expo/React Native (~54), TypeScript, and file-based routing via Expo Router.

### Routing & Navigation

All screens live in `app/` and use Expo Router's file-based routing. The root `app/_layout.tsx` wraps everything in a Stack navigator with `headerShown: false`. Navigation between screens is done via `router.push()` / `router.replace()` from `expo-router`.

### Key Screens

| File | Purpose |
|------|---------|
| `app/Index.tsx` | Login screen (hardcoded test credentials: gaby@gmail.com / 123) |
| `app/Cadastro.tsx` | Firebase Auth signup |
| `app/Home.tsx` | Dashboard: pet carousel + event cards |
| `app/AddPet.tsx` | Add pet form → saves to Firestore |
| `app/PetProfile.tsx` | Individual pet detail view |
| `app/HistoricoPet.tsx` | Pet event history with pet selector |
| `app/ChatAI.tsx` | AI chat interface (UI mostly done, logic incomplete) |

### Services & Backend

- **`services/petService.ts`** — All Firestore operations for pets (`savePet()`, `subscribePets()`). Real-time updates via snapshot listener. Pet documents are scoped to the logged-in user via Firebase Auth UID.
- **`api/GeminiApi.ts`** — Wraps Google Gemini API (`sendMessageToGemini()`). The API key is a placeholder (`"SUA_API_KEY_AQUI"`) — it must be set before the AI chat works.
- **`config/firebase.js`** — Firebase app initialization, exports `db` (Firestore) and `auth`.

### Components

Reusable UI lives in `components/`. Key ones:
- `Navbar.tsx` — Bottom tab bar with Home / AddPet / Pets navigation
- `PetCircle.tsx` — Circular pet selector used in the Home carousel
- `CardEventos.tsx` — Event card for medical/health events
- `BotaoIA.tsx` — Floating button that opens ChatAI
- `Onda.tsx` / `OndaBottom.tsx` — SVG wave decorations for auth screens

### State Management

There is no global state library. Pet data flows via the `subscribePets()` real-time listener (called inside `useEffect` in Home and HistoricoPet). Auth state is read directly from `auth.currentUser` where needed.

### Path Aliases

`@/*` resolves to the project root (`olli-pet/`), configured in `tsconfig.json`. Use it for all internal imports (e.g. `import { savePet } from '@/services/petService'`).

### Known Incomplete Areas

- `app/ChatAI.tsx`: Message list rendering and Gemini response display are not wired up yet.
- `app/Index.tsx`: Login uses hardcoded credentials, not Firebase Auth.
- Event cards in `Home.tsx` show hardcoded examples instead of real Firestore data.
- Gemini API key must be set in `api/GeminiApi.ts` for AI features to work.
