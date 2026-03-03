import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Dumbbell, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const goals = [
  { id: "lose_weight", label: "Lose Weight", emoji: "🔥" },
  { id: "build_muscle", label: "Build Muscle", emoji: "💪" },
  { id: "improve_endurance", label: "Improve Endurance", emoji: "🏃" },
  { id: "stay_healthy", label: "Stay Healthy", emoji: "❤️" },
  { id: "flexibility", label: "Flexibility & Mobility", emoji: "🧘" },
  { id: "athletic", label: "Athletic Performance", emoji: "⚡" },
];

const fitnessLevels = [
  { id: "beginner", label: "Beginner", desc: "New to working out or returning after a long break" },
  { id: "intermediate", label: "Intermediate", desc: "Been training regularly for 6+ months" },
  { id: "advanced", label: "Advanced", desc: "Consistent training for 2+ years" },
];

const cuisines = [
  { id: "indian", label: "Indian", emoji: "🇮🇳" },
  { id: "mediterranean", label: "Mediterranean", emoji: "🫒" },
  { id: "east_asian", label: "East Asian", emoji: "🥢" },
  { id: "latin_american", label: "Latin American", emoji: "🌮" },
  { id: "western", label: "Western / American", emoji: "🍔" },
  { id: "middle_eastern", label: "Middle Eastern", emoji: "🧆" },
  { id: "african", label: "African", emoji: "🍲" },
  { id: "custom", label: "Custom", emoji: "✏️" },
];

const workoutEnvironments = [
  { id: "home_none", label: "Home (no equipment)", desc: "Bodyweight exercises only" },
  { id: "home_basic", label: "Home (basic equipment)", desc: "Dumbbells, resistance bands, pull-up bar" },
  { id: "gym", label: "Gym (full equipment)", desc: "Full range of machines and free weights" },
  { id: "outdoor", label: "Outdoor", desc: "Park, running, bodyweight exercises" },
  { id: "mixed", label: "Mixed", desc: "Combination of home, gym, and outdoor" },
];

const frequencies = [
  { id: "2-3", label: "2–3 days/week" },
  { id: "3-4", label: "3–4 days/week" },
  { id: "4-5", label: "4–5 days/week" },
  { id: "5-6", label: "5–6 days/week" },
  { id: "daily", label: "Every day" },
];

const STEPS = ["Goals", "Level", "Body", "Diet", "Cuisine", "Equipment", "Schedule"];

