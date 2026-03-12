

# Add Plan Customization (Workout Split + Diet Modifications)

## How It Works Currently
The `generate-plan` edge function sends all onboarding data to Gemini, which returns a full 7-day workout + diet JSON in one shot. The AI decides the workout split automatically. Plans are stored in `localStorage`.

## What We'll Build

### 1. New Edge Function: `modify-plan`
A new backend function that takes the **current plan** + a **user's natural language request** and returns a modified plan. The AI will be instructed to be honest -- if a request is unrealistic (e.g., 150g protein, vegetarian, no soya, no paneer, low budget), it should say so in `proteinNote` rather than faking numbers.

**File: `supabase/functions/modify-plan/index.ts`**
- Accepts: `{ currentPlan, modifyRequest, planType: "workout" | "diet" }`
- Sends to Gemini: "Here is the current plan JSON. The user wants: [request]. Modify accordingly. Return the same JSON structure. If the request makes goals unrealistic, explain honestly in proteinNote/notes."
- Returns modified JSON

### 2. Workout Split Selection in Onboarding
Add `workoutStyle` to onboarding FormData with options:
- "Let AI decide" (default)
- "Push/Pull/Legs"
- "Bro Split" (Chest, Back, Shoulders, Arms, Legs)
- "Upper/Lower"
- "Full Body"
- "Custom" (text input for their own split)

This gets passed to the `generate-plan` prompt so the AI follows the user's preferred split.

**File: `src/pages/Onboarding.tsx`**
- Add workout style step (new step 9, shift Equipment to 10, Schedule to 11 -- total 12 steps)
- Add `workoutStyle` and `customWorkoutStyle` to FormData

### 3. "Customize" Button on Diet & Workout Pages
Both pages get a floating "Customize" button that opens a **Sheet** (bottom drawer) with:
- A textarea for natural language input (e.g., "I can't eat soya or sprouts", "Give me a bro split", "Replace bench press with dumbbell press")
- A "Regenerate" button that calls `modify-plan`
- Loading state while AI processes

**Files: `src/pages/Diet.tsx`, `src/pages/Workout.tsx`**
- Add Sheet with textarea and submit button
- On submit, call `modify-plan` with current plan + user request
- Update localStorage and re-render with new plan

### 4. Update `generate-plan` Prompt
Add workout style instruction to the existing prompt so initial generation respects the user's split preference.

**File: `supabase/functions/generate-plan/index.ts`**
- Read `workoutStyle` from onboarding data
- Add to prompt: "Use a [Bro Split] training split" or "Choose the best split"

### 5. Honesty Rule in AI Prompts
Both `generate-plan` and `modify-plan` will include: "If the user's requirements make hitting macro targets unrealistic (e.g., high protein + vegetarian + no soya + no paneer + low budget), be honest. State in `proteinNote` that the target is difficult/impossible with these constraints and suggest alternatives."

## Technical Details

| Change | File |
|--------|------|
| New edge function | `supabase/functions/modify-plan/index.ts` |
| Add workout style to onboarding | `src/pages/Onboarding.tsx` |
| Add customize sheet to diet | `src/pages/Diet.tsx` |
| Add customize sheet to workout | `src/pages/Workout.tsx` |
| Pass workout style to prompt | `supabase/functions/generate-plan/index.ts` |
| Register new function | `supabase/config.toml` |

