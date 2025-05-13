import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IndividualSignupForm } from "@/components/auth/individual-signup-form";
import { BusinessSignupForm } from "@/components/auth/business-signup-form";

export default function SignupPage() {
  const [location] = useLocation();
  const [signupType, setSignupType] = useState<string>("individual");
  
  // Set the correct tab based on URL parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const type = params.get("type");
    if (type === "business") {
      setSignupType("business");
    } else {
      setSignupType("individual");
    }
  }, [location]);

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 flex flex-col items-center min-h-screen">
      <div className="w-full max-w-lg">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
          <p className="text-muted-foreground mt-2 px-4">
            Join Trak and start tracking your sustainable commuting
          </p>
        </div>
        
        <Tabs
          defaultValue="individual"
          className="w-full"
          value={signupType}
          onValueChange={(value) => {
            setSignupType(value);
            // Update URL when tab changes
            const url = value === "business" ? "/signup?type=business" : "/signup";
            window.history.replaceState(null, "", url);
          }}
        >
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="individual">Individual</TabsTrigger>
            <TabsTrigger value="business">Business</TabsTrigger>
          </TabsList>
          
          <TabsContent value="individual" className="w-full">
            <IndividualSignupForm />
          </TabsContent>
          
          <TabsContent value="business" className="w-full">
            <BusinessSignupForm />
          </TabsContent>
        </Tabs>
        
        <div className="mt-6 text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}