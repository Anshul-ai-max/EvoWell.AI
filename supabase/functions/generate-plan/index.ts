import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

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

    const systemPrompt = `You are an expert personal trainer and certified nutritionist. Generate a personalized weekly workout plan AND daily diet plan based on the user's profile.

CRITICAL RULES:
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
- "Home (no equipment)" or "home_none": Use ONLY bodyweight exercises — push-ups, squats, lunges, planks, burpees, mountain climbers, jumping jacks, glute bridges, wall sits, crunches, leg raises, etc. Absolutely NO barbells, dumbbells, cables, or machines.
- "Home (basic equipment)" or "home_basic": Use bodyweight exercises plus dumbbells, resistance bands, pull-up bar, and kettlebells only. No machines or cable systems.
- "Gym (full equipment)" or "gym": Use the full range — barbells, dumbbells, machines, cables, benches, racks, etc.
- "Outdoor" or "outdoor": Use running, sprints, park bench exercises, bodyweight circuits, hill sprints, etc. No gym equipment.
- "Mixed" or "mixed": Combine home, gym, and outdoor exercises across the week.
- NEVER suggest equipment the user doesn't have access to.

- Tailor exercises to the user's fitness level — beginners get simpler movements with lower volume.
- Account for any injuries or limitations by avoiding exercises that stress those areas.
- Make calorie and macro targets realistic for the user's age, weight, height, and goals.

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
Include 7 workout days (rest days included with focus "Rest Day" and empty exercises array). Include 5-6 meals per day. Every meal item must comply with the dietary preferences AND cuisine culture.`;

    const dietLabel = onboardingData.dietaryPreferences || "No specific preference";
    const restrictionsLabel = onboardingData.restrictions || "None";
    const injuriesLabel = onboardingData.injuries || "None";

    const cuisineLabel = onboardingData.cuisine === "custom"
      ? (onboardingData.customCuisine || "No specific preference")
      : (onboardingData.cuisine || "No specific preference");
    const environmentLabel = onboardingData.workoutEnvironment || "No specific preference";

    const userPrompt = `Create a complete weekly plan for this person:
- Goals: ${goals}
- Fitness Level: ${onboardingData.fitnessLevel}
- Age: ${onboardingData.age}, Height: ${onboardingData.height}cm, Weight: ${onboardingData.weight}kg
- Workout Frequency: ${onboardingData.frequency} days/week
- DIETARY PREFERENCE (MUST FOLLOW STRICTLY): ${dietLabel}
- FOOD ALLERGIES/RESTRICTIONS (MUST FOLLOW STRICTLY): ${restrictionsLabel}
- CUISINE/CULTURE (MUST USE AUTHENTIC DISHES FROM THIS CULTURE): ${cuisineLabel}
- WORKOUT ENVIRONMENT (ONLY USE EXERCISES POSSIBLE HERE): ${environmentLabel}
- Injuries/Limitations (avoid exercises affecting these): ${injuriesLabel}

IMPORTANT: Every single meal item MUST comply with "${dietLabel}" diet AND use authentic "${cuisineLabel}" cuisine dishes. Every exercise MUST be doable in "${environmentLabel}" environment. Double-check that no restricted foods appear and no unavailable equipment is used.`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
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

    // Parse JSON from the response, stripping markdown fences if present
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
