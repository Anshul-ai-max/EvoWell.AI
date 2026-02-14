

# Fix Dashboard to Show Real Data and Add Plan Regeneration

## The Problem

The Dashboard page (`src/pages/Dashboard.tsx`) is **100% hardcoded placeholder data**. It shows fake weight ("75 kg"), fake meals ("Grilled chicken", "Salmon"), and fake workout exercises regardless of what you entered during onboarding. The Workout and Diet pages already read from localStorage correctly -- only the Dashboard is broken.

## Changes

### 1. Rewrite Dashboard to read real data from localStorage

The Dashboard will pull from three localStorage keys:
- `evowell_onboarding` -- your profile (weight, goals, etc.)
- `evowell_workout_plan` -- AI-generated workout (7 days)
- `evowell_diet_plan` -- AI-generated diet (meals list)

It will:
- Show your **actual weight** from onboarding data
- Show **today's workout** by matching the current day of the week to the workout plan
- Show **today's meals** from the diet plan with real calorie totals
- Replace all hardcoded values

### 2. Add a "Regenerate Plan" button

A button on the Dashboard that:
- Calls the same AI backend function with your saved onboarding preferences
- Shows a loading spinner while generating
- Replaces old plans in localStorage with the fresh ones
- No need to redo the onboarding questionnaire

### 3. Auto-redirect returning users

Update the root route in `src/App.tsx`:
- If `evowell_onboarded` is set in localStorage, redirect `/` to `/dashboard` instead of `/onboarding`
- If not onboarded, continue redirecting to `/onboarding`

## Technical Details

**Files to modify:**

1. **`src/pages/Dashboard.tsx`** (major rewrite)
   - Add `useState` and `useEffect` to load onboarding data, workout plan, and diet plan from localStorage
   - Determine today's day index to pick the correct workout day
   - Calculate total daily calories from the diet plan
   - Add a `regeneratePlan()` function that calls the edge function and updates localStorage
   - Show empty/fallback state if no plan exists yet

2. **`src/App.tsx`** (small change)
   - Replace the hardcoded `<Navigate to="/onboarding">` with a small component that checks `localStorage.getItem("evowell_onboarded")` and redirects accordingly

**No backend changes needed** -- the edge function is already deployed and working correctly.

## After Implementation

1. Clear your browser's localStorage (or go through onboarding again)
2. Fill in onboarding with your real preferences (e.g., "Vegetarian")
3. The Dashboard will now show your actual weight, today's real workout, and real meals
4. Use "Regenerate Plan" anytime to get a fresh plan without redoing onboarding
