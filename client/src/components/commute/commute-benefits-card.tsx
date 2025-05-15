import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const CommuteBenefitsCard = () => {
  return (
    <Card>
      <CardContent className="pt-6">
        <h2 className="text-xl font-semibold mb-4">Points & Benefits</h2>
        
        {/* Points Information Section */}
        <div className="space-y-3">
          <div className="flex items-center mb-2">
            <h3 className="text-sm font-medium text-gray-700">Points by Transport Mode</h3>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-5 w-5 ml-1">
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="max-w-sm">
                  <p>Points are awarded per day. Get a bonus when you use the same sustainable commute method consistently!</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <div className="bg-green-50 p-3 rounded-lg border border-green-100">
            <div className="flex items-center gap-2 font-medium text-green-700 mb-1">
              <span className="material-icons text-green-500">directions_walk</span>
              Walking
            </div>
            <p className="text-sm text-green-600">
              <span className="font-bold">30 points</span> per day - The most sustainable way to commute
            </p>
          </div>
          
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
            <div className="flex items-center gap-2 font-medium text-blue-700 mb-1">
              <span className="material-icons text-blue-500">directions_bike</span>
              Cycling
            </div>
            <p className="text-sm text-blue-600">
              <span className="font-bold">25 points</span> per day - A fast and sustainable option
            </p>
          </div>
          
          <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
            <div className="flex items-center gap-2 font-medium text-purple-700 mb-1">
              <span className="material-icons text-purple-500">directions_transit</span>
              Public Transport
            </div>
            <p className="text-sm text-purple-600">
              <span className="font-bold">20 points</span> per day - Efficient for longer distances
            </p>
          </div>
          
          <div className="bg-amber-50 p-3 rounded-lg border border-amber-100">
            <div className="flex items-center gap-2 font-medium text-amber-700 mb-1">
              <span className="material-icons text-amber-500">electric_car</span>
              Electric Vehicle
            </div>
            <p className="text-sm text-amber-600">
              <span className="font-bold">10 points</span> per day - Better than conventional vehicles
            </p>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 font-medium text-gray-700 mb-1">
              <span className="material-icons text-gray-500">directions_car</span>
              Carpooling
            </div>
            <p className="text-sm text-gray-600">
              <span className="font-bold">15 points</span> per day - Sharing rides reduces emissions
            </p>
          </div>
          
          <div className="bg-teal-50 p-3 rounded-lg border border-teal-100">
            <div className="flex items-center gap-2 font-medium text-teal-700 mb-1">
              <span className="material-icons text-teal-500">home</span>
              Remote Work
            </div>
            <p className="text-sm text-teal-600">
              <span className="font-bold">15 points</span> per day - Zero commute emissions
            </p>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-700 mb-1">Bonus Points</h4>
          <ul className="text-sm text-blue-600 space-y-1">
            <li>• <span className="font-medium">Consistency Bonus:</span> +25 points when you use the same sustainable commute for 3+ days in a week</li>
            <li>• <span className="font-medium">Challenge Completion:</span> +50-200 points depending on difficulty</li>
          </ul>
        </div>
        
        <div className="mt-4 bg-blue-50 p-3 rounded-lg">
          <h3 className="font-medium text-blue-700 flex items-center">
            <span className="material-icons text-blue-500 mr-1">info</span>
            Tip
          </h3>
          <p className="text-sm text-blue-600 mt-1">
            You can edit your commute entries for the current week until Sunday at midnight.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CommuteBenefitsCard;