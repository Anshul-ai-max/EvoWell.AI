import { motion } from "framer-motion";
import { User, Settings, LogOut, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Profile() {
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

      <Button variant="outline" className="w-full gap-2 text-destructive">
        <LogOut className="h-4 w-4" />
        Sign Out
      </Button>
    </div>
  );
}
