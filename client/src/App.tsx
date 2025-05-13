import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useMediaQuery } from "@/hooks/use-mobile";
import NotFound from "@/pages/not-found";

// Pages
import Dashboard from "@/pages/dashboard";
import LogCommute from "@/pages/log-commute";
import Challenges from "@/pages/challenges";
import Rewards from "@/pages/rewards";
import Leaderboard from "@/pages/leaderboard";
import Profile from "@/pages/profile";

// Layout components
import Sidebar from "@/components/layout/sidebar";
import MobileHeader from "@/components/layout/mobile-header";
import MobileNavigation from "@/components/layout/mobile-navigation";

// Mock user state (in a real app, this would come from auth)
import { User } from "@/lib/types";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/log-commute" component={LogCommute} />
      <Route path="/challenges" component={Challenges} />
      <Route path="/rewards" component={Rewards} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route path="/profile" component={Profile} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const [currentUser, setCurrentUser] = useState<User>({
    id: 1,
    username: "alex.morgan",
    email: "alex@ecocorp.com",
    name: "Alex Morgan",
    company_id: 1,
    points_total: 820,
    streak_count: 6,
    role: "user"
  });

  // Close mobile menu when navigating
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen flex flex-col md:flex-row">
          {!isMobile && <Sidebar user={currentUser} />}
          
          {isMobile && (
            <MobileHeader 
              isMenuOpen={mobileMenuOpen} 
              onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} 
            />
          )}
          
          <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
            <Router />
          </main>
          
          {isMobile && <MobileNavigation />}
          
          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
