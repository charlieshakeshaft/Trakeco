import { useLocation } from "wouter";
import { LoginForm } from "@/components/auth/login-form";
import { useAuth } from "@/contexts/auth-context";
import { User } from "@/lib/types";

export default function LoginPage() {
  const [, navigate] = useLocation();
  const { setCurrentUser } = useAuth();

  const handleLoginSuccess = (user: User) => {
    // Update the auth context with the user data
    setCurrentUser(user);
    console.log("Login successful, redirecting to dashboard");
    
    // Add a delay before navigation to ensure state is updated
    setTimeout(() => {
      // Navigate to the dashboard
      navigate("/");
    }, 100);
  };

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col items-center min-h-screen">
      <div className="max-w-md w-full">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-muted-foreground mt-2">
            Sign in to your account to continue
          </p>
        </div>
        
        <LoginForm onLoginSuccess={handleLoginSuccess} />
      </div>
    </div>
  );
}