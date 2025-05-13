import { useLocation } from "wouter";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  const [, navigate] = useLocation();

  const handleLoginSuccess = (user: any) => {
    // In a real app, you'd set the user in a global state or context
    // For now, we'll just navigate to the dashboard
    navigate("/");
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