

## Visual Refresh Plan — EvoWell Fitness App

### Overview
Elevate the entire app with a modern color scheme, richer visual hierarchy, glassmorphism cards, subtle gradient accents, improved mobile bottom navigation, micro-interactions, and polished typography spacing.

### Changes

**1. Color System & CSS Variables (`src/index.css`)**
- Shift primary from neutral gray-purple to a vibrant emerald-green gradient palette (matching the design system memory)
- Add CSS custom properties for gradient backgrounds, glass card effects, and subtle backdrop-blur
- Add smooth page transition keyframes and a subtle shimmer animation for loading states
- Improve dark mode with deeper contrasts and richer accent colors

**2. Mobile Bottom Tab Bar (`src/components/layout/AppLayout.tsx`)**
- Replace the hamburger dropdown menu with a fixed bottom tab bar (5 icons: Dashboard, Workout, Diet, Progress, Profile)
- Add active indicator pill with spring animation under the selected tab
- Move the AI chat FAB above the tab bar
- Add glassmorphism effect (backdrop-blur + semi-transparent background) to both mobile header and bottom nav
- Desktop sidebar gets subtle hover animations and an active state indicator bar

**3. Dashboard (`src/pages/Dashboard.tsx`)**
- Add a gradient hero banner at the top with a greeting and motivational quote
- Stat cards get colored icon backgrounds with soft gradients instead of plain icons
- Add subtle hover lift effect on all cards
- Time-aware greeting (Good morning/afternoon/evening)
- Refactor regenerate call to use `supabase.functions.invoke` (consistency fix)

**4. Workout Page (`src/pages/Workout.tsx`)**
- Day selector pills get a gradient active state with a subtle glow
- Exercise cards get a left-colored border accent based on completion
- Add a confetti-like particle burst animation when all exercises are completed
- Improved progress bar with gradient fill

**5. Diet Page (`src/pages/Diet.tsx`)**
- Calorie ring gets a gradient stroke instead of flat color
- Meal cards get subtle colored left borders matching meal type (breakfast=warm, lunch=bright, dinner=cool)
- Macro bars get gradient fills
- Better visual hierarchy for expanded meal items

**6. Progress Page (`src/pages/ProgressTracking.tsx`)**
- Add summary stat cards at the top (starting weight, current weight, change)
- Charts get gradient area fills under the lines
- Improved tab styling with pill-style active indicator

**7. Profile Page (`src/pages/Profile.tsx`)**
- User avatar gets a gradient ring border
- Settings items get icon backgrounds with colored circles
- Add subtle dividers and better spacing

**8. Onboarding (`src/pages/Onboarding.tsx`)**
- Add a subtle gradient background
- Selection cards get a more prominent selected state with gradient border
- Progress bar gets gradient fill
- Step labels hidden on mobile (too cramped with 11 steps), show only progress bar

**9. Chat Page (`src/pages/Chat.tsx`)**
- User message bubbles get a gradient background
- Add typing indicator animation (bouncing dots instead of "Thinking...")
- Better message spacing and rounded corners

**10. Global Polish**
- All cards: increase border-radius to `rounded-2xl`, add subtle shadow transitions on hover
- Buttons: primary buttons get gradient backgrounds
- Add `scroll-smooth` to html
- Clean up unused font imports (keep only Inter, Space Grotesk, DM Sans)

### Files to modify
- `src/index.css` — color system, animations, global styles
- `src/components/layout/AppLayout.tsx` — bottom tab bar, glassmorphism header
- `src/pages/Dashboard.tsx` — hero banner, stat cards, greeting
- `src/pages/Workout.tsx` — day selector, completion animation
- `src/pages/Diet.tsx` — gradient ring, meal card accents
- `src/pages/ProgressTracking.tsx` — summary cards, chart gradients
- `src/pages/Profile.tsx` — avatar ring, settings polish
- `src/pages/Onboarding.tsx` — gradient bg, mobile step labels
- `src/pages/Chat.tsx` — typing dots, gradient bubbles
- `src/components/ui/button.tsx` — optional: gradient variant
- `src/components/ui/progress.tsx` — gradient fill support

