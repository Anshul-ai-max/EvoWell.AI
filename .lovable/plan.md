

# Make Diet Plans Realistic & Actionable

## The Problem
The current system calculates protein targets (e.g., 120-150g for a 75kg person building muscle) but doesn't consider whether that's achievable with the user's diet type. A vegetarian hitting 150g protein from food alone requires very deliberate planning, large portions, or supplement support. The AI just fills in numbers without thinking about real-world feasibility.

## Solution

### 1. Add two new onboarding steps: Budget & Supplements

**New step: Monthly Budget** (after Cuisine, before Equipment)
- Options: "Budget-friendly", "Moderate", "No budget constraints"
- This lets the AI avoid suggesting expensive items (like imported protein bars, exotic foods) for budget-conscious users

**New step: Supplement Willingness** (after Budget, before Equipment)
- Options: "No supplements", "Basic (whey/plant protein only)", "Open to supplements"
- Optional text field: "Supplements you already use"
- This is critical: if someone needs 150g protein on a veg diet and refuses supplements, the AI must plan around high-protein foods with realistic portions. If they're open to whey/plant protein, the AI can include a shake to bridge the gap.

### 2. Update the edge function prompt for realism

**Add to the system prompt:**
- Budget context so AI picks affordable ingredients
- Supplement awareness: if user is open to protein powder, include 1-2 scoops/day to bridge protein gaps; if not, use high-protein whole foods and acknowledge realistic portions
- "REALISM RULE": Every meal must specify portion sizes (e.g., "200g paneer" not just "paneer"). The AI must ensure a person can physically eat the planned amount in one sitting.
- If protein target is impossible from food alone without supplements, the AI should note this in a `proteinNote` field

### 3. Add `proteinNote` and `budget` to diet output

Update the JSON schema to include:
- `proteinNote`: string explaining protein strategy (e.g., "Includes 1 scoop whey post-workout to meet target" or "High-protein lentil/paneer focused plan")
- `supplementSuggestions`: array of recommended supplements if user is open to them

## Technical Details

**File: `src/pages/Onboarding.tsx`**
- Add `budget` and `supplementWillingness` and `currentSupplements` to FormData
- Add budget options array and supplement options array
- Update STEPS to 10 steps: `["Goals", "Level", "Gender", "Body", "Diet", "Cuisine", "Budget", "Supplements", "Equipment", "Schedule"]`
- Add two new step renders (step 6 = Budget, step 7 = Supplements)
- Shift Equipment to step 8, Schedule to step 9
- Update `canProceed()` validation for the new steps

**File: `supabase/functions/generate-plan/index.ts`**
- Read `budget`, `supplementWillingness`, `currentSupplements` from onboarding data
- Add budget and supplement rules to the system prompt
- Add realism rules requiring portion sizes in grams
- Add `proteinNote` and `supplementSuggestions` to the expected JSON output schema
- If protein target > 100g and diet is vegetarian/vegan and no supplements, add special instruction to use high-protein plant combos

**File: `src/pages/Diet.tsx`**
- Display `proteinNote` if present (info card at top)
- Display `supplementSuggestions` if present (separate section)
- Show portion sizes in meal items (already supported if AI includes them in item strings)

