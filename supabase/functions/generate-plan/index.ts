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
            "name": "Bench Press",
            "sets": 4,
            "reps": 10,
            "rest": "90s",
            "tips": "Keep shoulder blades retracted."
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
        "items": ["Oatmeal with blueberries", "Protein shake"],
        "calories": 450,
        "protein": 35,
        "carbs": 55,
        "fat": 10
      }
    ]
  }
}
Include 7 workout days (rest days included with focus "Rest Day" and empty exercises array). Include 5-6 meals per day. Every meal item must comply with the dietary preferences.`;

    const dietLabel = onboardingData.dietaryPreferences || "No specific preference";
    const restrictionsLabel = onboardingData.restrictions || "None";
    const injuriesLabel = onboardingData.injuries || "None";

    const userPrompt = `Create a complete weekly plan for this person:
- Goals: ${goals}
- Fitness Level: ${onboardingData.fitnessLevel}
- Age: ${onboardingData.age}, Height: ${onboardingData.height}cm, Weight: ${onboardingData.weight}kg
- Workout Frequency: ${onboardingData.frequency} days/week
- DIETARY PREFERENCE (MUST FOLLOW STRICTLY): ${dietLabel}
- FOOD ALLERGIES/RESTRICTIONS (MUST FOLLOW STRICTLY): ${restrictionsLabel}
- Injuries/Limitations (avoid exercises affecting these): ${injuriesLabel}

IMPORTANT: Every single meal item MUST comply with "${dietLabel}" diet. Double-check that no restricted foods appear.`;

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
