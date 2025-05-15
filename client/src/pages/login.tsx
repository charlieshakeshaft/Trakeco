import { useState } from "react";
import { Link, useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { apiRequest } from "@/lib/queryClient";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Login form schema
const loginSchema = z.object({
  username: z.string().min(1, "Username or email is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { isLoading: authLoading, login } = useAuth();
  const [_, setLocation] = useLocation();
  
  // Login form
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);
    try {
      const user = await login(data.username, data.password);
      console.log("Login successful, user data:", user);
      
      // Show success message
      toast({
        title: "Login successful!",
        description: "Welcome back to Trak.",
      });
      
      // Small delay to ensure the auth state is updated
      setTimeout(() => {
        // Redirect to dashboard using client-side navigation
        setLocation("/");
      }, 500);
      
    } catch (error) {
      console.error("Login error details:", error);
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid credentials, please try again.",
      });
      setIsLoading(false);
    }
  }

  if (authLoading) {
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
    <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-screen">
      <div className="grid md:grid-cols-2 gap-6 lg:gap-12 items-start w-full max-w-5xl">
        {/* Authentication card */}
        <Card className="md:col-span-1 border shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Welcome to Trak</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username or Email</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter your username or email" 
                              {...field} 
                              autoComplete="username email"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="••••••••" 
                              {...field} 
                              autoComplete="current-password"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isLoading}
                    >
                      {isLoading ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
              
              <TabsContent value="signup">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <Button asChild variant="outline" className="w-full h-auto py-4">
                      <a href="/signup" className="flex flex-col w-full text-center px-3">
                        <span className="text-base font-medium mb-1">Individual</span>
                        <span className="text-xs text-muted-foreground leading-tight">
                          Track commutes and earn rewards
                        </span>
                      </a>
                    </Button>
                    
                    <Button asChild variant="default" className="w-full h-auto py-4">
                      <a href="/signup?type=business" className="flex flex-col w-full text-center px-3">
                        <span className="text-base font-medium mb-1">Business</span>
                        <span className="text-xs text-foreground/80 leading-tight">
                          For company accounts
                        </span>
                      </a>
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          
          <CardFooter className="flex flex-col items-center">
            <p className="text-sm text-muted-foreground text-center">
              By logging in, you agree to our terms of service and privacy policy
            </p>
          </CardFooter>
        </Card>
        
        {/* Info section */}
        <div className="hidden md:flex flex-col space-y-6 md:col-span-1">
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-bold tracking-tight">
              Reduce Your Carbon Footprint
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Join thousands of users making a positive impact on the environment
              by choosing greener commuting options.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-4 mt-6">
            <div className="flex items-start space-x-4">
              <div className="bg-primary/10 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M12 2v8"/><path d="m4.93 10.93 1.41 1.41"/><path d="M2 18h2"/><path d="M20 18h2"/><path d="m19.07 10.93-1.41 1.41"/><path d="M22 22H2"/><path d="m8 22 4-10 4 10"/><path d="M12 11V2"/></svg>
              </div>
              <div>
                <h3 className="font-semibold">Track Your Impact</h3>
                <p className="text-sm text-muted-foreground">
                  Monitor how much CO₂ you save with each sustainable commute.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="bg-primary/10 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
              </div>
              <div>
                <h3 className="font-semibold">Earn Rewards</h3>
                <p className="text-sm text-muted-foreground">
                  Collect points for sustainable commuting that can be redeemed for rewards.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="bg-primary/10 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M8 12h8"/><path d="M12 16V8"/></svg>
              </div>
              <div>
                <h3 className="font-semibold">Join Challenges</h3>
                <p className="text-sm text-muted-foreground">
                  Participate in team and company challenges to maximize your impact.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}