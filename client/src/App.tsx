import { useState, useEffect } from "react";
import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient, getQueryFn } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
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
import LoginPage from "@/pages/login";
import SignupPage from "@/pages/signup";

// Layout components
import Sidebar from "@/components/layout/sidebar";
import MobileHeader from "@/components/layout/mobile-header";
import MobileNavigation from "@/components/layout/mobile-navigation";

// Types and utils
import { User } from "@/lib/types";

// Auth-protected route component
function PrivateRoute({ component: Component, ...rest }: { component: React.FC<any>, path: string }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  return user ? <Component /> : <Redirect to="/login" />;
}

// Auth hook for checking if user is logged in
function useAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ['/api/user/profile'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
    retry: false,
    refetchOnWindowFocus: false,
  });
  
  return { user, isLoading, isAuthenticated: !!user };
}

function AuthenticatedApp({ user }: { user: User }) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  
  // Close mobile menu when navigating
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {!isMobile && <Sidebar user={user} />}
      
      {isMobile && (
        <MobileHeader 
          isMenuOpen={mobileMenuOpen} 
          onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} 
        />
      )}
      
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/log-commute" component={LogCommute} />
          <Route path="/challenges" component={Challenges} />
          <Route path="/rewards" component={Rewards} />
          <Route path="/leaderboard" component={Leaderboard} />
          <Route path="/profile" component={Profile} />
          <Route component={NotFound} />
        </Switch>
      </main>
      
      {isMobile && <MobileNavigation />}
    </div>
  );
}

function Router() {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  // Public routes
  if (!user) {
    return (
      <Switch>
        <Route path="/login" component={LoginPage} />
        <Route path="/signup" component={SignupPage} />
        <Route>
          <Redirect to="/login" />
        </Route>
      </Switch>
    );
  }
  
  // Authenticated routes
  return <AuthenticatedApp user={user} />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
