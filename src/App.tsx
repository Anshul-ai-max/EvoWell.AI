import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import Onboarding from "@/pages/Onboarding";
import Dashboard from "@/pages/Dashboard";
import Workout from "@/pages/Workout";
import Diet from "@/pages/Diet";
import ProgressTracking from "@/pages/ProgressTracking";
import FormCheck from "@/pages/FormCheck";
import Chat from "@/pages/Chat";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function RootRedirect() {
  const isOnboarded = localStorage.getItem("evowell_onboarded") === "true";
  return <Navigate to={isOnboarded ? "/dashboard" : "/onboarding"} replace />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/chat" element={<Chat />} />
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/workout" element={<Workout />} />
            <Route path="/diet" element={<Diet />} />
            <Route path="/progress" element={<ProgressTracking />} />
            <Route path="/form-check" element={<FormCheck />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
