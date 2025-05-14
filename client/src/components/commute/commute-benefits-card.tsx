import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
        <div className="mb-4">
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
                  <p>Points are awarded per day. Get a bonus of 25 points when you use the same sustainable commute method for 3+ days in a week!</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div className="flex items-center justify-between rounded-md border p-2 bg-white">
              <span className="font-medium">Walking</span>
              <Badge variant="default" className="bg-green-600">30 pts</Badge>
            </div>
            <div className="flex items-center justify-between rounded-md border p-2 bg-white">
              <span className="font-medium">Cycling</span>
              <Badge variant="default" className="bg-green-600">25 pts</Badge>
            </div>
            <div className="flex items-center justify-between rounded-md border p-2 bg-white">
              <span className="font-medium">Public Transport</span>
              <Badge variant="default" className="bg-green-500">20 pts</Badge>
            </div>
            <div className="flex items-center justify-between rounded-md border p-2 bg-white">
              <span className="font-medium">Remote Work</span>
              <Badge variant="default" className="bg-green-500">15 pts</Badge>
            </div>
            <div className="flex items-center justify-between rounded-md border p-2 bg-white">
              <span className="font-medium">Carpooling</span>
              <Badge variant="default" className="bg-green-500">15 pts</Badge>
            </div>
            <div className="flex items-center justify-between rounded-md border p-2 bg-white">
              <span className="font-medium">Electric Vehicle</span>
              <Badge variant="default" className="bg-green-400">10 pts</Badge>
            </div>
          </div>
          
          <div className="mt-3 text-sm text-gray-600">
            <span className="font-medium">Consistency Bonus:</span> Use the same sustainable commute for 3+ days in a week: <Badge variant="outline" className="border-green-500 text-green-600">+25 pts</Badge>
          </div>
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
  );
};

export default CommuteBenefitsCard;