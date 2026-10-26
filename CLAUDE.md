# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Suggestify is an anonymous "suggestion box" SPA. Owners sign in with Google, create a box and share its link or QR code. Anyone can submit feedback without an account, and the owner reads it in real time. It's React 18 + Vite + Firebase (Auth + Firestore), plain JavaScript (no TypeScript), with no custom backend.

## Commands

Package manager is **Yarn 1** (`yarn.lock`). You need Node 22.12+, and Java 21 for the Firebase emulators.

```bash
yarn dev                 # dev server against the real project in .env (cp .env.example .env first)
yarn emulators           # Auth + Firestore emulators (project demo-suggestify, UI on :4000)
yarn dev:emulators       # dev server wired to the emulators (vite --mode emulator → .env.emulator)
yarn build               # production build to dist/
yarn lint                # ESLint 8, --max-warnings 0 (any warning fails)
yarn test                # starts the Firestore emulator and runs ALL vitest tests (rules + unit)
yarn test:unit           # unit tests only, no emulator (vitest run src)
```

Run a single test:

```bash
npx vitest run src/util/helpers.test.js                      # one unit test file
npx firebase emulators:exec --only firestore --project demo-suggestify \
  "npx vitest run tests -t 'stranger cannot claim'"          # one rules test (needs the emulator)
```

`yarn test` and `yarn emulators` both bind port 8080, so stop a running emulator before `yarn test`.

CI (`.github/workflows/ci.yml`) runs `yarn install --frozen-lockfile`, then lint, build and test, on PRs and on pushes to `main`.

## Architecture

### Security lives in `firestore.rules`

There's no server, so `firestore.rules` is the only access control, and `tests/firestore.rules.test.js` covers it. Any change to read/write behaviour almost always needs a matching rules change and test.

**Client code and rules must be deployed together** (`npx firebase deploy --only hosting,firestore:rules`). For example, batched box creation only passes the new rules' `existsAfter` check.

### Data model and ownership (non-obvious)

```
users/{uid}                          profile (field is "createAt", legacy spelling, keep it)
users/{uid}/feedbacks/{boxId}        owner link; despite the name these are BOXES { name, isOpen }
feedbackBox/{boxId}                  public box doc { name, timestamp, isOpen }
feedbackBox/{boxId}/feedback/{id}    anonymous feedback { feedback, isMarked, isRead, dateTime }
```

- **Ownership.** A box is owned by whoever holds `users/{uid}/feedbacks/{boxId}`. Box IDs are public, because they're in the share URL. The rules therefore only allow creating an owner link when the box doesn't exist yet; that check is what prevents box takeover.
- **Legacy data.** Production has boxes from before `isOpen` existed, so a missing `isOpen` means open: `data.get('isOpen', true)` in the rules, and `?? true` in `toBox()`. `dateTime` is epoch milliseconds (a number), not a Firestore Timestamp. Don't rename collections or fields, because existing data depends on them.
- **Route params.** The `:uid` route param in `/give-feedback/:uid` and `/home/feedbacks/:uid` is a **box ID**, not a user ID.

### Data access: `src/util/firebase.js`

Every Firestore and Auth call lives in this one module.

- **Multi-document writes use `writeBatch`.**
  - Create writes the owner link and the box together.
  - Rename and close/reopen update both the box doc and the owner link.
  - Delete removes the feedback docs in chunks first, and the owner link last, because the rules use the link to prove ownership.
- **`subscribe*` helpers** wrap `onSnapshot`. Each returns its unsubscribe function and takes an error callback. Components must call that unsubscribe on cleanup.
- **Emulator mode.** `connect*Emulator` runs when `VITE_USE_FIREBASE_EMULATORS=true`, which `.env.emulator` sets.

### Auth flow

- **Listener.** `App.jsx` holds the only `onAuthStateChanged` listener. It writes the user into the Redux `user` slice, whose `status` is `loading` | `authenticated` | `guest`.
- **Route guards.** `src/components/RouteGuards/RouteGuards.jsx` reads that status:
  - `RequireAuth` wraps `/home/*`.
  - `GuestOnly` wraps `/` and `/get-started`.
- **What not to use.** Gate on `status`, not `auth.currentUser`, which is `null` until Firebase restores the session. There's no redux-persist, and components don't navigate after sign-in themselves; the guards handle it.
- **Sign-in.** It uses `signInWithPopup`, falling back to `signInWithRedirect` when popups are blocked.

### Real-time UI

- **Home badges.** `src/hooks/useFeedbackBoxes.js` subscribes to the user's boxes and keeps one unread-count listener per box, adding and removing listeners as boxes change.
- **Unread handling in `src/pages/Feedbacks/Feedbacks.jsx`.**
  - On each snapshot, it marks unread feedback as read in a batch.
  - It also remembers those IDs in `newIds`, so they stay highlighted for the session.
  - The "Unread" filter means "new since you opened this box". It uses `newIds`, not the `isRead` field.
  - `isDeletingRef` suppresses listener errors and not-found flashes while a box is being deleted.

### Bundling

- **Lazy routes.** Every page is `React.lazy` in `src/routes.jsx`.
- **PDF export.** `@react-pdf/renderer` (about 1.2 MB) is imported dynamically inside the PDF export handler. Keep it out of static imports so it stays out of the main bundle.
- **`public/`.** Vite copies `public/` verbatim into `dist/`, so never put build output there. It previously held about 11 MB of stale bundles.

## Config and conventions

- **Env files.**
  - `.env` is git-ignored and holds the Firebase web config (`VITE_FIREBASE_*`). `.env.example` is the committed template. `src/util/firebase.js` throws a clear error if the config is missing.
  - `.env.emulator` is committed with fake `demo-suggestify` values, so emulator mode needs no `.env` and never touches real resources.
  - CI needs no `.env`: build and tests don't use real Firebase values.
- **Tailwind theme.** The custom colors `green`, `darkGreen`, `primary`, `brown` and `red` **replace** Tailwind's default `green`/`red` scales. Fonts:
  - `font-display` is Oswald, for headings.
  - `font-body` is Inter, and is normally paired with `font-light`.
- **ESLint.** `react/prop-types` is off. `react-refresh/only-export-components` warns if a component file also exports non-components, and warnings fail lint.
- **Hosting.** Firebase Hosting is primary. `vercel.json` and `netlify.toml` are SPA-rewrite alternatives.
- **Sign-in in browser tests.** Google popup sign-in needs `apis.google.com`, even against the Auth emulator. In a sandbox without that host, sign in from a test with `signInWithCredential(auth, GoogleAuthProvider.credential(JSON.stringify({ sub, email, name })))` against the emulator instead.
