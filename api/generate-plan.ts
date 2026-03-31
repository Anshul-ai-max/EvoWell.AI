// Simple Vercel serverless function: /api/generate-plan
// Returns a sample workout + diet plan and ignores any AI providers for now.

export default async function handler(req: any, res: any) {
  if (!req.method || req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = req.body ?? {};

  // In a real implementation you would validate `body` and
  // generate the plan from the onboarding data. For now we
  // return a static but realistic sample plan.
  const samplePlan = {
    workout: {
      days: [
        {
          day: "Monday",
          focus: "Upper Body - Push",
          exercises: [
            { name: "Push-ups", sets: 4, reps: 10, rest: "90s", tips: "Keep your core tight and elbows at ~45°." },
            { name: "Dumbbell Shoulder Press", sets: 3, reps: 12, rest: "90s", tips: "Do not arch your lower back." },
          ],
        },
        {
          day: "Tuesday",
          focus: "Lower Body",
          exercises: [
            { name: "Bodyweight Squats", sets: 4, reps: 15, rest: "90s", tips: "Sit back into your hips and keep heels down." },
            { name: "Glute Bridges", sets: 3, reps: 15, rest: "75s", tips: "Pause for 1–2 seconds at the top." },
          ],
        },
        {
          day: "Wednesday",
          focus: "Rest Day",
          exercises: [],
        },
        {
          day: "Thursday",
          focus: "Upper Body - Pull",
          exercises: [
            { name: "Doorway Rows", sets: 4, reps: 12, rest: "90s", tips: "Squeeze your shoulder blades together at the top." },
            { name: "Bicep Curls (Dumbbells or Bands)", sets: 3, reps: 15, rest: "75s", tips: "Control the lowering phase for 2–3 seconds." },
          ],
        },
        {
          day: "Friday",
          focus: "Full Body",
          exercises: [
            { name: "Goblet Squats", sets: 3, reps: 12, rest: "90s", tips: "Keep the weight close to your chest." },
            { name: "Incline Push-ups", sets: 3, reps: 12, rest: "90s", tips: "Use a bench or table if the floor is too hard." },
          ],
        },
        {
          day: "Saturday",
          focus: "Cardio & Core",
          exercises: [
            { name: "Brisk Walk", sets: 1, reps: 20, rest: "—", tips: "Aim for 20–30 minutes at a conversational pace." },
            { name: "Plank", sets: 3, reps: 30, rest: "60s", tips: "Maintain a straight line from head to heels." },
          ],
        },
        {
          day: "Sunday",
          focus: "Rest Day",
          exercises: [],
        },
      ],
    },
    diet: {
      dailyTarget: 2200,
      proteinNote:
        "This sample plan targets ~140g of protein using a mix of whole foods. Adjust portions based on hunger and progress.",
      supplementSuggestions: [
        "Whey or plant-based protein powder (optional, 1 scoop after workouts)",
        "Creatine monohydrate 3–5g daily (if no contraindications)",
      ],
      meals: [
        {
          name: "Breakfast",
          time: "7:30 AM",
          items: ["2 whole eggs + 3 egg whites omelette", "2 slices wholegrain toast", "1 small apple"],
          calories: 500,
          protein: 35,
          carbs: 45,
          fat: 18,
        },
        {
          name: "Mid-morning Snack",
          time: "10:30 AM",
          items: ["200g Greek yogurt", "30g mixed nuts"],
          calories: 350,
          protein: 25,
          carbs: 20,
          fat: 18,
        },
        {
          name: "Lunch",
          time: "1:30 PM",
          items: ["150g grilled chicken breast", "150g cooked rice", "Mixed salad with olive oil dressing"],
          calories: 650,
          protein: 45,
          carbs: 60,
          fat: 20,
        },
        {
          name: "Pre-workout Snack",
          time: "5:00 PM",
          items: ["1 banana", "1 tbsp peanut butter"],
          calories: 250,
          protein: 6,
          carbs: 32,
          fat: 10,
        },
        {
          name: "Dinner",
          time: "8:00 PM",
          items: ["150g paneer or tofu stir-fry", "150g cooked quinoa", "Steamed vegetables"],
          calories: 500,
          protein: 35,
          carbs: 45,
          fat: 16,
        },
      ],
    },
    // Pass the original payload back for debugging / future logic if needed.
    meta: {
      received: body,
    },
  };

  return res.status(200).json(samplePlan);
}

