import { Link, useLocation, Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Home,
  Dumbbell,
  UtensilsCrossed,
  TrendingUp,
  User,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: Home },
  { to: "/workout", label: "Workout", icon: Dumbbell },
  { to: "/diet", label: "Diet", icon: UtensilsCrossed },
  { to: "/progress", label: "Progress", icon: TrendingUp },
  { to: "/profile", label: "Profile", icon: User },
];

export default function AppLayout() {
  const location = useLocation();
  const isMobile = useIsMobile();

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-border bg-card/50 backdrop-blur-xl p-4">
          <Link to="/dashboard" className="mb-8 flex items-center gap-2.5 px-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary">
              <Dumbbell className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold text-foreground">EvoWell AI</span>
          </Link>

          <nav className="flex flex-1 flex-col gap-1">
            {navItems.map((item) => {
              const active = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    active
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  {active && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full gradient-primary"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
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
          <header className="sticky top-0 z-50 flex items-center justify-center glass-strong px-4 py-3">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl gradient-primary">
                <Dumbbell className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-display text-lg font-bold">EvoWell AI</span>
            </Link>
          </header>
        )}

        <div className={cn("mx-auto max-w-5xl p-4 md:p-8", isMobile && "pb-28")}>
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Tab Bar */}
      {isMobile && (
        <nav className="fixed bottom-0 inset-x-0 z-50 glass-strong border-t border-border/50 px-2 pb-[env(safe-area-inset-bottom)]">
          <div className="flex items-center justify-around py-1.5">
            {navItems.map((item) => {
              const active = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors",
                    active ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {active && (
                    <motion.div
                      layoutId="tab-active"
                      className="absolute -top-1.5 h-0.5 w-6 rounded-full gradient-primary"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <item.icon className="h-5 w-5" />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}

      {/* Floating AI Chat Button */}
      <Link
        to="/chat"
        className={cn(
          "fixed z-50 flex h-14 w-14 items-center justify-center rounded-full gradient-primary shadow-lg transition-transform hover:scale-105 active:scale-95",
          isMobile ? "bottom-20 right-4" : "bottom-6 right-6"
        )}
      >
        <MessageCircle className="h-6 w-6 text-primary-foreground" />
      </Link>
    </div>
  );
}
