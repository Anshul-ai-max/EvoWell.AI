import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Settings, LogOut, ChevronRight, RotateCcw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
      <Card className="border-0 shadow-sm">
        <CardContent className="flex items-center gap-4 p-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent">
            <User className="h-7 w-7 text-accent-foreground" />
          </div>
          <div>
            <div className="font-display text-lg font-semibold">Fitness User</div>
            <div className="text-sm text-muted-foreground">user@example.com</div>
          </div>
        </CardContent>
      </Card>

      {/* Settings list */}
      <div className="space-y-2">
        {[
          { label: "Edit Profile", icon: User },
          { label: "Preferences", icon: Settings },
          { label: "Update Goals", icon: Settings },
        ].map((item) => (
          <Card key={item.label} className="border-0 shadow-sm">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <item.icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-3">
        <Button
          variant="outline"
          className="w-full gap-2 text-destructive"
          onClick={() => setShowResetDialog(true)}
        >
          <RotateCcw className="h-4 w-4" />
          Reset Profile & Start Over
        </Button>

        <Button variant="outline" className="w-full gap-2 text-destructive">
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>

      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Profile?</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear all your preferences and plans, and take you back to the onboarding flow. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReset}>Yes, Reset Everything</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
