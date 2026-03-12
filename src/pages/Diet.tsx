import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UtensilsCrossed, Info, Pill, Sunrise, Sun, Moon, Cookie, ChevronDown, Flame, Beef, Wheat, Droplets, Pencil, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { toast } from "sonner";

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

const mealIconMap: Record<string, typeof Sunrise> = {
  breakfast: Sunrise,
  lunch: Sun,
  dinner: Moon,
  snack: Cookie,
  "pre-workout": Flame,
  "post-workout": Beef,
};

function getMealIcon(name: string) {
  const lower = name.toLowerCase();
  for (const key of Object.keys(mealIconMap)) {
    if (lower.includes(key)) return mealIconMap[key];
  }
  return UtensilsCrossed;
}

function CalorieRing({ current, target }: { current: number; target: number }) {
  const size = 140;
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(current / target, 1);
  const offset = circumference * (1 - progress);

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--secondary))"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <motion.span
          className="font-display text-2xl font-bold text-foreground"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {current}
        </motion.span>
        <span className="text-xs text-muted-foreground">/ {target} kcal</span>
      </div>
    </div>
  );
}

function MacroBar({ label, value, max, color, icon: Icon, delay }: {
  label: string; value: number; max: number; color: string;
  icon: typeof Beef; delay: number;
}) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <motion.div
      className="flex items-center gap-3"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${color}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1">
        <div className="flex justify-between text-xs mb-1">
          <span className="font-medium text-foreground">{label}</span>
          <span className="text-muted-foreground">{value}g</span>
        </div>
        <div className="h-2 rounded-full bg-secondary overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${color.replace("bg-", "bg-").replace("/10", "")}`}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ delay: delay + 0.2, duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>
    </motion.div>
  );
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.1 + i * 0.08, duration: 0.4, ease: "easeOut" as const },
  }),
};

