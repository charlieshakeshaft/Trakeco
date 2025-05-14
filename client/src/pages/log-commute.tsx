import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import WeeklyCommuteFormSimple from "@/components/commute/weekly-commute-form-simple";
import CommuteBenefitsCard from "@/components/commute/commute-benefits-card";
import { useAuth } from "@/contexts/auth-context";

const LogCommute = () => {
  const [submitted, setSubmitted] = useState(false);
  const { user } = useAuth();
  const userId = user?.id || 0;
  
  const { data: currentCommutes, isLoading } = useQuery({
    queryKey: [`/api/commutes/current?userId=${userId}`],
    staleTime: 60000, // 1 minute
  });

  const handleSuccess = () => {
    setSubmitted(true);
  };

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-6">Log Weekly Commutes</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <WeeklyCommuteFormSimple userId={userId} onSuccess={handleSuccess} />
          
          {submitted && (
            <Card className="mt-6 bg-green-50 border-green-200">
              <CardContent className="pt-6">
                <div className="flex items-center text-green-600 mb-2">
                  <span className="material-icons mr-2">check_circle</span>
                  <span className="font-semibold">Commutes Logged Successfully!</span>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Thank you for logging your sustainable commutes. You're making a positive impact on the environment!
                </p>
                <Link href="/">
                  <button className="text-primary hover:text-primary-dark font-medium">
                    Return to Dashboard
                  </button>
                </Link>
              </CardContent>
            </Card>
          )}
          
          {/* Points Card is now below the main form */}
          <div className="mt-6">
            <CommuteBenefitsCard />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogCommute;
