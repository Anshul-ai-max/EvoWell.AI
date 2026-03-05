

# Add a "Reset & Re-onboard" Option

## The Problem

Once you complete onboarding, the app sets `evowell_onboarded` in localStorage and always redirects you to the Dashboard. There's no way to go back through onboarding to test with different preferences without manually clearing browser data.

## Solution

Add a **"Reset Profile"** button on the **Profile page** that:
1. Clears all EvoWell localStorage keys (`evowell_onboarded`, `evowell_onboarding`, `evowell_workout_plan`, `evowell_diet_plan`)
2. Redirects you back to `/onboarding`

This way you can easily re-test the full flow anytime.

## Technical Details

**File to modify: `src/pages/Profile.tsx`**

- Add a "Reset Profile & Start Over" button (with a confirmation dialog to prevent accidental clicks)
- On confirm: clear all `evowell_*` keys from localStorage and navigate to `/onboarding`
- Style it as a destructive/outline button at the bottom of the profile page

**No other files need changes.**

