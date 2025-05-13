import { useState } from "react";
import { Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IndividualSignupForm } from "@/components/auth/individual-signup-form";
import { BusinessSignupForm } from "@/components/auth/business-signup-form";

export default function SignupPage() {
  const [signupType, setSignupType] = useState<string>("individual");

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col items-center min-h-screen">
      <div className="max-w-md w-full">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
          <p className="text-muted-foreground mt-2">
            Join our community and start tracking your sustainable commuting
          </p>
        </div>
        
        <Tabs
          defaultValue="individual"
          className="w-full"
          value={signupType}
          onValueChange={setSignupType}
        >
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="individual">Individual</TabsTrigger>
            <TabsTrigger value="business">Business</TabsTrigger>
          </TabsList>
          
          <TabsContent value="individual">
            <IndividualSignupForm />
          </TabsContent>
          
          <TabsContent value="business">
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