export default function Diet() {
  const [plan, setPlan] = useState<DietPlan>({ meals: [] });
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null);
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [customizeText, setCustomizeText] = useState("");
  const [customizing, setCustomizing] = useState(false);

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

  const handleCustomize = async () => {
    if (!customizeText.trim()) return;
    setCustomizing(true);
    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/modify-plan`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ currentPlan: plan, modifyRequest: customizeText, planType: "diet" }),
        }
      );
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || "Failed to modify plan");
      }
      const newPlan = await resp.json();
      setPlan({
        meals: newPlan.meals || [],
        proteinNote: newPlan.proteinNote,
        supplementSuggestions: newPlan.supplementSuggestions,
        dailyTarget: newPlan.dailyTarget,
      });
      localStorage.setItem("evowell_diet_plan", JSON.stringify(newPlan));
      toast.success("Diet plan updated!");
      setCustomizeOpen(false);
      setCustomizeText("");
    } catch (e: any) {
      toast.error(e.message || "Something went wrong");
    } finally {
      setCustomizing(false);
    }
  };

  const { meals, proteinNote, supplementSuggestions, dailyTarget } = plan;

  const totalCal = meals.reduce((s, m) => s + m.calories, 0);
  const totalP = meals.reduce((s, m) => s + m.protein, 0);
  const totalC = meals.reduce((s, m) => s + m.carbs, 0);
  const totalF = meals.reduce((s, m) => s + m.fat, 0);

  if (meals.length === 0) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center py-20 text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="h-20 w-20 rounded-2xl bg-secondary flex items-center justify-center mb-5">
          <UtensilsCrossed className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="font-display text-xl font-semibold mb-1">No diet plan yet</h2>
        <p className="text-sm text-muted-foreground">Complete onboarding to generate your plan.</p>
      </motion.div>
    );
  }

  const target = dailyTarget || totalCal;

  return (
    <div className="space-y-6 pb-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold">Diet Plan</h1>
        <p className="text-sm text-muted-foreground mt-1">Your personalized daily meals</p>
      </motion.div>

      {/* Protein Note */}
      {proteinNote && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-0 shadow-sm overflow-hidden">
            <div className="flex">
              <div className="w-1 bg-primary shrink-0" />
              <CardContent className="p-4 flex gap-3 items-start bg-accent/30">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Info className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="font-display font-semibold text-sm mb-0.5">Protein Strategy</div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{proteinNote}</p>
                </div>
              </CardContent>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Supplements as pill badges */}
      {supplementSuggestions && supplementSuggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Pill className="h-4 w-4 text-primary" />
                </div>
                <span className="font-display font-semibold text-sm">Suggested Supplements</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {supplementSuggestions.map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 + i * 0.05 }}
                  >
                    <Badge variant="secondary" className="px-3 py-1.5 text-xs font-medium">
                      {s}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Calorie Ring + Macros */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex flex-col items-center gap-5">
              <CalorieRing current={totalCal} target={target} />
              {dailyTarget && (
                <div className="w-full">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                    <span>Daily Progress</span>
                    <span>{Math.round((totalCal / dailyTarget) * 100)}%</span>
                  </div>
                  <Progress value={Math.min((totalCal / dailyTarget) * 100, 100)} className="h-2" />
                </div>
              )}
              <div className="w-full space-y-3">
                <MacroBar label="Protein" value={totalP} max={totalP + 20} color="bg-success/10 text-success" icon={Beef} delay={0.4} />
                <MacroBar label="Carbs" value={totalC} max={totalC + 20} color="bg-info/10 text-info" icon={Wheat} delay={0.5} />
                <MacroBar label="Fat" value={totalF} max={totalF + 20} color="bg-warning/10 text-warning" icon={Droplets} delay={0.6} />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Meal Cards */}
      <div className="space-y-3">
        {meals.map((meal, i) => {
          const MealIcon = getMealIcon(meal.name);
          const isExpanded = expandedMeal === meal.name;

          return (
            <motion.div
              key={meal.name}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
            >
              <Card
                className="border-0 shadow-sm cursor-pointer overflow-hidden transition-shadow hover:shadow-md"
                onClick={() => setExpandedMeal(isExpanded ? null : meal.name)}
              >
                <CardContent className="p-0">
                  {/* Header row */}
                  <div className="flex items-center gap-3 p-4">
                    <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center shrink-0">
                      <MealIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-display font-semibold text-sm">{meal.name}</div>
                      <div className="text-xs text-muted-foreground">{meal.time}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-display font-semibold text-sm">{meal.calories}</div>
                      <div className="text-xs text-muted-foreground">kcal</div>
                    </div>
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </motion.div>
                  </div>

                  {/* Expandable content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 border-t border-border">
                          <div className="pt-3 space-y-2">
                            {meal.items.map((item, idx) => (
                              <motion.div
                                key={item}
                                className="flex items-start gap-2.5 text-sm"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.04 }}
                              >
                                <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                <span className="text-foreground">{item}</span>
                              </motion.div>
                            ))}
                          </div>
                          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border">
                            <Badge className="bg-success/10 text-success border-0 text-xs">
                              P: {meal.protein}g
                            </Badge>
                            <Badge className="bg-info/10 text-info border-0 text-xs">
                              C: {meal.carbs}g
                            </Badge>
                            <Badge className="bg-warning/10 text-warning border-0 text-xs">
                              F: {meal.fat}g
                            </Badge>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Floating Customize Button */}
      <motion.div
        className="fixed bottom-24 right-4 z-40"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: "spring" }}
      >
        <Button
          size="lg"
          className="rounded-full shadow-lg gap-2 px-5"
          onClick={() => setCustomizeOpen(true)}
        >
          <Pencil className="h-4 w-4" />
          Customize
        </Button>
      </motion.div>

      {/* Customize Sheet */}
      <Sheet open={customizeOpen} onOpenChange={setCustomizeOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader>
            <SheetTitle className="font-display">Customize Your Diet</SheetTitle>
            <SheetDescription>
              Describe what you want to change — e.g. "I can't eat soya or sprouts", "Add more protein-rich snacks", "Make it budget-friendly"
            </SheetDescription>
          </SheetHeader>
          <div className="mt-4 space-y-4">
            <Textarea
              placeholder="e.g. Replace paneer with tofu, I'm lactose intolerant, add more variety..."
              value={customizeText}
              onChange={(e) => setCustomizeText(e.target.value)}
              className="min-h-[100px]"
            />
            <Button
              onClick={handleCustomize}
              disabled={!customizeText.trim() || customizing}
              className="w-full gap-2"
            >
              {customizing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Regenerating…
                </>
              ) : (
                <>
                  <Pencil className="h-4 w-4" />
                  Apply Changes
                </>
              )}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
