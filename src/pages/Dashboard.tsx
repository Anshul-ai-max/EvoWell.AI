import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Dumbbell,
  UtensilsCrossed,
  TrendingUp,
  Flame,
  Calendar,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 },
};

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div {...fadeIn}>
        <h1 className="font-display text-2xl font-bold md:text-3xl">Good morning 👋</h1>
        <p className="text-muted-foreground text-sm mt-1">Here's your fitness overview for today</p>
      </motion.div>

      {/* Quick Stats */}
      <motion.div {...fadeIn} transition={{ delay: 0.05 }} className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "Current Weight", value: "75 kg", icon: TrendingUp, color: "text-primary" },
          { label: "Day Streak", value: "12 🔥", icon: Flame, color: "text-warning" },
          { label: "This Week", value: "3/5 done", icon: Calendar, color: "text-info" },
          { label: "Calories Today", value: "1,850", icon: UtensilsCrossed, color: "text-success" },
        ].map((stat) => (
          <Card key={stat.label} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
              <p className="font-display text-lg font-semibold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Today's Workout */}
      <motion.div {...fadeIn} transition={{ delay: 0.1 }}>
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="font-display text-lg">Today's Workout</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/workout" className="gap-1 text-primary">
                View Plan <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="mb-3">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="font-medium">Upper Body — Push</span>
                <span className="text-muted-foreground">3/6 exercises</span>
              </div>
              <Progress value={50} className="h-2" />
            </div>
            <div className="space-y-2">
              {["Bench Press — 4×10", "Overhead Press — 3×12", "Incline DB Press — 3×10"].map((ex) => (
                <div key={ex} className="flex items-center gap-3 rounded-lg bg-secondary/50 px-3 py-2 text-sm">
                  <Dumbbell className="h-4 w-4 text-muted-foreground" />
                  {ex}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Today's Meals */}
      <motion.div {...fadeIn} transition={{ delay: 0.15 }}>
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="font-display text-lg">Today's Meals</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/diet" className="gap-1 text-primary">
                View Diet <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { meal: "Breakfast", desc: "Oatmeal with berries & protein shake", cal: "450 kcal" },
                { meal: "Lunch", desc: "Grilled chicken, rice & vegetables", cal: "650 kcal" },
                { meal: "Dinner", desc: "Salmon with sweet potato & salad", cal: "550 kcal" },
              ].map((m) => (
                <div key={m.meal} className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2.5">
                  <div>
                    <div className="text-sm font-medium">{m.meal}</div>
                    <div className="text-xs text-muted-foreground">{m.desc}</div>
                  </div>
                  <span className="text-xs font-medium text-primary">{m.cal}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
