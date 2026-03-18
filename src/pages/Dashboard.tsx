import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Dumbbell, UtensilsCrossed, TrendingUp, Flame,
  Calendar, ArrowRight, RefreshCw, Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 },
};

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

interface OnboardingData {
  goals: string[]; fitnessLevel: string; age: string; height: string;
  weight: string; dietaryPreferences: string; restrictions: string;
  injuries: string; frequency: string;
}
interface Exercise { name: string; sets: number; reps: number; }
interface WorkoutDay { day: string; focus: string; exercises: Exercise[]; }
interface Meal { name: string; items: string[]; calories: number; }

export default function Dashboard() {
  const [onboarding, setOnboarding] = useState<OnboardingData | null>(null);
  const [workoutDays, setWorkoutDays] = useState<WorkoutDay[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [regenerating, setRegenerating] = useState(false);

  const loadData = () => {
    try {
      const ob = localStorage.getItem("evowell_onboarding");
      if (ob) setOnboarding(JSON.parse(ob));
      const wp = localStorage.getItem("evowell_workout_plan");
      if (wp) { const parsed = JSON.parse(wp); setWorkoutDays(parsed.days || []); }
      const dp = localStorage.getItem("evowell_diet_plan");
      if (dp) { const parsed = JSON.parse(dp); setMeals(parsed.meals || []); }
    } catch { /* ignore */ }
  };

  useEffect(() => { loadData(); }, []);

  const todayName = dayNames[new Date().getDay()];
  const todayWorkout = workoutDays.find((d) => d.day.toLowerCase() === todayName.toLowerCase());
  const totalCalories = meals.reduce((s, m) => s + (m.calories || 0), 0);
  const exerciseCount = todayWorkout?.exercises?.length || 0;
  const isRestDay = !todayWorkout || todayWorkout.focus?.toLowerCase().includes("rest") || exerciseCount === 0;

  const regeneratePlan = async () => {
    if (!onboarding) { toast.error("No onboarding data. Complete onboarding first."); return; }
    setRegenerating(true);
    try {
      const { data: plan, error } = await supabase.functions.invoke('generate-plan', {
        body: { onboardingData: onboarding },
      });
      if (error) throw new Error(error.message || "Failed to generate plan");
      localStorage.setItem("evowell_workout_plan", JSON.stringify(plan.workout));
      localStorage.setItem("evowell_diet_plan", JSON.stringify(plan.diet));
      loadData();
      toast.success("Your plan has been regenerated!");
    } catch (e: any) {
      toast.error(e.message || "Something went wrong");
    } finally { setRegenerating(false); }
  };

  const weight = onboarding?.weight ? `${onboarding.weight} kg` : "—";

  const stats = [
    { label: "Current Weight", value: weight, icon: TrendingUp, bg: "bg-primary/10", iconColor: "text-primary" },
    { label: "Workout Days", value: `${workoutDays.filter(d => !d.focus?.toLowerCase().includes("rest")).length}/7`, icon: Flame, bg: "bg-warning/10", iconColor: "text-warning" },
    { label: "Today", value: isRestDay ? "Rest Day" : `${exerciseCount} exercises`, icon: Calendar, bg: "bg-info/10", iconColor: "text-info" },
    { label: "Daily Calories", value: totalCalories ? `${totalCalories.toLocaleString()} kcal` : "—", icon: UtensilsCrossed, bg: "bg-success/10", iconColor: "text-success" },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <motion.div {...fadeIn} className="rounded-2xl gradient-hero p-6 border border-primary/10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold md:text-3xl">{getGreeting()} 👋</h1>
            <p className="text-muted-foreground text-sm mt-1">Here's your fitness overview for today</p>
          </div>
          <Button variant="outline" size="sm" onClick={regeneratePlan} disabled={regenerating} className="gap-1.5 rounded-xl">
            {regenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            {regenerating ? "Generating…" : "Regenerate"}
          </Button>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div {...fadeIn} transition={{ delay: 0.05 }} className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + i * 0.05 }}>
            <Card className="border-0 shadow-sm hover-lift rounded-2xl">
              <CardContent className="p-4">
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${stat.bg} mb-2`}>
                  <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
                </div>
                <span className="text-xs text-muted-foreground">{stat.label}</span>
                <p className="font-display text-lg font-semibold mt-0.5">{stat.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Today's Workout */}
      <motion.div {...fadeIn} transition={{ delay: 0.1 }}>
        <Card className="border-0 shadow-sm hover-lift rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="font-display text-lg">Today's Workout</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/workout" className="gap-1 text-primary">View Plan <ArrowRight className="h-3 w-3" /></Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isRestDay ? (
              <p className="text-sm text-muted-foreground">Rest day — recover and stretch! 🧘</p>
            ) : (
              <>
                <div className="mb-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium">{todayWorkout?.focus}</span>
                    <span className="text-muted-foreground">{exerciseCount} exercises</span>
                  </div>
                </div>
                <div className="space-y-2">
                  {todayWorkout?.exercises.slice(0, 4).map((ex) => (
                    <div key={ex.name} className="flex items-center gap-3 rounded-xl bg-secondary/50 px-3 py-2 text-sm">
                      <Dumbbell className="h-4 w-4 text-muted-foreground" />
                      {ex.name} — {ex.sets}×{ex.reps}
                    </div>
                  ))}
                  {exerciseCount > 4 && (
                    <p className="text-xs text-muted-foreground pl-1">+{exerciseCount - 4} more</p>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Today's Meals */}
      <motion.div {...fadeIn} transition={{ delay: 0.15 }}>
        <Card className="border-0 shadow-sm hover-lift rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="font-display text-lg">Today's Meals</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/diet" className="gap-1 text-primary">View Diet <ArrowRight className="h-3 w-3" /></Link>
            </Button>
          </CardHeader>
          <CardContent>
            {meals.length === 0 ? (
              <p className="text-sm text-muted-foreground">No diet plan yet. Complete onboarding or regenerate your plan.</p>
            ) : (
              <div className="space-y-2">
                {meals.map((m) => (
                  <div key={m.name} className="flex items-center justify-between rounded-xl bg-secondary/50 px-3 py-2.5">
                    <div>
                      <div className="text-sm font-medium">{m.name}</div>
                      <div className="text-xs text-muted-foreground">{m.items?.slice(0, 2).join(", ")}</div>
                    </div>
                    <span className="text-xs font-semibold text-primary">{m.calories} kcal</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
