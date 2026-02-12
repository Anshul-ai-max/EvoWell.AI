import { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Camera, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";

const weightData = [
  { date: "Jan 1", weight: 80 },
  { date: "Jan 8", weight: 79.5 },
  { date: "Jan 15", weight: 79 },
  { date: "Jan 22", weight: 78.2 },
  { date: "Jan 29", weight: 77.8 },
  { date: "Feb 5", weight: 77 },
  { date: "Feb 12", weight: 76.5 },
];

const strengthData = [
  { date: "Week 1", bench: 60, squat: 80, deadlift: 100 },
  { date: "Week 2", bench: 62.5, squat: 85, deadlift: 105 },
  { date: "Week 3", bench: 65, squat: 87.5, deadlift: 110 },
  { date: "Week 4", bench: 67.5, squat: 90, deadlift: 115 },
  { date: "Week 5", bench: 70, squat: 95, deadlift: 120 },
];

export default function ProgressTracking() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold">Progress</h1>
        <p className="text-sm text-muted-foreground mt-1">Track your journey over time</p>
      </motion.div>

      <Tabs defaultValue="weight">
        <TabsList className="w-full">
          <TabsTrigger value="weight" className="flex-1">Weight</TabsTrigger>
          <TabsTrigger value="strength" className="flex-1">Strength</TabsTrigger>
          <TabsTrigger value="photos" className="flex-1">Photos</TabsTrigger>
        </TabsList>

        <TabsContent value="weight" className="mt-4 space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="font-display text-base">Body Weight</CardTitle>
                <Button variant="outline" size="sm" className="gap-1">
                  <Plus className="h-3 w-3" /> Log Weight
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weightData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis domain={["dataMin - 1", "dataMax + 1"]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip />
                    <Line type="monotone" dataKey="weight" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="strength" className="mt-4 space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-base">Strength Progression</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={strengthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip />
                    <Line type="monotone" dataKey="bench" stroke="hsl(var(--primary))" strokeWidth={2} name="Bench Press" />
                    <Line type="monotone" dataKey="squat" stroke="hsl(var(--info))" strokeWidth={2} name="Squat" />
                    <Line type="monotone" dataKey="deadlift" stroke="hsl(var(--warning))" strokeWidth={2} name="Deadlift" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="photos" className="mt-4 space-y-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-8 text-center">
              <Camera className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
              <h3 className="font-display font-semibold mb-1">Progress Photos</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Upload photos to compare your transformation over time
              </p>
              <Button className="gap-1">
                <Plus className="h-4 w-4" /> Upload Photo
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
