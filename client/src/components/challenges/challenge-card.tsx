import { formatDistanceToNow } from "date-fns";
import { Challenge, ChallengeParticipant } from "@/lib/types";
import { getChallengeProgress, getDaysRemaining } from "@/hooks/use-challenges";
import JoinChallengeButton from "./join-challenge-button";

interface ChallengeCardProps {
  challenge: Challenge;
  participant?: ChallengeParticipant;
  userId: number;
  isDetailed?: boolean;
}

const ChallengeCard = ({ challenge, participant, userId, isDetailed = false }: ChallengeCardProps) => {
  const progress = participant ? participant.progress : 0;
  const isCompleted = participant ? participant.completed : false;
  const progressPercentage = getChallengeProgress(challenge, progress);
  const daysRemaining = getDaysRemaining(challenge.end_date);
  
  // Determine image based on challenge type or title
  let imageSrc = "https://pixabay.com/get/ge15f1fd497978b7e1597e519e647bb2ec685ba064f5be0e0a1f8d7c0e9a2c6e71cd7458f59b39a76d60f7c2efe2efe866cb2a551d7678b5e5c97178e5a20e77c_1280.jpg";
  
  if (challenge.commute_type === 'public_transport' || challenge.title.toLowerCase().includes('transit') || challenge.title.toLowerCase().includes('bus')) {
    imageSrc = "https://pixabay.com/get/gb65d2ebce1af42dfe65b0ee69d037acb57d762dbe84c26f00344db1302bbaa3bbc8837c0cde1f1c01ee64ee09741798424ff6d99e4be7ea9968a505bda090dab_1280.jpg";
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 card-hover transition-all duration-200">
      {!isDetailed ? (
        <img
          src={imageSrc}
          alt={challenge.title}
          className="w-full h-32 object-cover"
        />
      ) : null}
      
      <div className="p-5">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-gray-800">{challenge.title}</h3>
          <span className={`text-xs font-medium ${isDetailed ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'} px-2 py-1 rounded`}>
            +{challenge.points_reward} pts
          </span>
        </div>
        
        <p className="text-sm text-gray-500 mt-1 mb-3">
          {challenge.description}
        </p>
        
        {isDetailed && (
          <div className="mt-1 mb-4">
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              <div>
                <span className="font-medium">Start Date:</span>
                <div>{new Date(challenge.start_date).toLocaleDateString()}</div>
              </div>
              <div>
                <span className="font-medium">End Date:</span>
                <div>{new Date(challenge.end_date).toLocaleDateString()}</div>
              </div>
              <div>
                <span className="font-medium">Goal Type:</span>
                <div className="capitalize">{challenge.goal_type}</div>
              </div>
              <div>
                <span className="font-medium">Target Value:</span>
                <div>{challenge.goal_value} {challenge.goal_type}</div>
              </div>
              {challenge.commute_type && (
                <div className="col-span-2">
                  <span className="font-medium">Commute Type:</span>
                  <div className="capitalize">{challenge.commute_type.replace('_', ' ')}</div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {participant && (
          <div className="mt-2">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-500">Progress</span>
              <span className="font-medium">
                {progress}/{challenge.goal_value} {challenge.goal_type}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full ${isCompleted ? "bg-success" : "bg-secondary"}`}
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        )}
        
        <div className="flex justify-between items-center mt-4">
          <span className="text-xs text-gray-500">
            {daysRemaining > 0 
              ? `Ends in ${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'}`
              : 'Challenge ended'}
          </span>
          
          {participant ? (
            isCompleted ? (
              <span className="text-sm font-medium text-success flex items-center">
                <span className="material-icons text-sm mr-1">check_circle</span>
                Completed!
              </span>
            ) : (
              <span className="text-sm font-medium text-gray-600 flex items-center">
                <span className="material-icons text-sm mr-1">schedule</span>
                In progress
              </span>
            )
          ) : (
            <JoinChallengeButton challengeId={challenge.id} userId={userId} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ChallengeCard;
