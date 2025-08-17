import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import SponsorAuth from "./pages/SponsorAuth";
import SponsorDashboard from "./pages/SponsorDashboard";
import SaveConfirm from "./pages/SaveConfirm";
import SaveChoose from "./pages/SaveChoose";
import SnoozeConfirm from "./pages/SnoozeConfirm";
import MatchAccept from "./pages/MatchAccept";
import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <BrowserRouter>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/app" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/sponsor-auth" element={<SponsorAuth />} />
            <Route path="/sponsor-dashboard" element={<SponsorDashboard />} />
            <Route path="/app/save/confirm" element={<SaveConfirm />} />
            <Route path="/app/save/choose" element={<SaveChoose />} />
            <Route path="/app/notify/snooze" element={<SnoozeConfirm />} />
            <Route path="/app/match/accept" element={<MatchAccept />} />
            <Route path="/" element={<Landing />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
