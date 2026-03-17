import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dumbbell, Check, Clock, ChevronDown, Zap, Trophy, Target, Pencil, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

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

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.1 + i * 0.07, duration: 0.4, ease: "easeOut" as const },
  }),
};

export default function Workout() {
  const [plan, setPlan] = useState<WorkoutDay[]>([]);
  const [selectedDay, setSelectedDay] = useState(0);
  const [exercises, setExercises] = useState<ExerciseState[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [customizeText, setCustomizeText] = useState("");
  const [customizing, setCustomizing] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("evowell_workout_plan");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        const days: WorkoutDay[] = parsed.days || [];
        setPlan(days);
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

  const handleCustomize = async () => {
    if (!customizeText.trim()) return;
    setCustomizing(true);
    try {
      const currentWorkoutPlan = { days: plan };
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/modify-plan`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ currentPlan: currentWorkoutPlan, modifyRequest: customizeText, planType: "workout" }),
        }
      );
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || "Failed to modify plan");
      }
      const newPlan = await resp.json();
      const newDays: WorkoutDay[] = newPlan.days || [];
      setPlan(newDays);
      localStorage.setItem("evowell_workout_plan", JSON.stringify(newPlan));
      toast.success("Workout plan updated!");
      setCustomizeOpen(false);
      setCustomizeText("");
    } catch (e: any) {
      toast.error(e.message || "Something went wrong");
    } finally {
      setCustomizing(false);
    }
  };

  const completedCount = exercises.filter((e) => e.completed).length;
  const currentDay = plan[selectedDay];
  const progressPct = exercises.length > 0 ? (completedCount / exercises.length) * 100 : 0;

  if (plan.length === 0) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center py-20 text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="h-20 w-20 rounded-2xl bg-secondary flex items-center justify-center mb-5">
          <Dumbbell className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="font-display text-xl font-semibold mb-1">No workout plan yet</h2>
        <p className="text-sm text-muted-foreground">Complete onboarding to generate your plan.</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold">Workout Plan</h1>
        <p className="text-sm text-muted-foreground mt-1">{currentDay?.focus || "Rest Day"}</p>
      </motion.div>

      {/* Day selector */}
      <motion.div
        className="flex gap-2 overflow-x-auto pb-1"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        {plan.map((d, i) => {
          const isActive = i === selectedDay;
          return (
            <motion.button
              key={d.day}
              onClick={() => setSelectedDay(i)}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "flex h-14 min-w-[3.5rem] shrink-0 flex-col items-center justify-center rounded-xl text-xs font-medium transition-all",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-secondary text-muted-foreground hover:bg-accent"
              )}
            >
              <span className="text-[10px] opacity-70">
                {dayShort[dayNames.indexOf(d.day)] || d.day.slice(0, 3)}
              </span>
              <span className="font-semibold">
                {d.focus?.split(" ")[0]?.slice(0, 4) || "Rest"}
              </span>
            </motion.button>
          );
        })}
      </motion.div>

      {exercises.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-8 text-center">
              <div className="h-16 w-16 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🧘</span>
              </div>
              <p className="text-sm text-muted-foreground">Rest day — recover and stretch!</p>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <>
          {/* Progress card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-0 shadow-sm overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {progressPct === 100 ? (
                      <Trophy className="h-5 w-5 text-warning" />
                    ) : (
                      <Target className="h-5 w-5 text-primary" />
                    )}
                    <span className="font-display font-semibold text-sm">
                      {progressPct === 100 ? "Workout Complete! 🎉" : "Today's Progress"}
                    </span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {completedCount}/{exercises.length}
                  </Badge>
                </div>
                <Progress value={progressPct} className="h-2.5" />
              </CardContent>
            </Card>
          </motion.div>

          {/* Exercise cards */}
          <div className="space-y-3">
            {exercises.map((ex, i) => {
              const isExpanded = expandedId === ex.id;
              return (
                <motion.div
                  key={ex.id}
                  custom={i}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <Card
                    className={cn(
                      "border-0 shadow-sm transition-all overflow-hidden",
                      ex.completed && "opacity-60",
                      !ex.completed && "hover:shadow-md"
                    )}
                  >
                    <CardContent className="p-0">
                      <div className="flex items-center gap-3 p-4">
                        {/* Checkbox */}
                        <motion.button
                          onClick={(e) => { e.stopPropagation(); toggleComplete(ex.id); }}
                          whileTap={{ scale: 0.85 }}
                          className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 transition-all",
                            ex.completed
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border hover:border-primary/40"
                          )}
                        >
                          <AnimatePresence>
                            {ex.completed && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                              >
                                <Check className="h-4 w-4" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.button>

                        {/* Info */}
                        <div
                          className="flex-1 min-w-0 cursor-pointer"
                          onClick={() => setExpandedId(isExpanded ? null : ex.id)}
                        >
                          <div className={cn("font-medium text-sm", ex.completed && "line-through")}>
                            {ex.name}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
                              <Zap className="h-3 w-3 mr-0.5" />
                              {ex.sets}×{ex.reps}
                            </Badge>
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
                              <Clock className="h-3 w-3 mr-0.5" />
                              {ex.rest}
                            </Badge>
                          </div>
                        </div>

                        {/* Expand */}
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : ex.id)}
                          className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-accent transition-colors"
                        >
                          <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          </motion.div>
                        </button>
                      </div>

                      {/* Tips expandable */}
                      <AnimatePresence>
                        {isExpanded && ex.tips && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="mx-4 mb-4 rounded-xl bg-accent/50 p-3">
                              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                                <Dumbbell className="mt-0.5 h-3.5 w-3.5 text-primary shrink-0" />
                                <span className="leading-relaxed">{ex.tips}</span>
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
        </>
      )}

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
            <SheetTitle className="font-display">Customize Your Workout</SheetTitle>
            <SheetDescription>
              Describe what you want — e.g. "Give me a bro split", "Replace bench press with dumbbell press", "Add more core exercises"
            </SheetDescription>
          </SheetHeader>
          <div className="mt-4 space-y-4">
            <Textarea
              placeholder="e.g. Switch to upper/lower split, add more compound movements, reduce rest times..."
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
