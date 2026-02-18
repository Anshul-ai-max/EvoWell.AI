

# Make EvoWell Feel Like a Real Personal Trainer

## What's Changing

The onboarding questionnaire will be expanded with two new steps to collect **cuisine/culture preference** and **workout environment**, and the AI prompt will use this info to generate truly personalized plans -- Indian meals for Indian users, home-only exercises for people without a gym, etc.

## New Onboarding Steps

The current 5 steps become 7:

**Goals > Level > Body > Diet > Cuisine > Equipment > Schedule**

### Step 5 (NEW): Cuisine / Culture
Question: "What type of cuisine do you prefer?"
Options (select one):
- Indian
- Mediterranean
- East Asian
- Latin American
- Western / American
- Middle Eastern
- African
- Custom (free text input)

### Step 6 (NEW): Workout Environment
Question: "Where will you work out?"
Options (select one):
- Home (no equipment)
- Home (with basic equipment -- dumbbells, bands)
- Gym (full equipment)
- Outdoor (park, running, bodyweight)
- Mixed (combination)

## AI Prompt Improvements

The backend prompt will be updated to:
- Use the cuisine/culture to generate **culturally authentic meals** (e.g., dal, roti, sabzi for Indian; hummus, falafel for Middle Eastern)
- Use the workout environment to **only suggest exercises possible in that setting** (e.g., no barbell squats for "Home - no equipment")
- Add explicit instructions like: "If cuisine is Indian, use traditional Indian dishes with local ingredients. Do NOT use generic Western meals."
- For workout environment: "If Home (no equipment), use only bodyweight exercises. If Gym, use full range of machines and free weights."

## Technical Details

**Files to modify:**

1. **`src/pages/Onboarding.tsx`**
   - Add `cuisine` and `workoutEnvironment` fields to the `FormData` interface
   - Add two new option arrays: `cuisines` and `workoutEnvironments`
   - Update `STEPS` from 5 to 7: `["Goals", "Level", "Body", "Diet", "Cuisine", "Equipment", "Schedule"]`
   - Add two new step renders (step 4 for Cuisine, step 5 for Equipment), shift Schedule to step 6
   - Update `canProceed()` validation for the new steps
   - The cuisine step will have predefined buttons plus a text input for "Other"

2. **`supabase/functions/generate-plan/index.ts`**
   - Add `onboardingData.cuisine` and `onboardingData.workoutEnvironment` to the user prompt
   - Update the system prompt with new critical rules:
     - "Use ONLY dishes and ingredients authentic to the user's cuisine culture"
     - "ONLY suggest exercises that can be performed in the user's workout environment"
   - Add environment-specific exercise constraints (e.g., bodyweight-only list for home with no equipment)

**No database changes needed.**

## Result

After these changes, an Indian vegetarian user working out at home will get:
- **Meals**: Poha, dal-chawal, paneer tikka, chole, idli-sambhar -- not oatmeal and salmon
- **Workouts**: Push-ups, squats, planks, lunges -- not bench press and cable rows