interface FormData {
  goals: string[];
  fitnessLevel: string;
  age: string;
  height: string;
  weight: string;
  dietaryPreferences: string;
  restrictions: string;
  injuries: string;
  cuisine: string;
  customCuisine: string;
  workoutEnvironment: string;
  frequency: string;
}

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    goals: [],
    fitnessLevel: "",
    age: "",
    height: "",
    weight: "",
    dietaryPreferences: "",
    restrictions: "",
    injuries: "",
    cuisine: "",
    customCuisine: "",
    workoutEnvironment: "",
    frequency: "",
  });

  const progress = ((step + 1) / STEPS.length) * 100;

  const toggleGoal = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      goals: prev.goals.includes(id)
        ? prev.goals.filter((g) => g !== id)
        : [...prev.goals, id],
    }));
  };

  const canProceed = () => {
    switch (step) {
      case 0: return formData.goals.length > 0;
      case 1: return !!formData.fitnessLevel;
      case 2: return !!formData.age && !!formData.height && !!formData.weight;
      case 3: return !!formData.dietaryPreferences.trim();
      case 4: return !!formData.cuisine && (formData.cuisine !== "custom" || !!formData.customCuisine);
      case 5: return !!formData.workoutEnvironment;
      case 6: return !!formData.frequency;
      default: return false;
    }
  };

  const [generating, setGenerating] = useState(false);

  const handleSubmit = async () => {
    localStorage.setItem("evowell_onboarding", JSON.stringify(formData));
    setGenerating(true);
    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-plan`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ onboardingData: formData }),
        }
      );
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || "Failed to generate plan");
      }
      const plan = await resp.json();
      localStorage.setItem("evowell_workout_plan", JSON.stringify(plan.workout));
      localStorage.setItem("evowell_diet_plan", JSON.stringify(plan.diet));
      localStorage.setItem("evowell_onboarded", "true");
      navigate("/dashboard");
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Something went wrong generating your plan");
    } finally {
      setGenerating(false);
    }
  };

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir < 0 ? 80 : -80, opacity: 0 }),
  };

  const [direction, setDirection] = useState(1);

  const goNext = () => {
    if (step === STEPS.length - 1) {
      handleSubmit();
    } else {
      setDirection(1);
      setStep((s) => s + 1);
    }
  };

  const goBack = () => {
    setDirection(-1);
    setStep((s) => s - 1);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-8">
      <div className="mb-8 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
          <Dumbbell className="h-5 w-5 text-primary-foreground" />
        </div>
        <h1 className="font-display text-2xl font-bold text-foreground">EvoWell AI</h1>
      </div>

      <div className="w-full max-w-lg">
        {/* Step indicators */}
        <div className="mb-2 flex items-center justify-between px-1">
          {STEPS.map((label, i) => (
            <span
              key={label}
              className={cn(
                "text-xs font-medium",
                i <= step ? "text-primary" : "text-muted-foreground"
              )}
            >
              {label}
            </span>
          ))}
        </div>
        <Progress value={progress} className="mb-8 h-1.5" />

        <Card className="border-0 shadow-md">
          <CardContent className="p-6 md:p-8">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                {step === 0 && (
                  <div>
                    <h2 className="font-display text-xl font-semibold mb-1">What are your fitness goals?</h2>
                    <p className="text-sm text-muted-foreground mb-6">Select all that apply</p>
                    <div className="grid grid-cols-2 gap-3">
                      {goals.map((goal) => {
                        const selected = formData.goals.includes(goal.id);
                        return (
                          <button
                            key={goal.id}
                            onClick={() => toggleGoal(goal.id)}
                            className={cn(
                              "flex items-center gap-3 rounded-xl border-2 p-4 text-left text-sm font-medium transition-all",
                              selected
                                ? "border-primary bg-accent text-accent-foreground"
                                : "border-border bg-card hover:border-primary/40"
                            )}
                          >
                            <span className="text-lg">{goal.emoji}</span>
                            <span>{goal.label}</span>
                            {selected && <Check className="ml-auto h-4 w-4 text-primary" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div>
                    <h2 className="font-display text-xl font-semibold mb-1">What's your fitness level?</h2>
                    <p className="text-sm text-muted-foreground mb-6">This helps us tailor your plan</p>
                    <div className="flex flex-col gap-3">
                      {fitnessLevels.map((level) => {
                        const selected = formData.fitnessLevel === level.id;
                        return (
                          <button
                            key={level.id}
                            onClick={() => setFormData((p) => ({ ...p, fitnessLevel: level.id }))}
                            className={cn(
                              "rounded-xl border-2 p-4 text-left transition-all",
                              selected
                                ? "border-primary bg-accent"
                                : "border-border bg-card hover:border-primary/40"
                            )}
                          >
                            <div className="font-medium text-sm">{level.label}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">{level.desc}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div>
                    <h2 className="font-display text-xl font-semibold mb-1">Tell us about yourself</h2>
                    <p className="text-sm text-muted-foreground mb-6">Used to calculate your plan</p>
                    <div className="flex flex-col gap-4">
                      <div>
                        <Label htmlFor="age">Age</Label>
                        <Input
                          id="age"
                          type="number"
                          placeholder="e.g. 28"
                          value={formData.age}
                          onChange={(e) => setFormData((p) => ({ ...p, age: e.target.value }))}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="height">Height (cm)</Label>
                          <Input
                            id="height"
                            type="number"
                            placeholder="e.g. 175"
                            value={formData.height}
                            onChange={(e) => setFormData((p) => ({ ...p, height: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="weight">Weight (kg)</Label>
                          <Input
                            id="weight"
                            type="number"
                            placeholder="e.g. 75"
                            value={formData.weight}
                            onChange={(e) => setFormData((p) => ({ ...p, weight: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="injuries">Injuries or limitations (optional)</Label>
                        <Textarea
                          id="injuries"
                          placeholder="e.g. Lower back pain, knee surgery in 2023..."
                          value={formData.injuries}
                          onChange={(e) => setFormData((p) => ({ ...p, injuries: e.target.value }))}
                          className="min-h-[60px]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div>
                    <h2 className="font-display text-xl font-semibold mb-1">Dietary preferences</h2>
                    <p className="text-sm text-muted-foreground mb-6">Required — helps personalize your diet plan</p>
                    <div className="flex flex-col gap-4">
                      <div>
                        <Label htmlFor="dietPref">Diet type</Label>
                        <Input
                          id="dietPref"
                          placeholder="e.g. Vegetarian, Keto, No preference..."
                          value={formData.dietaryPreferences}
                          onChange={(e) => setFormData((p) => ({ ...p, dietaryPreferences: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="restrictions">Food allergies or restrictions</Label>
                        <Textarea
                          id="restrictions"
                          placeholder="e.g. Lactose intolerant, no shellfish..."
                          value={formData.restrictions}
                          onChange={(e) => setFormData((p) => ({ ...p, restrictions: e.target.value }))}
                          className="min-h-[60px]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div>
                    <h2 className="font-display text-xl font-semibold mb-1">What type of cuisine do you prefer?</h2>
                    <p className="text-sm text-muted-foreground mb-6">We'll use authentic dishes from your culture</p>
                    <div className="grid grid-cols-2 gap-3">
                      {cuisines.map((c) => {
                        const selected = formData.cuisine === c.id;
                        return (
                          <button
                            key={c.id}
                            onClick={() => setFormData((p) => ({ ...p, cuisine: c.id }))}
                            className={cn(
                              "flex items-center gap-3 rounded-xl border-2 p-4 text-left text-sm font-medium transition-all",
                              selected
                                ? "border-primary bg-accent text-accent-foreground"
                                : "border-border bg-card hover:border-primary/40"
                            )}
                          >
                            <span className="text-lg">{c.emoji}</span>
                            <span>{c.label}</span>
                            {selected && <Check className="ml-auto h-4 w-4 text-primary" />}
                          </button>
                        );
                      })}
                    </div>
                    {formData.cuisine === "custom" && (
                      <div className="mt-4">
                        <Label htmlFor="customCuisine">Describe your preferred cuisine</Label>
                        <Input
                          id="customCuisine"
                          placeholder="e.g. South Indian, Japanese, Nigerian..."
                          value={formData.customCuisine}
                          onChange={(e) => setFormData((p) => ({ ...p, customCuisine: e.target.value }))}
                        />
                      </div>
                    )}
                  </div>
                )}

                {step === 5 && (
                  <div>
                    <h2 className="font-display text-xl font-semibold mb-1">Where will you work out?</h2>
                    <p className="text-sm text-muted-foreground mb-6">We'll only suggest exercises you can actually do</p>
                    <div className="flex flex-col gap-3">
                      {workoutEnvironments.map((env) => {
                        const selected = formData.workoutEnvironment === env.id;
                        return (
                          <button
                            key={env.id}
                            onClick={() => setFormData((p) => ({ ...p, workoutEnvironment: env.id }))}
                            className={cn(
                              "rounded-xl border-2 p-4 text-left transition-all",
                              selected
                                ? "border-primary bg-accent"
                                : "border-border bg-card hover:border-primary/40"
                            )}
                          >
                            <div className="font-medium text-sm">{env.label}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">{env.desc}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {step === 6 && (
                  <div>
                    <h2 className="font-display text-xl font-semibold mb-1">How often can you work out?</h2>
                    <p className="text-sm text-muted-foreground mb-6">We'll build your schedule around this</p>
                    <div className="flex flex-col gap-3">
                      {frequencies.map((f) => {
                        const selected = formData.frequency === f.id;
                        return (
                          <button
                            key={f.id}
                            onClick={() => setFormData((p) => ({ ...p, frequency: f.id }))}
                            className={cn(
                              "rounded-xl border-2 p-4 text-left text-sm font-medium transition-all",
                              selected
                                ? "border-primary bg-accent text-accent-foreground"
                                : "border-border bg-card hover:border-primary/40"
                            )}
                          >
                            {f.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="mt-8 flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={goBack}
                disabled={step === 0}
                className="gap-1"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Button onClick={goNext} disabled={!canProceed() || generating} className="gap-1">
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating…
                  </>
                ) : step === STEPS.length - 1 ? (
                  <>
                    Generate My Plan
                    <ArrowRight className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
