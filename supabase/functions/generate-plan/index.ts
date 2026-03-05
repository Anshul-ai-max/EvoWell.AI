import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function calculateTDEE(gender: string, weight: number, height: number, age: number, goals: string[]): number {
  // Mifflin-St Jeor equation
  let bmr: number;
  if (gender === "female") {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  }

  // Assume moderate activity (1.55 multiplier)
  let tdee = Math.round(bmr * 1.55);

  // Adjust based on goals
  if (goals.includes("lose_weight")) {
    tdee -= 500;
  } else if (goals.includes("build_muscle")) {
    tdee += 300;
  }

  // Clamp to reasonable range
  return Math.max(1200, Math.min(4500, tdee));
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

    // Calculate macro targets
    const proteinGrams = Math.round(weight * (onboardingData.goals.includes("build_muscle") ? 2.0 : 1.6));
    const fatCalories = Math.round(dailyCalories * 0.25);
    const fatGrams = Math.round(fatCalories / 9);
    const proteinCalories = proteinGrams * 4;
    const carbGrams = Math.round((dailyCalories - proteinCalories - fatCalories) / 4);

    const systemPrompt = `You are an expert personal trainer and certified nutritionist. Generate a personalized weekly workout plan AND daily diet plan based on the user's profile.

CRITICAL CALORIE RULES:
- The user's DAILY CALORIE TARGET is ${dailyCalories} kcal. This is calculated using the Mifflin-St Jeor equation.
- Target macros: ~${proteinGrams}g protein, ~${carbGrams}g carbs, ~${fatGrams}g fat per day.
- The total calories across ALL meals MUST sum to approximately ${dailyCalories} kcal (within ±50 kcal).
- Each meal's calories must be realistic for the portion sizes listed. Do NOT inflate or deflate numbers.
- Every meal must have realistic, accurate macro breakdowns that add up correctly (protein×4 + carbs×4 + fat×9 ≈ listed calories).

CRITICAL DIETARY RULES:
- You MUST strictly follow the user's dietary preferences. If they say "Vegetarian" or "Veg", absolutely NO meat, chicken, fish, eggs, or any non-vegetarian items. Use only plant-based proteins like paneer, tofu, lentils, chickpeas, soy, nuts, seeds, dairy (milk, yogurt, cheese).
- If they say "Vegan", exclude ALL animal products including dairy and honey.
- If they say "Keto", keep carbs under 30g per day.
- Respect ALL food allergies and restrictions without exception.

CUISINE/CULTURE RULES (CRITICAL):
- You MUST generate meals that are authentic to the user's preferred cuisine/culture.
- If cuisine is "Indian", use traditional Indian dishes: poha, upma, idli, dosa, dal-chawal, roti-sabzi, paneer dishes, chole, rajma, paratha, khichdi, raita, lassi, etc. Do NOT use generic Western meals like oatmeal, grilled chicken salad, or protein shakes.
- If cuisine is "Mediterranean", use dishes like hummus, falafel, tabbouleh, grilled fish, olive oil based dishes, pita, Greek salad, etc.
- If cuisine is "East Asian", use dishes like miso soup, stir-fry, rice bowls, tofu dishes, noodles, congee, etc.
- If cuisine is "Latin American", use dishes like beans and rice, tacos, empanadas, ceviche, plantains, etc.
- If cuisine is "Middle Eastern", use dishes like shawarma, kebab, hummus, falafel, fattoush, labneh, etc.
- If cuisine is "African", use dishes like jollof rice, injera, stews, fufu, groundnut soup, etc.
- Every single meal must feel authentic to the chosen cuisine. No generic substitutions.

WORKOUT ENVIRONMENT RULES (CRITICAL):
- "Home (no equipment)" or "home_none": Use ONLY bodyweight exercises. Absolutely NO barbells, dumbbells, cables, or machines.
- "Home (basic equipment)" or "home_basic": Use bodyweight exercises plus dumbbells, resistance bands, pull-up bar, and kettlebells only.
- "Gym (full equipment)" or "gym": Use the full range — barbells, dumbbells, machines, cables, benches, racks, etc.
- "Outdoor" or "outdoor": Use running, sprints, park bench exercises, bodyweight circuits, hill sprints, etc.
- "Mixed" or "mixed": Combine home, gym, and outdoor exercises across the week.
- NEVER suggest equipment the user doesn't have access to.

- Tailor exercises to the user's fitness level.
- Account for any injuries or limitations.

Return ONLY valid JSON with this exact structure, no markdown:
{
  "workout": {
    "days": [
      {
        "day": "Monday",
        "focus": "Upper Body - Push",
        "exercises": [
          {
            "name": "Push-ups",
            "sets": 4,
            "reps": 10,
            "rest": "90s",
            "tips": "Keep core tight throughout."
          }
        ]
      }
    ]
  },
  "diet": {
    "dailyTarget": ${dailyCalories},
    "meals": [
      {
        "name": "Breakfast",
        "time": "7:30 AM",
        "items": ["Poha with peanuts", "Chai"],
        "calories": 350,
        "protein": 12,
        "carbs": 55,
        "fat": 8
      }
    ]
  }
}
Include 7 workout days (rest days included with focus "Rest Day" and empty exercises array). Include 5-6 meals per day. The sum of all meal calories MUST equal approximately ${dailyCalories} kcal. Every meal item must comply with the dietary preferences AND cuisine culture.`;

    const dietLabel = onboardingData.dietaryPreferences || "No specific preference";
    const restrictionsLabel = onboardingData.restrictions || "None";
    const injuriesLabel = onboardingData.injuries || "None";

    const cuisineLabel = onboardingData.cuisine === "custom"
      ? (onboardingData.customCuisine || "No specific preference")
      : (onboardingData.cuisine || "No specific preference");
    const environmentLabel = onboardingData.workoutEnvironment || "No specific preference";

    const userPrompt = `Create a complete weekly plan for this person:
- Gender: ${gender}
- Goals: ${goals}
- Fitness Level: ${onboardingData.fitnessLevel}
- Age: ${age}, Height: ${height}cm, Weight: ${weight}kg
- DAILY CALORIE TARGET: ${dailyCalories} kcal (MUST be followed exactly)
- TARGET MACROS: ${proteinGrams}g protein, ${carbGrams}g carbs, ${fatGrams}g fat
- Workout Frequency: ${onboardingData.frequency} days/week
- DIETARY PREFERENCE (MUST FOLLOW STRICTLY): ${dietLabel}
- FOOD ALLERGIES/RESTRICTIONS (MUST FOLLOW STRICTLY): ${restrictionsLabel}
- CUISINE/CULTURE (MUST USE AUTHENTIC DISHES FROM THIS CULTURE): ${cuisineLabel}
- WORKOUT ENVIRONMENT (ONLY USE EXERCISES POSSIBLE HERE): ${environmentLabel}
- Injuries/Limitations: ${injuriesLabel}

IMPORTANT: The total calories across all meals MUST sum to approximately ${dailyCalories} kcal. Each meal's macros must be accurate. Every meal must use authentic "${cuisineLabel}" cuisine and comply with "${dietLabel}" diet.`;

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
