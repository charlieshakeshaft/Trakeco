import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import CommuteForm from "@/components/commute/commute-form";
import { commuteTypeConfig } from "@/lib/constants";

// Using userId 1 for demonstration
const DEMO_USER_ID = 1;

const LogCommute = () => {
  const [submitted, setSubmitted] = useState(false);
  
  const { data: currentCommutes, isLoading } = useQuery({
    queryKey: [`/api/commutes/current?userId=${DEMO_USER_ID}`],
    staleTime: 60000, // 1 minute
  });

  const handleSuccess = () => {
    setSubmitted(true);
  };

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-6">Log Your Commute</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <CommuteForm userId={DEMO_USER_ID} onSuccess={handleSuccess} />
          
          {submitted && (
            <Card className="mt-6 bg-green-50 border-green-200">
              <CardContent className="pt-6">
                <div className="flex items-center text-success mb-2">
                  <span className="material-icons mr-2">check_circle</span>
                  <span className="font-semibold">Commute Logged Successfully!</span>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Thank you for logging your sustainable commute. You're making a positive impact on the environment!
                </p>
                <Link to="/">
                  <button className="text-primary hover:text-primary-dark font-medium">
                    Return to Dashboard
                  </button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
        
        <div>
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Commute Types & Benefits</h2>
              
              <div className="space-y-4">
                {Object.entries(commuteTypeConfig).map(([type, config]) => (
                  <div key={type} className="flex items-start p-3 rounded-lg border border-gray-100">
                    <div className={`p-2 rounded-lg bg-${config.backgroundColor} mr-3`}>
                      <span className={`material-icons text-${config.iconColor}`}>{config.icon}</span>
                    </div>
                    <div>
                      <h3 className="font-medium">{config.label}</h3>
                      <p className="text-sm text-gray-600 mt-1">{config.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-800 flex items-center">
                  <span className="material-icons text-sm mr-1">info</span>
                  Tip
                </h3>
                <p className="text-sm text-blue-800 mt-1">
                  You can edit your commute entries for the current week until Sunday at midnight.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LogCommute;
