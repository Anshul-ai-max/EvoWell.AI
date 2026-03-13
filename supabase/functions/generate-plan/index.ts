import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function calculateTDEE(gender: string, weight: number, height: number, age: number, goals: string[]): number {
  let bmr: number;
  if (gender === "female") {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  }
  let tdee = Math.round(bmr * 1.55);
  if (goals.includes("lose_weight")) {
    tdee -= 500;
  } else if (goals.includes("build_muscle")) {
    tdee += 300;
  }
  return Math.max(1200, Math.min(4500, tdee));
}

function buildSystemPrompt(
  dailyCalories: number,
  proteinGrams: number,
  carbGrams: number,
  fatGrams: number,
  budget: string,
  supplementWillingness: string,
  isHighProteinVeg: boolean
): string {
  const budgetRules: Record<string, string> = {
    budget: "BUDGET RULE: Use only affordable, locally available ingredients. No imported/premium items, protein bars, or expensive supplements. Prefer lentils, beans, eggs, seasonal vegetables, basic grains.",
    moderate: "BUDGET RULE: Balance cost and nutrition. Some premium ingredients are fine but avoid consistently expensive items.",
    no_limit: "BUDGET RULE: No cost constraints. Use the best quality ingredients available.",
  };

  const supplementRules: Record<string, string> = {
    none: "SUPPLEMENT RULE: Do NOT include any supplements, protein powders, or shakes. All protein must come from whole foods only. If the protein target is very high, use high-protein food combinations (lentils+rice, paneer, tofu, chickpeas, soy chunks, nuts, seeds, Greek yogurt) and note the strategy in proteinNote.",
    basic: "SUPPLEMENT RULE: You may include 1-2 protein shakes/scoops per day (whey or plant-based) to bridge protein gaps. Keep other nutrition from whole foods.",
    open: "SUPPLEMENT RULE: You may freely include protein powder, creatine, BCAAs, or other supplements as needed. Include specific supplement recommendations in supplementSuggestions array.",
  };

  let highProteinVegNote = "";
  if (isHighProteinVeg) {
    highProteinVegNote = `
HIGH-PROTEIN VEGETARIAN ALERT: This user needs ${proteinGrams}g protein on a vegetarian/vegan diet. This is challenging from food alone. 
- If supplements are allowed, include 1-2 protein shakes to bridge the gap.
- If NO supplements, use protein-dense combos: soy chunks (52g protein/100g), paneer (18g/100g), Greek yogurt (10g/100g), lentils (9g/100g cooked), chickpeas (9g/100g), tofu (8g/100g), peanut butter, seeds.
- Be honest in proteinNote if hitting the exact target from food alone is unrealistic without very large portions.`;
  }

  return `You are an expert personal trainer and certified nutritionist. Generate a personalized weekly workout plan AND daily diet plan based on the user's profile.

CRITICAL CALORIE RULES:
- The user's DAILY CALORIE TARGET is ${dailyCalories} kcal (Mifflin-St Jeor).
- Target macros: ~${proteinGrams}g protein, ~${carbGrams}g carbs, ~${fatGrams}g fat per day.
- The total calories across ALL meals MUST sum to approximately ${dailyCalories} kcal (within ±50 kcal).
- Each meal's calories must be realistic for the portion sizes listed.
- Every meal must have realistic, accurate macro breakdowns (protein×4 + carbs×4 + fat×9 ≈ listed calories).

REALISM RULES (CRITICAL):
- Every food item MUST include specific portion sizes in grams or ml (e.g., "200g paneer tikka" not just "paneer tikka", "250ml milk" not just "milk").
- Each meal must be a realistic portion a person can eat in one sitting. No meal should exceed 800 kcal unless it's the main lunch/dinner.
- Use commonly available ingredients that a real person would cook or buy.

${budgetRules[budget] || budgetRules.moderate}

${supplementRules[supplementWillingness] || supplementRules.none}
${highProteinVegNote}

CRITICAL DIETARY RULES:
- Strictly follow dietary preferences. "Vegetarian"/"Veg" = NO meat, chicken, fish, eggs. Use plant-based proteins only.
- "Vegan" = exclude ALL animal products including dairy/honey.
- "Keto" = keep carbs under 30g/day.
- Respect ALL food allergies without exception.

CUISINE/CULTURE RULES (CRITICAL):
- Generate meals authentic to the user's preferred cuisine/culture.
- Indian → poha, upma, idli, dosa, dal-chawal, roti-sabzi, paneer dishes, chole, rajma, paratha, khichdi, etc.
- Mediterranean → hummus, falafel, tabbouleh, grilled fish, olive oil dishes, pita, Greek salad, etc.
- East Asian → miso soup, stir-fry, rice bowls, tofu dishes, noodles, congee, etc.
- Latin American → beans and rice, tacos, empanadas, ceviche, plantains, etc.
- Every meal must feel authentic. No generic substitutions.

WORKOUT ENVIRONMENT RULES:
- "home_none": ONLY bodyweight exercises.
- "home_basic": Bodyweight + dumbbells, bands, pull-up bar, kettlebells.
- "gym": Full range — barbells, machines, cables, benches, racks.
- "outdoor": Running, park exercises, bodyweight circuits.
- "mixed": Combine all.
- NEVER suggest equipment the user doesn't have.

Return ONLY valid JSON with this exact structure, no markdown:
{
  "workout": {
    "days": [
      {
        "day": "Monday",
        "focus": "Upper Body - Push",
        "exercises": [
          { "name": "Push-ups", "sets": 4, "reps": 10, "rest": "90s", "tips": "Keep core tight." }
        ]
      }
    ]
  },
  "diet": {
    "dailyTarget": ${dailyCalories},
    "proteinNote": "Brief explanation of protein strategy and whether target is achievable",
    "supplementSuggestions": ["List of recommended supplements if user is open to them, empty array if not"],
    "meals": [
      {
        "name": "Breakfast",
        "time": "7:30 AM",
        "items": ["200g Poha with 30g peanuts", "250ml Chai with milk"],
        "calories": 350,
        "protein": 12,
        "carbs": 55,
        "fat": 8
      }
    ]
  }
}
Include 7 workout days (rest days with "Rest Day" focus and empty exercises). Include 5-6 meals/day. Total meal calories MUST equal ~${dailyCalories} kcal. Every item must have portion sizes in grams/ml.`;
}

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const { onboardingData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const goalLabels: Record<string, string> = {
      lose_weight: "Lose Weight",
      build_muscle: "Build Muscle",
      improve_endurance: "Improve Endurance",
      stay_healthy: "Stay Healthy",
      flexibility: "Flexibility & Mobility",
      athletic: "Athletic Performance",
    };
    const goals = onboardingData.goals
      .map((g: string) => goalLabels[g] || g)
      .join(", ");

    const weight = parseFloat(onboardingData.weight) || 70;
    const height = parseFloat(onboardingData.height) || 170;
    const age = parseInt(onboardingData.age) || 25;
    const gender = onboardingData.gender || "male";
    const dailyCalories = calculateTDEE(gender, weight, height, age, onboardingData.goals);

    const proteinGrams = Math.round(weight * (onboardingData.goals.includes("build_muscle") ? 2.0 : 1.6));
    const fatCalories = Math.round(dailyCalories * 0.25);
    const fatGrams = Math.round(fatCalories / 9);
    const proteinCalories = proteinGrams * 4;
    const carbGrams = Math.round((dailyCalories - proteinCalories - fatCalories) / 4);

    const budget = onboardingData.budget || "moderate";
    const supplementWillingness = onboardingData.supplementWillingness || "none";
    const currentSupplements = onboardingData.currentSupplements || "";
    const dietPref = (onboardingData.dietaryPreferences || "").toLowerCase();
    const isHighProteinVeg = proteinGrams > 100 && (dietPref.includes("veg") || dietPref.includes("vegan"));

    const systemPrompt = buildSystemPrompt(
      dailyCalories, proteinGrams, carbGrams, fatGrams,
      budget, supplementWillingness, isHighProteinVeg
    );

    const dietLabel = onboardingData.dietaryPreferences || "No specific preference";
    const restrictionsLabel = onboardingData.restrictions || "None";
    const injuriesLabel = onboardingData.injuries || "None";
    const cuisineLabel = onboardingData.cuisine === "custom"
      ? (onboardingData.customCuisine || "No specific preference")
      : (onboardingData.cuisine || "No specific preference");
    const environmentLabel = onboardingData.workoutEnvironment || "No specific preference";
    const budgetLabel = { budget: "Budget-friendly", moderate: "Moderate", no_limit: "No constraints" }[budget] || "Moderate";
    const suppLabel = { none: "No supplements", basic: "Basic (protein powder only)", open: "Open to all supplements" }[supplementWillingness] || "None";

    const workoutStyle = onboardingData.workoutStyle || "auto";
    const customWorkoutStyle = onboardingData.customWorkoutStyle || "";
    const workoutStyleLabels: Record<string, string> = {
      auto: "Let AI decide the best split",
      ppl: "Push/Pull/Legs split",
      bro_split: "Bro Split (Chest day, Back day, Shoulders day, Arms day, Legs day)",
      upper_lower: "Upper/Lower split",
      full_body: "Full Body each session",
      custom: customWorkoutStyle || "Custom split",
    };
    const workoutStyleLabel = workoutStyleLabels[workoutStyle] || "Let AI decide";

    const userPrompt = `Create a complete weekly plan for this person:
- Gender: ${gender}
- Goals: ${goals}
- Fitness Level: ${onboardingData.fitnessLevel}
- Age: ${age}, Height: ${height}cm, Weight: ${weight}kg
- DAILY CALORIE TARGET: ${dailyCalories} kcal (MUST be followed exactly)
- TARGET MACROS: ${proteinGrams}g protein, ${carbGrams}g carbs, ${fatGrams}g fat
- Workout Frequency: ${onboardingData.frequency} days/week
- WORKOUT SPLIT PREFERENCE: ${workoutStyleLabel}
- DIETARY PREFERENCE (MUST FOLLOW STRICTLY): ${dietLabel}
- FOOD ALLERGIES/RESTRICTIONS: ${restrictionsLabel}
- CUISINE/CULTURE: ${cuisineLabel}
- WORKOUT ENVIRONMENT: ${environmentLabel}
- BUDGET: ${budgetLabel}
- SUPPLEMENT WILLINGNESS: ${suppLabel}
- CURRENT SUPPLEMENTS: ${currentSupplements || "None"}
- Injuries/Limitations: ${injuriesLabel}

IMPORTANT: Total calories across all meals MUST sum to ~${dailyCalories} kcal. Every food item must include portion sizes in grams/ml. Meals must be realistic and achievable.
${workoutStyle !== "auto" ? `IMPORTANT: You MUST use the "${workoutStyleLabel}" training structure. Do NOT use a different split.` : ""}`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limited, please try again shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    let plan;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      plan = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse AI-generated plan");
    }

    return new Response(JSON.stringify(plan), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-plan error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
