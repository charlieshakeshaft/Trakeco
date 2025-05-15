import { useState, useEffect } from "react";
import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useMediaQuery } from "@/hooks/use-mobile";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import NotFound from "@/pages/not-found";
import { User } from "@/lib/types";

// Pages
import Dashboard from "@/pages/dashboard";
import LogCommute from "@/pages/log-commute";
import Challenges from "@/pages/challenges";
import Rewards from "@/pages/rewards";
import Leaderboard from "@/pages/leaderboard";
import Profile from "@/pages/profile";
import LoginPage from "@/pages/login";
import SignupPage from "@/pages/signup";
import CompanyPage from "@/pages/company";

// Layout components
import Sidebar from "@/components/layout/sidebar";
import MobileHeader from "@/components/layout/mobile-header";
import MobileMenu from "@/components/layout/mobile-menu";
import MobileNavigation from "@/components/layout/mobile-navigation";

// Auth-protected route component
function PrivateRoute({ component: Component, ...rest }: { component: React.FC<any>, path: string }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  return user ? <Component /> : <Redirect to="/login" />;
}

function AuthenticatedApp({ user }: { user: User }) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location, setLocation] = useLocation();
  
  // Close mobile menu when navigating
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);
  
  // Directly handle password change redirection in the component render
  if (user?.needs_password_change && location !== '/profile') {
    console.log("Password change required - redirecting to profile");
    // Use window.location to force a complete refresh and avoid React state issues
    window.location.href = '/profile';
    return null;
  }
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {!isMobile && <Sidebar user={user} />}
      
      {isMobile && (
        <>
          <MobileHeader 
            isMenuOpen={mobileMenuOpen} 
            onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} 
          />
          <MobileMenu 
            isOpen={mobileMenuOpen}
            user={user}
            onClose={() => setMobileMenuOpen(false)}
          />
        </>
      )}
      
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/log-commute" component={LogCommute} />
          <Route path="/challenges" component={Challenges} />
          <Route path="/rewards" component={Rewards} />
          <Route path="/leaderboard" component={Leaderboard} />
          <Route path="/profile" component={Profile} />
          <Route path="/company" component={CompanyPage} />
          <Route component={NotFound} />
        </Switch>
      </main>
      
      {isMobile && <MobileNavigation />}
    </div>
  );
}

function Router() {
  const { user, isLoading } = useAuth();
  const [location, setLocation] = useLocation();
  
  console.log("Router - auth state:", { user, isLoading, path: location });
  
  // Password redirection is now handled directly in the AuthenticatedApp component
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  // Public routes
  if (!user) {
    return (
      <div className="min-h-screen">
        <Switch>
          <Route path="/login" component={LoginPage} />
          <Route path="/signup" component={SignupPage} />
          <Route>
            <Redirect to="/login" />
          </Route>
        </Switch>
      </div>
    );
  }
  
  // Authenticated routes
  return <AuthenticatedApp user={user} />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Router />
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;