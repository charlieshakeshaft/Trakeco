import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";

export default function LoginPage() {
  const { isLoading } = useAuth();

  const handleLoginWithReplit = () => {
    // Redirect to the Replit auth endpoint
    window.location.href = "/api/login";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-screen">
      <div className="max-w-md w-full">
        <Card className="border shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Welcome to Green Commute</CardTitle>
            <CardDescription className="text-center">
              Track your sustainable commuting and earn rewards
            </CardDescription>
          </CardHeader>
          
          <CardContent className="grid gap-4">
            <Button 
              size="lg" 
              className="w-full" 
              onClick={handleLoginWithReplit}
            >
              Sign in with Replit
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Secure Authentication
                </span>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col items-center">
            <p className="text-sm text-muted-foreground text-center">
              By logging in, you agree to our terms of service and privacy policy
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}