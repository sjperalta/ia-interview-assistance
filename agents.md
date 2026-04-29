### Developer Guidelines (Feature-First Architecture)

🧠 **Purpose**

This document defines how AI agents and developers should interact with, extend, and maintain this React Native (Expo) codebase. The architecture follows a **Feature-First** approach, where each business domain is self-contained, scalable, and independently maintainable.

---

🏗️ **Core Principles**

1. **Feature Ownership**: Each feature is an independent module that owns its UI, logic, state, and API.
2. **Separation of Concerns**: No mixing of domains; no cross-feature tight coupling.
3. **Local First, Global Last**: Always implement logic inside the feature first. Promote to global (`/ui`, `/services`, `/utils`) only if truly reusable across multiple features.
4. **Predictable Structure**: Consistency > personal preference.

---

📂 **Project Structure & Naming**

```bash
servi-clic/
├── features/       # Business domains (kebab-case)
├── app/            # Expo Router (Page-based routing)
├── services/       # Global infrastructure (Supabase, Analytics)
├── store/          # Global slice coordination
├── ui/             # Atomic & design system components
└── utils/          # Pure helper functions
```

**Naming Standards:**
- **Files**: Always `kebab-case.ts` (e.g., `login-form.tsx`).
- **Components**: Always `PascalCase` (e.g., `Button`, `LoginForm`).
- **Hooks**: Always `useCamelCase` (e.g., `useAuth`).

---

📦 **Feature Structure Contract**

Each feature **MUST** follow this structure:

```bash
feature-name/
├── api/          # Feature-specific API calls (RTK Query / Supabase)
├── components/   # Feature-specific UI components
├── hooks/        # Feature-specific business logic (hooks)
├── screens/      # Screen components for this feature
├── services/     # Feature-specific logic services
├── store/        # State management (Redux/Zustand slice)
├── types/        # Feature-specific types & interfaces
└── index.ts      # PUBLIC API of the feature
```

---

📤 **Public API Rule (CRITICAL)**

Each feature exposes a single entry point via `index.ts`. **NEVER** import from sub-directories of another feature.

```typescript
// ✅ Correct
import { LoginForm, useAuth } from "#root/features/auth";

// ❌ Forbidden
import { LoginForm } from "#root/features/auth/components/login-form";
```

**In `index.ts`:**
Only export what is explicitly needed by other features or the app layer.

---

✨ **Premium Design Standards (UI/UX)**

This project aims for a high-end, premium aesthetic ("Wow" factor).

1. **Aesthetics**:
    - Use **NativeBase**
    - Avoid high-contrast browser defaults; use curated HSL-tailored colors.
    - Componentes personalizados o librerías como NativeBase.
2. **Layout**:
    - Use a strict **8px grid system** for margins and padding.
    - Consistency in corner radius (prefer smooth, rounded corners: 12px, 16px, 24px).
3. **Motion**:
    - Implement subtle **micro-animations** (Hover shifts, fade-ins).
    - Use `Moti` or `Reanimated` for smooth UI transitions.

---

🔗 **Cross-Feature Communication**

If Feature A needs data from Feature B:
1. **Pass by Primitive**: Pass required data as props from the Screen/App level.
2. **Shared State**: Promote state to the global `/store` if many features need it (e.g., `currentUser`).
3. **Events**: Use a global event bus for side effects (e.g., `auth:log_out` -> `notifications:clear`).

---

🔌 **Supabase & Database Rules**

1. **Migrations**: All DDL changes (tables, triggers) go in `supabase/migrations/`.
2. **Logic**: Feature-specific queries go in `features/[feature]/api/`.
3. **Client**: Always use the shared client from `services/supabase/client.ts`.
4. **Chat y tracking**: Use the Supabase Realtime client.

---

🤖 **AI Agent Guidelines**

When generating or modifying code:

✅ **ALWAYS**:
- Place code inside the correct feature or create a new one.
- Export everything intended for public use via `index.ts`.
- Use **Absolute Imports** using the `#root/` alias.
- Follow the **Feature-First** Architecture blindly.

⚠️ **BEFORE Creating New Code**:
1. Does this belong to an existing feature (e.g., `auth`, `profile`)?
2. Is this a generic primitive for the `/ui` folder?
3. Have I checked `index.ts` for existing public exports?

---

🧠 **Decision Matrix**

| Scenario | Location |
| :--- | :--- |
| Login validation logic | `features/auth/hooks/use-login.ts` |
| Reusable Premium Button | `/ui/atoms/button.tsx` |
| Supabase Auth config | `services/supabase/config.ts` |
| Business-specific type | `features/[feature]/types/index.ts` |
| Date formatting helper | `/utils/date-formatter.ts` |

---

🧭 **Final Rule**

If a feature cannot be deleted without breaking the app, it is not properly isolated. **Clean, decoupled, and feature-driven.**