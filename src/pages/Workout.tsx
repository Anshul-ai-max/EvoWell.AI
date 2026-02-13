import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Dumbbell, Check, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const dayShort = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface Exercise {
  name: string;
  sets: number;
  reps: number;
  rest: string;
  tips: string;
}

interface WorkoutDay {
  day: string;
  focus: string;
  exercises: Exercise[];
}

interface ExerciseState extends Exercise {
  id: string;
  completed: boolean;
}

export default function Workout() {
  const [plan, setPlan] = useState<WorkoutDay[]>([]);
  const [selectedDay, setSelectedDay] = useState(0);
  const [exercises, setExercises] = useState<ExerciseState[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("evowell_workout_plan");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        const days: WorkoutDay[] = parsed.days || [];
        setPlan(days);
        // Set today's day as selected
        const todayIndex = new Date().getDay();
        const mapped = todayIndex === 0 ? 6 : todayIndex - 1;
        setSelectedDay(Math.min(mapped, days.length - 1));
      } catch { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    if (plan.length === 0) return;
    const day = plan[selectedDay];
    if (!day) return;
    setExercises(
      (day.exercises || []).map((ex, i) => ({
        ...ex,
        id: `${selectedDay}-${i}`,
        completed: false,
      }))
    );
    setExpandedId(null);
  }, [selectedDay, plan]);

  const toggleComplete = (id: string) => {
    setExercises((prev) =>
      prev.map((ex) => (ex.id === id ? { ...ex, completed: !ex.completed } : ex))
    );
  };

  const completedCount = exercises.filter((e) => e.completed).length;
  const currentDay = plan[selectedDay];

  if (plan.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Dumbbell className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="font-display text-xl font-semibold mb-1">No workout plan yet</h2>
        <p className="text-sm text-muted-foreground">Complete onboarding to generate your plan.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold">Workout Plan</h1>
        <p className="text-sm text-muted-foreground mt-1">{currentDay?.focus || "Rest Day"}</p>
      </motion.div>

      {/* Day selector */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {plan.map((d, i) => (
          <button
            key={d.day}
            onClick={() => setSelectedDay(i)}
            className={cn(
              "flex h-12 min-w-[3rem] shrink-0 flex-col items-center justify-center rounded-xl text-xs font-medium transition-colors",
              i === selectedDay
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:bg-secondary/80"
            )}
          >
            {dayShort[dayNames.indexOf(d.day)] || d.day.slice(0, 3)}
          </button>
        ))}
      </div>

      {exercises.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6 text-center text-muted-foreground text-sm">
            Rest day — recover and stretch! 🧘
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="text-sm text-muted-foreground">
            {completedCount}/{exercises.length} exercises completed
          </div>

          <div className="space-y-3">
            {exercises.map((ex) => (
              <Card key={ex.id} className={cn("border-0 shadow-sm transition-colors", ex.completed && "opacity-60")}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleComplete(ex.id)}
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 transition-colors",
                        ex.completed
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:border-primary/40"
                      )}
                    >
                      {ex.completed && <Check className="h-4 w-4" />}
                    </button>
                    <div className="flex-1">
                      <div className={cn("font-medium text-sm", ex.completed && "line-through")}>{ex.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {ex.sets}×{ex.reps} · <Clock className="inline h-3 w-3" /> {ex.rest} rest
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setExpandedId(expandedId === ex.id ? null : ex.id)}
                    >
                      {expandedId === ex.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>
                  {expandedId === ex.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      className="mt-3 rounded-lg bg-accent/50 p-3 text-xs text-muted-foreground"
                    >
                      <div className="flex items-start gap-2">
                        <Dumbbell className="mt-0.5 h-3 w-3 text-primary" />
                        <span>{ex.tips}</span>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
