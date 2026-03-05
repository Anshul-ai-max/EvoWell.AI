import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { UtensilsCrossed, Info, Pill } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Meal {
  name: string;
  time: string;
  items: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface DietPlan {
  meals: Meal[];
  proteinNote?: string;
  supplementSuggestions?: string[];
  dailyTarget?: number;
}

export default function Diet() {
  const [plan, setPlan] = useState<DietPlan>({ meals: [] });

  useEffect(() => {
    const raw = localStorage.getItem("evowell_diet_plan");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setPlan({
          meals: parsed.meals || [],
          proteinNote: parsed.proteinNote,
          supplementSuggestions: parsed.supplementSuggestions,
          dailyTarget: parsed.dailyTarget,
        });
      } catch { /* ignore */ }
    }
  }, []);

  const { meals, proteinNote, supplementSuggestions } = plan;

  const totalCal = meals.reduce((s, m) => s + m.calories, 0);
  const totalP = meals.reduce((s, m) => s + m.protein, 0);
  const totalC = meals.reduce((s, m) => s + m.carbs, 0);
  const totalF = meals.reduce((s, m) => s + m.fat, 0);

  if (meals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <UtensilsCrossed className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="font-display text-xl font-semibold mb-1">No diet plan yet</h2>
        <p className="text-sm text-muted-foreground">Complete onboarding to generate your plan.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold">Diet Plan</h1>
        <p className="text-sm text-muted-foreground mt-1">Your personalized daily meals</p>
      </motion.div>

      {proteinNote && (
        <Card className="border-0 shadow-sm bg-accent/50">
          <CardContent className="p-4 flex gap-3 items-start">
            <Info className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <div className="font-medium text-sm mb-0.5">Protein Strategy</div>
              <p className="text-sm text-muted-foreground">{proteinNote}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {supplementSuggestions && supplementSuggestions.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-base flex items-center gap-2">
              <Pill className="h-4 w-4 text-primary" />
              Suggested Supplements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5">
              {supplementSuggestions.map((s, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-4 gap-3 text-center">
            {[
              { label: "Calories", value: `${totalCal}`, unit: "kcal" },
              { label: "Protein", value: `${totalP}`, unit: "g" },
              { label: "Carbs", value: `${totalC}`, unit: "g" },
              { label: "Fat", value: `${totalF}`, unit: "g" },
            ].map((m) => (
              <div key={m.label}>
                <div className="font-display text-lg font-semibold text-foreground">{m.value}</div>
                <div className="text-xs text-muted-foreground">
                  {m.unit} {m.label.toLowerCase()}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {meals.map((meal) => (
          <Card key={meal.name} className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="font-display text-base">{meal.name}</CardTitle>
                <span className="text-xs text-muted-foreground">{meal.time}</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1.5 mb-3">
                {meal.items.map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm">
                    <UtensilsCrossed className="h-3 w-3 text-muted-foreground" />
                    {item}
                  </div>
                ))}
              </div>
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>{meal.calories} kcal</span>
                <span>P: {meal.protein}g</span>
                <span>C: {meal.carbs}g</span>
                <span>F: {meal.fat}g</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
