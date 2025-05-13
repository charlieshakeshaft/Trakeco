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
  
  // Maps commute type to appropriate high-quality images
  let imageSrc = "https://images.unsplash.com/photo-1594135356483-c396bd517740?q=80&w=2664&auto=format&fit=crop"; // Default sustainable commute image
  
  // Maps commute type to appropriate high-quality images
  const commuteImages: Record<string, string> = {
    'cycle': "https://images.unsplash.com/photo-1591741849697-fb1bad058b56?q=80&w=2574&auto=format&fit=crop", // Person cycling to work
    'walk': "https://images.unsplash.com/photo-1604505264481-84de098b6b4b?q=80&w=2669&auto=format&fit=crop", // Person walking in city
    'public_transport': "https://images.unsplash.com/photo-1569691105751-e8f95fbdde56?q=80&w=2670&auto=format&fit=crop", // Person on bus
    'carpool': "https://images.unsplash.com/photo-1578080582217-26b59e5a68b6?q=80&w=2670&auto=format&fit=crop", // Carpool/rideshare
    'electric_vehicle': "https://images.unsplash.com/photo-1603221680227-7ad5bc9c8b44?q=80&w=2670&auto=format&fit=crop", // EV charging
    'remote_work': "https://images.unsplash.com/photo-1584717903461-713a534d5acd?q=80&w=2670&auto=format&fit=crop", // Remote work setup
    'bus': "https://images.unsplash.com/photo-1601629665203-f9f2b8d3a3b5?q=80&w=2670&auto=format&fit=crop", // Person boarding bus
    'train': "https://images.unsplash.com/photo-1541411438265-4cb4687110f2?q=80&w=2574&auto=format&fit=crop", // Modern train
    'gas_vehicle': "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2670&auto=format&fit=crop" // Person in car
  };
  
  // Icon and color for status indicators
  let iconName = "eco"; // Default icon 
  let bgColor = "bg-emerald-100";
  let iconColor = "text-emerald-600";
  
  // Select image based on challenge's commute type
  if (challenge.commute_type && challenge.commute_type in commuteImages) {
    imageSrc = commuteImages[challenge.commute_type as keyof typeof commuteImages];
  } 
  // Fallback to keyword-based selection if no commute type specified
  else if (challenge.title || challenge.description) {
    const title = challenge.title ? challenge.title.toLowerCase() : '';
    const description = challenge.description ? challenge.description.toLowerCase() : '';
    const content = title + ' ' + description;
    
    if (content.includes('cycle') || content.includes('bike') || content.includes('cycling') || content.includes('biking')) {
      imageSrc = commuteImages['cycle'];
      iconName = "directions_bike";
      bgColor = "bg-blue-100";
      iconColor = "text-blue-600";
    } else if (content.includes('walk') || content.includes('walking') || content.includes('step') || content.includes('on foot')) {
      imageSrc = commuteImages['walk'];
      iconName = "directions_walk";
      bgColor = "bg-green-100";
      iconColor = "text-green-600";
    } else if (content.includes('bus') || content.includes('buses')) {
      imageSrc = commuteImages['bus'];
      iconName = "directions_bus";
      bgColor = "bg-amber-100";
      iconColor = "text-amber-600";
    } else if (content.includes('train') || content.includes('rail') || content.includes('subway') || content.includes('metro')) {
      imageSrc = commuteImages['train'];
      iconName = "train";
      bgColor = "bg-red-100";
      iconColor = "text-red-600";
    } else if (content.includes('transit') || content.includes('public transport') || content.includes('transport')) {
      imageSrc = commuteImages['public_transport'];
      iconName = "directions_bus";
      bgColor = "bg-amber-100";
      iconColor = "text-amber-600";
    } else if (content.includes('carpool') || content.includes('shared') || content.includes('ride')) {
      imageSrc = commuteImages['carpool'];
      iconName = "people";
      bgColor = "bg-indigo-100";
      iconColor = "text-indigo-600";
    } else if (content.includes('electric') || content.includes('ev') || content.includes('battery')) {
      imageSrc = commuteImages['electric_vehicle'];
      iconName = "electric_car";
      bgColor = "bg-teal-100";
      iconColor = "text-teal-600";
    } else if (content.includes('remote') || content.includes('home') || content.includes('virtual') || content.includes('telecommute')) {
      imageSrc = commuteImages['remote_work'];
      iconName = "computer";
      bgColor = "bg-purple-100";
      iconColor = "text-purple-600";
    }
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
