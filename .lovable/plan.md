# Fix Diet Calorie Accuracy

## Problems

1. **Wrong AI model**: `google/gemini-2.5-flash-lite` is the cheapest/fastest model but weakest at reasoning. Nutritional calculations require math and reasoning — it needs a smarter model.
2. **No calorie target in prompt**: The prompt never tells the AI what the user's daily calorie target should be. It doesn't calculate TDEE or adjust for goals (deficit for weight loss, surplus for muscle gain). The AI is just inventing numbers.

## Solution

### 1. Upgrade model to `google/gemini-3-flash-preview`

Better reasoning while still being fast. Good balance of speed and accuracy.

### 2. Add TDEE calculation in the edge function

Before calling the AI, calculate an approximate daily calorie target using the Mifflin-St Jeor equation based on the user's age, height, weight, and goals. Pass this target to the AI so it distributes calories realistically across meals.

### 3. Add explicit calorie instructions to the prompt

Tell the AI: "The user's daily calorie target is X kcal. Distribute this across all meals. Each meal's calories must be realistic and the total must sum to approximately X."

## Technical Details

**File: `supabase/functions/generate-plan/index.ts**`

- Add a TDEE calculator function using Mifflin-St Jeor (assumes moderate activity):
  - Male: `10 * weight + 6.25 * height - 5 * age + 5`
  - Female: `10 * weight + 6.25 * height - 5 * age - 161`
  - (Since we don't collect gender, use an average formula)
  - Adjust: -500 kcal for weight loss, +300 for muscle gain, 0 for maintenance
- Pass the calculated target in the user prompt
- Add to system prompt: "Total daily calories across all meals MUST sum to approximately the target provided. Each meal's macros must be realistic portion sizes."
- Change model from `google/gemini-2.5-flash-lite` to `google/gemini-3-flash-preview`
- `Add questions like male or female.`

**No other files need changes.**