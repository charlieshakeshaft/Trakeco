import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useJoinChallenge } from "@/hooks/use-challenges";

interface JoinChallengeButtonProps {
  challengeId: number;
  userId: number;
}

const JoinChallengeButton = ({ challengeId, userId }: JoinChallengeButtonProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const joinChallengeMutation = useJoinChallenge(userId);
  
  const handleJoin = () => {
    if (!joinChallengeMutation.isPending) {
      joinChallengeMutation.mutate(challengeId);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className={`transition-colors duration-200 ${
        isHovered ? "bg-primary text-white" : "text-primary border-primary" 
      }`}
      onClick={handleJoin}
      disabled={joinChallengeMutation.isPending}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {joinChallengeMutation.isPending ? (
        <>
          <span className="material-icons text-sm animate-spin mr-1">refresh</span>
          Joining...
        </>
      ) : (
        <>
          <span className="material-icons text-sm mr-1">add_circle</span>
          Join Challenge
        </>
      )}
    </Button>
  );
};

export default JoinChallengeButton;
