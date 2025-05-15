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
    // Use wouter's setLocation for client-side navigation
    setLocation('/profile');
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
  const [authTransition, setAuthTransition] = useState<string | null>(null);
  
  console.log("Router - auth state:", { user, isLoading, path: location });
  
  // Check for auth transition state (login/logout)
  useEffect(() => {
    // Check if we're in a transition (login/logout)
    const transition = localStorage.getItem('auth_transition');
    if (transition) {
      setAuthTransition(transition);
      
      // Clear transition state after showing loading screen
      const timer = setTimeout(() => {
        localStorage.removeItem('auth_transition');
        setAuthTransition(null);
      }, 1500); // Show transition screen for 1.5 seconds
      
      return () => clearTimeout(timer);
    }
  }, [location]); // Check on location change
  
  // Check for successful login from localStorage only as a last resort
  // for cross-environment compatibility
  useEffect(() => {
    const authSuccess = localStorage.getItem('auth_success');
    
    if (authSuccess === 'true' && location === '/login') {
      console.log("Auth success detected in localStorage");
      localStorage.removeItem('auth_success'); // Clear the flag
      
      // Use client-side routing for smoother navigation
      setLocation('/');
    }
  }, [location, setLocation]);
  
  useEffect(() => {
    // If user is authenticated and tries to access login page, redirect to dashboard
    if (user && !isLoading && (location === '/login' || location === '/signup')) {
      console.log("Redirecting authenticated user to dashboard");
      setLocation('/');
    }
  }, [user, isLoading, location, setLocation]);
  
  // If we're in a transition state, show a smoother transition screen
  if (authTransition) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-b from-background to-secondary/10">
        <div className="text-center px-4 py-8 rounded-lg backdrop-blur-sm bg-background/80 shadow-lg border border-border">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">
            {authTransition === 'login' ? 'Signing in...' : 'Signing out...'}
          </h2>
          <p className="text-muted-foreground">
            {authTransition === 'login' 
              ? 'Setting up your dashboard...' 
              : 'See you soon!'}
          </p>
        </div>
      </div>
    );
  }
  
  // Only show loading state if we're not at the login page to prevent flashing during auth
  if (isLoading && location !== '/login') {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
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