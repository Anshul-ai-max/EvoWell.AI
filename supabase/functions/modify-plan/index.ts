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
    const { currentPlan, modifyRequest, planType } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    if (!currentPlan || !modifyRequest || !planType) {
      return new Response(
        JSON.stringify({ error: "Missing currentPlan, modifyRequest, or planType" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = planType === "diet"
      ? `You are an expert certified nutritionist. The user has an existing daily diet plan (JSON). They want to modify it.

CRITICAL RULES:
- Modify the plan according to the user's request while keeping the same JSON structure.
- Total calories across all meals MUST still sum to approximately the dailyTarget (within ±100 kcal).
- Every food item MUST include specific portion sizes in grams/ml.
- Each meal's macro breakdown must be realistic (protein×4 + carbs×4 + fat×9 ≈ listed calories).
- Strictly respect dietary preferences (vegetarian = NO meat/chicken/fish/eggs).
- If the user's modification makes hitting macro targets UNREALISTIC (e.g., 150g protein + vegetarian + no soya + no paneer + low budget), be HONEST. Update the "proteinNote" field to explain why the target is difficult or impossible with these constraints. Suggest alternatives. Do NOT fake numbers.
- Keep the same JSON structure with: dailyTarget, proteinNote, supplementSuggestions, meals[{name, time, items, calories, protein, carbs, fat}].

Return ONLY valid JSON, no markdown.`
      : `You are an expert personal trainer. The user has an existing weekly workout plan (JSON). They want to modify it.

CRITICAL RULES:
- Modify the plan according to the user's request while keeping the same JSON structure.
- Include 7 workout days (rest days with "Rest Day" focus and empty exercises array).
- Each exercise must have: name, sets, reps, rest, tips.
- NEVER suggest equipment the user doesn't have access to.
- If the user requests a specific split (Bro Split, PPL, Upper/Lower, Full Body), restructure the 7-day plan accordingly.
- If the modification is unrealistic for their level or equipment, explain honestly in a "note" field at the top level.
- Keep the same JSON structure with: days[{day, focus, exercises[{name, sets, reps, rest, tips}]}].

Return ONLY valid JSON, no markdown.`;

    const userPrompt = `Here is the current ${planType} plan:
${JSON.stringify(currentPlan, null, 2)}

The user wants this modification: "${modifyRequest}"

Apply the modification and return the updated plan in the exact same JSON format. If the request is unrealistic, explain why honestly in the proteinNote (for diet) or add a "note" field (for workout).`;

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
      throw new Error("Failed to parse modified plan");
    }

    return new Response(JSON.stringify(plan), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("modify-plan error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
