import { useState } from "react";
import { motion } from "framer-motion";
import { Dumbbell, Check, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  rest: string;
  tips: string;
  completed: boolean;
}

const sampleExercises: Exercise[] = [
  { id: "1", name: "Bench Press", sets: 4, reps: 10, rest: "90s", tips: "Keep shoulder blades retracted and maintain a slight arch in your back.", completed: false },
  { id: "2", name: "Overhead Press", sets: 3, reps: 12, rest: "60s", tips: "Brace your core and avoid leaning back excessively.", completed: false },
  { id: "3", name: "Incline Dumbbell Press", sets: 3, reps: 10, rest: "60s", tips: "Set bench to 30-45 degrees. Lower dumbbells to chest level.", completed: false },
  { id: "4", name: "Lateral Raises", sets: 3, reps: 15, rest: "45s", tips: "Lead with your elbows, not your hands. Control the descent.", completed: false },
  { id: "5", name: "Tricep Pushdowns", sets: 3, reps: 12, rest: "45s", tips: "Keep elbows pinned to your sides throughout.", completed: false },
  { id: "6", name: "Face Pulls", sets: 3, reps: 15, rest: "45s", tips: "Pull towards your forehead, externally rotating at the end.", completed: false },
];

export default function Workout() {
  const [selectedDay, setSelectedDay] = useState(0);
  const [exercises, setExercises] = useState(sampleExercises);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleComplete = (id: string) => {
    setExercises((prev) =>
      prev.map((ex) => (ex.id === id ? { ...ex, completed: !ex.completed } : ex))
    );
  };

  const completedCount = exercises.filter((e) => e.completed).length;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold">Workout Plan</h1>
        <p className="text-sm text-muted-foreground mt-1">Upper Body — Push Day</p>
      </motion.div>

      {/* Day selector */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {days.map((day, i) => (
          <button
            key={day}
            onClick={() => setSelectedDay(i)}
            className={cn(
              "flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl text-xs font-medium transition-colors",
              i === selectedDay
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:bg-secondary/80"
            )}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Progress */}
      <div className="text-sm text-muted-foreground">
        {completedCount}/{exercises.length} exercises completed
      </div>

      {/* Exercises */}
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
    </div>
  );
}
