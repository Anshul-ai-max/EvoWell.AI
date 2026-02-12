import { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Dumbbell,
  UtensilsCrossed,
  TrendingUp,
  Video,
  MessageCircle,
  User,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: Home },
  { to: "/workout", label: "Workout", icon: Dumbbell },
  { to: "/diet", label: "Diet", icon: UtensilsCrossed },
  { to: "/progress", label: "Progress", icon: TrendingUp },
  { to: "/form-check", label: "Form Check", icon: Video },
  { to: "/profile", label: "Profile", icon: User },
];

export default function AppLayout() {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-border bg-card p-4">
          <Link to="/dashboard" className="mb-8 flex items-center gap-2 px-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Dumbbell className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold text-foreground">EvoWell</span>
          </Link>

          <nav className="flex flex-1 flex-col gap-1">
            {navItems.map((item) => {
              const active = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
      )}

      {/* Main Content */}
      <main className={cn("flex-1", !isMobile && "ml-64")}>
        {/* Mobile Header */}
        {isMobile && (
          <header className="sticky top-0 z-50 flex items-center justify-between border-b border-border bg-card px-4 py-3">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Dumbbell className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-display text-lg font-bold">EvoWell</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </header>
        )}

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobile && mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="fixed inset-x-0 top-[57px] z-40 border-b border-border bg-card p-4"
            >
              <nav className="flex flex-col gap-1">
                {navItems.map((item) => {
                  const active = location.pathname === item.to;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        active
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mx-auto max-w-5xl p-4 md:p-8">
          <Outlet />
        </div>
      </main>

      {/* Floating AI Chat Button */}
      <Link
        to="/chat"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg transition-transform hover:scale-105"
      >
        <MessageCircle className="h-6 w-6 text-primary-foreground" />
      </Link>
    </div>
  );
}
