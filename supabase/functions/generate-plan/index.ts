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

    const systemPrompt = `You are an expert personal trainer and nutritionist. Generate a personalized weekly workout plan AND daily diet plan based on the user's profile. Return ONLY valid JSON with this exact structure, no markdown:
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
Include 5-7 workout days (rest days included with no exercises). Include 4-6 meals per day. Make the plan specific to the user's goals and level.`;

    const userPrompt = `Create a plan for:
- Goals: ${goals}
- Fitness Level: ${onboardingData.fitnessLevel}
- Age: ${onboardingData.age}, Height: ${onboardingData.height}cm, Weight: ${onboardingData.weight}kg
- Workout Frequency: ${onboardingData.frequency} days/week
- Dietary Preferences: ${onboardingData.dietaryPreferences || "No preference"}
- Restrictions: ${onboardingData.restrictions || "None"}
- Injuries/Limitations: ${onboardingData.injuries || "None"}`;

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
