import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Dumbbell, Check, Loader2, Cake, Ruler, Weight, UtensilsCrossed, Globe2, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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

const workoutStyles = [
  { id: "auto", label: "Let AI Decide", desc: "AI picks the best split for your goals", emoji: "🤖" },
  { id: "ppl", label: "Push / Pull / Legs", desc: "Classic 3-way split for balanced development", emoji: "🔄" },
  { id: "bro_split", label: "Bro Split", desc: "Chest, Back, Shoulders, Arms, Legs — one muscle group per day", emoji: "💪" },
  { id: "upper_lower", label: "Upper / Lower", desc: "Alternate upper and lower body days", emoji: "⬆️" },
  { id: "full_body", label: "Full Body", desc: "Hit every muscle group each session", emoji: "🏋️" },
  { id: "custom", label: "Custom", desc: "Describe your own split", emoji: "✏️" },
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

const genders = [
  { id: "male", label: "Male", emoji: "♂️" },
  { id: "female", label: "Female", emoji: "♀️" },
];

const budgetOptions = [
  { id: "budget", label: "Budget-friendly", desc: "Affordable, locally available ingredients", emoji: "💰" },
  { id: "moderate", label: "Moderate", desc: "Balanced cost, some premium items", emoji: "⚖️" },
  { id: "no_limit", label: "No budget constraints", desc: "Best quality ingredients, no cost concern", emoji: "💎" },
];

const supplementOptions = [
  { id: "none", label: "No supplements", desc: "Food-only approach, no powders or pills" },
  { id: "basic", label: "Basic (protein powder only)", desc: "Whey or plant-based protein to bridge gaps" },
  { id: "open", label: "Open to supplements", desc: "Protein, creatine, vitamins — whatever helps" },
];

const STEPS = ["Goals", "Level", "Gender", "Body", "Diet", "Cuisine", "Budget", "Supplements", "Split", "Equipment", "Schedule"];

interface FormData {
  goals: string[]; fitnessLevel: string; age: string; height: string; weight: string; gender: string;
  dietaryPreferences: string; restrictions: string; injuries: string; cuisine: string; customCuisine: string;
  budget: string; supplementWillingness: string; currentSupplements: string; workoutStyle: string;
  customWorkoutStyle: string; workoutEnvironment: string; frequency: string;
}

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    goals: [], fitnessLevel: "", gender: "", age: "", height: "", weight: "",
    dietaryPreferences: "", restrictions: "", injuries: "", cuisine: "", customCuisine: "",
    budget: "", supplementWillingness: "", currentSupplements: "", workoutStyle: "auto",
    customWorkoutStyle: "", workoutEnvironment: "", frequency: "",
  });

  const progress = ((step + 1) / STEPS.length) * 100;

  const toggleGoal = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      goals: prev.goals.includes(id) ? prev.goals.filter((g) => g !== id) : [...prev.goals, id],
    }));
  };

  const canProceed = () => {
    switch (step) {
      case 0: return formData.goals.length > 0;
      case 1: return !!formData.fitnessLevel;
      case 2: return !!formData.gender;
      case 3: return !!formData.age && !!formData.height && !!formData.weight;
      case 4: return !!formData.dietaryPreferences.trim();
      case 5: return !!formData.cuisine && (formData.cuisine !== "custom" || !!formData.customCuisine);
      case 6: return !!formData.budget;
      case 7: return !!formData.supplementWillingness;
      case 8: return !!formData.workoutStyle && (formData.workoutStyle !== "custom" || !!formData.customWorkoutStyle.trim());
      case 9: return !!formData.workoutEnvironment;
      case 10: return !!formData.frequency;
      default: return false;
    }
  };

  const [generating, setGenerating] = useState(false);

  const handleSubmit = async () => {
    localStorage.setItem("evowell_onboarding", JSON.stringify(formData));
    setGenerating(true);
    try {
      const res = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      
      if (!res.ok) {
        throw new Error("API failed")
      }
      
      const data = await res.json()
      
      const planText = data.result || "No plan generated"
      
      console.log(planText)
      
      localStorage.setItem("evowell_plan", planText)
      localStorage.setItem("evowell_onboarded", "true")
      
      navigate('/dashboard')
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Something went wrong generating your plan");
    } finally { setGenerating(false); }
  };

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir < 0 ? 80 : -80, opacity: 0 }),
  };

  const [direction, setDirection] = useState(1);

  const goNext = () => {
    if (step === STEPS.length - 1) { handleSubmit(); }
    else { setDirection(1); setStep((s) => s + 1); }
  };

  const goBack = () => { setDirection(-1); setStep((s) => s - 1); };

  const selectedCardClass = "border-primary bg-accent text-accent-foreground ring-1 ring-primary/20";
  const unselectedCardClass = "border-border bg-card hover:border-primary/40";
  const titleClass = "font-display text-xl font-semibold tracking-tight text-foreground md:text-2xl";
  const subtitleClass = "text-sm text-muted-foreground mb-6";
  const sectionClass = "rounded-2xl border border-border/60 bg-muted/20 p-4 md:p-5";
  const labelClass = "mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground";
  const iconClass = "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground";
  const inputClass = "pl-10";

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-8">
      {/* Subtle gradient bg */}
      <div className="fixed inset-0 gradient-hero pointer-events-none" />
      <div className="pointer-events-none fixed -left-24 top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none fixed -right-24 bottom-12 h-72 w-72 rounded-full bg-info/10 blur-3xl" />

      <div className="relative mb-8 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl gradient-primary shadow-lg">
          <Dumbbell className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">EvoWell AI</h1>
          <p className="text-xs text-muted-foreground">Personalized fitness onboarding</p>
        </div>
      </div>

      <div className="relative w-full max-w-lg">
        {/* Progress bar only on mobile, step labels on desktop */}
        <div className="hidden md:flex mb-2 items-center justify-between px-1">
          {STEPS.map((label, i) => (
            <span key={label} className={cn("text-xs font-medium", i <= step ? "text-primary" : "text-muted-foreground")}>{label}</span>
          ))}
        </div>
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2 md:hidden">
            <span className="text-xs font-medium text-primary">Step {step + 1} of {STEPS.length}</span>
            <span className="text-xs text-muted-foreground">{STEPS[step]}</span>
          </div>
          <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
            <motion.div className="h-full rounded-full gradient-primary" animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
          </div>
        </div>

        <Card className="rounded-3xl border border-border/60 bg-card/90 shadow-xl backdrop-blur-sm">
          <CardContent className="p-6 md:p-8">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div key={step} custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.28, ease: "easeOut" }}>
                {step === 0 && (
                  <div>
                    <h2 className={cn(titleClass, "mb-1")}>What are your fitness goals?</h2>
                    <p className={subtitleClass}>Select all that apply</p>
                    <div className="grid grid-cols-2 gap-3">
                      {goals.map((goal) => {
                        const selected = formData.goals.includes(goal.id);
                        return (
                          <button key={goal.id} onClick={() => toggleGoal(goal.id)} className={cn("flex items-center gap-3 rounded-xl border-2 p-4 text-left text-sm font-medium transition-all", selected ? selectedCardClass : unselectedCardClass)}>
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
                    <h2 className={cn(titleClass, "mb-1")}>What's your fitness level?</h2>
                    <p className={subtitleClass}>This helps us tailor your plan</p>
                    <div className="flex flex-col gap-3">
                      {fitnessLevels.map((level) => {
                        const selected = formData.fitnessLevel === level.id;
                        return (
                          <button key={level.id} onClick={() => setFormData((p) => ({ ...p, fitnessLevel: level.id }))} className={cn("rounded-xl border-2 p-4 text-left transition-all", selected ? selectedCardClass : unselectedCardClass)}>
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
                    <h2 className={cn(titleClass, "mb-1")}>What's your gender?</h2>
                    <p className={subtitleClass}>Used for accurate calorie calculations</p>
                    <div className="grid grid-cols-2 gap-3">
                      {genders.map((g) => {
                        const selected = formData.gender === g.id;
                        return (
                          <button key={g.id} onClick={() => setFormData((p) => ({ ...p, gender: g.id }))} className={cn("flex items-center gap-3 rounded-xl border-2 p-4 text-left text-sm font-medium transition-all", selected ? selectedCardClass : unselectedCardClass)}>
                            <span className="text-lg">{g.emoji}</span>
                            <span>{g.label}</span>
                            {selected && <Check className="ml-auto h-4 w-4 text-primary" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div>
                    <h2 className={cn(titleClass, "mb-1")}>Tell us about yourself</h2>
                    <p className={subtitleClass}>Used to calculate your plan</p>
                    <div className="flex flex-col gap-4">
                      <div className={sectionClass}>
                        <Label htmlFor="age" className={labelClass}>Age</Label>
                        <div className="relative">
                          <Cake className={iconClass} />
                          <Input id="age" type="number" placeholder="e.g. 28" value={formData.age} onChange={(e) => setFormData((p) => ({ ...p, age: e.target.value }))} className={inputClass} />
                        </div>
                      </div>
                      <div className={cn(sectionClass, "grid grid-cols-1 gap-4 sm:grid-cols-2")}>
                        <div>
                          <Label htmlFor="height" className={labelClass}>Height (cm)</Label>
                          <div className="relative">
                            <Ruler className={iconClass} />
                            <Input id="height" type="number" placeholder="e.g. 175" value={formData.height} onChange={(e) => setFormData((p) => ({ ...p, height: e.target.value }))} className={inputClass} />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="weight" className={labelClass}>Weight (kg)</Label>
                          <div className="relative">
                            <Weight className={iconClass} />
                            <Input id="weight" type="number" placeholder="e.g. 75" value={formData.weight} onChange={(e) => setFormData((p) => ({ ...p, weight: e.target.value }))} className={inputClass} />
                          </div>
                        </div>
                      </div>
                      <div className={sectionClass}>
                        <Label htmlFor="injuries" className={labelClass}>Injuries or limitations (optional)</Label>
                        <Textarea id="injuries" placeholder="e.g. Lower back pain, knee surgery in 2023..." value={formData.injuries} onChange={(e) => setFormData((p) => ({ ...p, injuries: e.target.value }))} className="min-h-[88px]" />
                      </div>
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div>
                    <h2 className={cn(titleClass, "mb-1")}>Dietary preferences</h2>
                    <p className={subtitleClass}>Required - helps personalize your diet plan</p>
                    <div className="flex flex-col gap-4">
                      <div className={sectionClass}>
                        <Label htmlFor="dietPref" className={labelClass}>Diet type</Label>
                        <div className="relative">
                          <UtensilsCrossed className={iconClass} />
                          <Input id="dietPref" placeholder="e.g. Vegetarian, Keto, No preference..." value={formData.dietaryPreferences} onChange={(e) => setFormData((p) => ({ ...p, dietaryPreferences: e.target.value }))} className={inputClass} />
                        </div>
                      </div>
                      <div className={sectionClass}>
                        <Label htmlFor="restrictions" className={labelClass}>Food allergies or restrictions</Label>
                        <Textarea id="restrictions" placeholder="e.g. Lactose intolerant, no shellfish..." value={formData.restrictions} onChange={(e) => setFormData((p) => ({ ...p, restrictions: e.target.value }))} className="min-h-[88px]" />
                      </div>
                    </div>
                  </div>
                )}

                {step === 5 && (
                  <div>
                    <h2 className={cn(titleClass, "mb-1")}>What type of cuisine do you prefer?</h2>
                    <p className={subtitleClass}>We'll use authentic dishes from your culture</p>
                    <div className="grid grid-cols-2 gap-3">
                      {cuisines.map((c) => {
                        const selected = formData.cuisine === c.id;
                        return (
                          <button key={c.id} onClick={() => setFormData((p) => ({ ...p, cuisine: c.id }))} className={cn("flex items-center gap-3 rounded-xl border-2 p-4 text-left text-sm font-medium transition-all", selected ? selectedCardClass : unselectedCardClass)}>
                            <span className="text-lg">{c.emoji}</span>
                            <span>{c.label}</span>
                            {selected && <Check className="ml-auto h-4 w-4 text-primary" />}
                          </button>
                        );
                      })}
                    </div>
                    {formData.cuisine === "custom" && (
                      <div className={cn(sectionClass, "mt-4")}>
                        <Label htmlFor="customCuisine" className={labelClass}>Describe your preferred cuisine</Label>
                        <div className="relative">
                          <Globe2 className={iconClass} />
                          <Input id="customCuisine" placeholder="e.g. South Indian, Japanese, Nigerian..." value={formData.customCuisine} onChange={(e) => setFormData((p) => ({ ...p, customCuisine: e.target.value }))} className={inputClass} />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {step === 6 && (
                  <div>
                    <h2 className={cn(titleClass, "mb-1")}>What's your budget?</h2>
                    <p className={subtitleClass}>Helps us pick realistic, affordable ingredients</p>
                    <div className="flex flex-col gap-3">
                      {budgetOptions.map((b) => {
                        const selected = formData.budget === b.id;
                        return (
                          <button key={b.id} onClick={() => setFormData((p) => ({ ...p, budget: b.id }))} className={cn("flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all", selected ? selectedCardClass : unselectedCardClass)}>
                            <span className="text-lg">{b.emoji}</span>
                            <div>
                              <div className="font-medium text-sm">{b.label}</div>
                              <div className="text-xs text-muted-foreground mt-0.5">{b.desc}</div>
                            </div>
                            {selected && <Check className="ml-auto h-4 w-4 text-primary" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {step === 7 && (
                  <div>
                    <h2 className={cn(titleClass, "mb-1")}>Are you open to supplements?</h2>
                    <p className={subtitleClass}>Helps bridge protein gaps realistically</p>
                    <div className="flex flex-col gap-3">
                      {supplementOptions.map((s) => {
                        const selected = formData.supplementWillingness === s.id;
                        return (
                          <button key={s.id} onClick={() => setFormData((p) => ({ ...p, supplementWillingness: s.id }))} className={cn("rounded-xl border-2 p-4 text-left transition-all", selected ? selectedCardClass : unselectedCardClass)}>
                            <div className="font-medium text-sm">{s.label}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">{s.desc}</div>
                          </button>
                        );
                      })}
                    </div>
                    {formData.supplementWillingness !== "none" && (
                      <div className={cn(sectionClass, "mt-4")}>
                        <Label htmlFor="currentSupps" className={labelClass}>Supplements you already use (optional)</Label>
                        <div className="relative">
                          <FlaskConical className={iconClass} />
                          <Input id="currentSupps" placeholder="e.g. Whey protein, creatine, multivitamin..." value={formData.currentSupplements} onChange={(e) => setFormData((p) => ({ ...p, currentSupplements: e.target.value }))} className={inputClass} />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {step === 8 && (
                  <div>
                    <h2 className={cn(titleClass, "mb-1")}>Preferred workout split?</h2>
                    <p className={subtitleClass}>Choose how you want to structure your training</p>
                    <div className="flex flex-col gap-3">
                      {workoutStyles.map((ws) => {
                        const selected = formData.workoutStyle === ws.id;
                        return (
                          <button key={ws.id} onClick={() => setFormData((p) => ({ ...p, workoutStyle: ws.id }))} className={cn("flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all", selected ? selectedCardClass : unselectedCardClass)}>
                            <span className="text-lg">{ws.emoji}</span>
                            <div>
                              <div className="font-medium text-sm">{ws.label}</div>
                              <div className="text-xs text-muted-foreground mt-0.5">{ws.desc}</div>
                            </div>
                            {selected && <Check className="ml-auto h-4 w-4 text-primary" />}
                          </button>
                        );
                      })}
                    </div>
                    {formData.workoutStyle === "custom" && (
                      <div className={cn(sectionClass, "mt-4")}>
                        <Label htmlFor="customSplit" className={labelClass}>Describe your custom split</Label>
                        <Textarea id="customSplit" placeholder="e.g. Day 1: Chest+Triceps, Day 2: Back+Biceps..." value={formData.customWorkoutStyle} onChange={(e) => setFormData((p) => ({ ...p, customWorkoutStyle: e.target.value }))} className="min-h-[110px]" />
                      </div>
                    )}
                  </div>
                )}

                {step === 9 && (
                  <div>
                    <h2 className={cn(titleClass, "mb-1")}>Where will you work out?</h2>
                    <p className={subtitleClass}>We'll only suggest exercises you can actually do</p>
                    <div className="flex flex-col gap-3">
                      {workoutEnvironments.map((env) => {
                        const selected = formData.workoutEnvironment === env.id;
                        return (
                          <button key={env.id} onClick={() => setFormData((p) => ({ ...p, workoutEnvironment: env.id }))} className={cn("rounded-xl border-2 p-4 text-left transition-all", selected ? selectedCardClass : unselectedCardClass)}>
                            <div className="font-medium text-sm">{env.label}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">{env.desc}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {step === 10 && (
                  <div>
                    <h2 className={cn(titleClass, "mb-1")}>How often can you work out?</h2>
                    <p className={subtitleClass}>We'll build your schedule around this</p>
                    <div className="flex flex-col gap-3">
                      {frequencies.map((f) => {
                        const selected = formData.frequency === f.id;
                        return (
                          <button key={f.id} onClick={() => setFormData((p) => ({ ...p, frequency: f.id }))} className={cn("rounded-xl border-2 p-4 text-left text-sm font-medium transition-all", selected ? selectedCardClass : unselectedCardClass)}>
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
              <Button variant="ghost" onClick={goBack} disabled={step === 0} className="gap-1 rounded-xl">
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <Button onClick={goNext} disabled={!canProceed() || generating} className="gap-1 rounded-xl gradient-primary shadow-md transition-transform duration-200 hover:-translate-y-0.5">
                {generating ? (
                  <><Loader2 className="h-4 w-4 animate-spin" />Generating…</>
                ) : step === STEPS.length - 1 ? (
                  <>Generate My Plan <ArrowRight className="h-4 w-4" /></>
                ) : (
                  <>Next <ArrowRight className="h-4 w-4" /></>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
