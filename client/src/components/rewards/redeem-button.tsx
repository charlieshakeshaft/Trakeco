import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface RedeemButtonProps {
  rewardId: number;
  userId: number;
}

const RedeemButton = ({ rewardId, userId }: RedeemButtonProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const handleRedeem = () => {
    setIsDialogOpen(true);
  };
  
  const confirmRedeem = () => {
    setIsDialogOpen(false);
    
    // Show success notification with instructions
    toast({
      title: "Reward request submitted!",
      description: "Please contact your company administrator to arrange for reward redemption. They'll help you claim your prize!",
      duration: 5000,
    });
  };
  
  return (
    <>
      <button 
        className={`mt-4 w-full py-2 px-4 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors claim-btn ${
          isHovered ? 'opacity-100' : ''
        }`}
        onClick={handleRedeem}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        Claim Reward
      </button>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Claim Your Reward</DialogTitle>
            <DialogDescription>
              Ready to redeem this reward? After confirming, please contact your company administrator to complete the redemption process.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex items-center p-3 bg-blue-50 rounded-lg mt-2">
            <span className="material-icons text-blue-500 mr-2">info</span>
            <p className="text-sm text-blue-700">
              Administrator approval is required to finalize your reward redemption.
            </p>
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row sm:justify-end gap-2 mt-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmRedeem}>
              Confirm Redemption
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RedeemButton;
