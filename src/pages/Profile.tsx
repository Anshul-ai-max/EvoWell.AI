import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Settings, LogOut, ChevronRight, RotateCcw, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const settingsItems = [
  { label: "Edit Profile", icon: User, color: "bg-primary/10 text-primary" },
  { label: "Preferences", icon: Settings, color: "bg-info/10 text-info" },
  { label: "Update Goals", icon: Target, color: "bg-warning/10 text-warning" },
];

export default function Profile() {
  const navigate = useNavigate();
  const [showResetDialog, setShowResetDialog] = useState(false);

  const handleReset = () => {
    const keys = Object.keys(localStorage).filter((k) => k.startsWith("evowell_"));
    keys.forEach((k) => localStorage.removeItem(k));
    navigate("/onboarding");
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold">Profile</h1>
      </motion.div>

      {/* User card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Card className="border-0 shadow-sm rounded-2xl hover-lift">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="relative">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent ring-2 ring-primary/20 ring-offset-2 ring-offset-card">
                <User className="h-8 w-8 text-accent-foreground" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full gradient-primary border-2 border-card" />
            </div>
            <div>
              <div className="font-display text-lg font-semibold">Fitness User</div>
              <div className="text-sm text-muted-foreground">user@example.com</div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Settings list */}
      <div className="space-y-2">
        {settingsItems.map((item, i) => (
          <motion.div key={item.label} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.05 }}>
            <Card className="border-0 shadow-sm rounded-2xl hover-lift cursor-pointer">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${item.color}`}>
                    <item.icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="space-y-3 pt-2">
        <Button variant="outline" className="w-full gap-2 text-destructive rounded-xl" onClick={() => setShowResetDialog(true)}>
          <RotateCcw className="h-4 w-4" /> Reset Profile & Start Over
        </Button>
        <Button variant="outline" className="w-full gap-2 text-destructive rounded-xl">
          <LogOut className="h-4 w-4" /> Sign Out
        </Button>
      </div>

      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Profile?</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear all your preferences and plans, and take you back to the onboarding flow. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReset} className="rounded-xl">Yes, Reset Everything</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
