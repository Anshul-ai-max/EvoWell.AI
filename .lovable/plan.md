

# Fix: Make Plans Actually Display & Add Regeneration

## The Problem
Two issues are causing "false information":
1. **Old cached plans in localStorage** from before the prompt was improved -- you need to re-run onboarding to get new plans
2. **The Dashboard page shows hardcoded sample data** -- it doesn't read from localStorage at all, so even after regeneration it shows fake stats

## What Will Change

### 1. Dashboard reads real data from localStorage
- Show your actual weight from onboarding data
- Show today's workout from the AI-generated plan (matching the current day of the week)
- Show today's calories from the AI-generated diet plan
- Remove all hardcoded placeholder values

### 2. Add a "Regenerate Plan" button
- Add a button on the Dashboard so you can regenerate your workout and diet plans without redoing the full onboarding
- This calls the same AI backend with your saved onboarding preferences

### 3. Auto-redirect returning users
- If you've already completed onboarding (`evowell_onboarded` flag in localStorage), skip onboarding and go straight to dashboard
- If not onboarded, redirect to onboarding

### 4. Clear old cache on new generation
- Each time a new plan is generated, the old cached plan is fully replaced

## Technical Details

**Files to modify:**
- `src/pages/Dashboard.tsx` -- read workout/diet/onboarding data from localStorage, display real values for today's workout, meals, weight, and calories
- `src/App.tsx` -- add logic to check `evowell_onboarded` flag and redirect accordingly (skip onboarding if already done)
- `src/pages/Dashboard.tsx` -- add a "Regenerate Plan" button that calls the `generate-plan` edge function with saved onboarding data

**No backend changes needed** -- the edge function prompt is already updated and deployed.

## Steps to Verify After Implementation
1. Navigate to `/onboarding`, fill in your details with "Vegetarian" diet
2. Submit and wait for the AI to generate your plan
3. Confirm the Dashboard shows your real weight, today's workout, and today's meals
4. Check the Workout and Diet pages for correct vegetarian-only content
5. Use the "Regenerate Plan" button to get a fresh plan without redoing onboarding
