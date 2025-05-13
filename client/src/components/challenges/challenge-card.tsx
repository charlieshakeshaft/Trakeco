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
  
  // Use Material Icons and colors for challenge images
  let iconName = "eco"; // Default icon
  let bgColor = "bg-emerald-100";
  let iconColor = "text-emerald-600";
  
  // Maps commute type to appropriate icons and colors
  const commuteIcons: Record<string, {icon: string, bg: string, color: string}> = {
    'cycle': { icon: "directions_bike", bg: "bg-blue-100", color: "text-blue-600" },
    'walk': { icon: "directions_walk", bg: "bg-green-100", color: "text-green-600" },
    'public_transport': { icon: "directions_bus", bg: "bg-amber-100", color: "text-amber-600" },
    'carpool': { icon: "people", bg: "bg-indigo-100", color: "text-indigo-600" },
    'electric_vehicle': { icon: "electric_car", bg: "bg-teal-100", color: "text-teal-600" },
    'remote_work': { icon: "computer", bg: "bg-purple-100", color: "text-purple-600" },
    'bus': { icon: "directions_bus", bg: "bg-amber-100", color: "text-amber-600" },
    'train': { icon: "train", bg: "bg-red-100", color: "text-red-600" },
    'gas_vehicle': { icon: "directions_car", bg: "bg-gray-100", color: "text-gray-600" }
  };
  
  // Select icon based on challenge's commute type
  if (challenge.commute_type && commuteIcons[challenge.commute_type]) {
    const iconSet = commuteIcons[challenge.commute_type];
    iconName = iconSet.icon;
    bgColor = iconSet.bg;
    iconColor = iconSet.color;
  } 
  // Fallback to keyword-based selection if no commute type specified
  else if (challenge.title || challenge.description) {
    const title = challenge.title ? challenge.title.toLowerCase() : '';
    const description = challenge.description ? challenge.description.toLowerCase() : '';
    const content = title + ' ' + description;
    
    if (content.includes('cycle') || content.includes('bike') || content.includes('cycling') || content.includes('biking')) {
      const iconSet = commuteIcons['cycle'];
      iconName = iconSet.icon;
      bgColor = iconSet.bg;
      iconColor = iconSet.color;
    } else if (content.includes('walk') || content.includes('walking') || content.includes('step') || content.includes('on foot')) {
      const iconSet = commuteIcons['walk'];
      iconName = iconSet.icon;
      bgColor = iconSet.bg;
      iconColor = iconSet.color;
    } else if (content.includes('bus') || content.includes('buses')) {
      const iconSet = commuteIcons['bus'];
      iconName = iconSet.icon;
      bgColor = iconSet.bg;
      iconColor = iconSet.color;
    } else if (content.includes('train') || content.includes('rail') || content.includes('subway') || content.includes('metro')) {
      const iconSet = commuteIcons['train'];
      iconName = iconSet.icon;
      bgColor = iconSet.bg;
      iconColor = iconSet.color;
    } else if (content.includes('transit') || content.includes('public transport') || content.includes('transport')) {
      const iconSet = commuteIcons['public_transport'];
      iconName = iconSet.icon;
      bgColor = iconSet.bg;
      iconColor = iconSet.color;
    } else if (content.includes('carpool') || content.includes('shared') || content.includes('ride')) {
      const iconSet = commuteIcons['carpool'];
      iconName = iconSet.icon;
      bgColor = iconSet.bg;
      iconColor = iconSet.color;
    } else if (content.includes('electric') || content.includes('ev') || content.includes('battery')) {
      const iconSet = commuteIcons['electric_vehicle'];
      iconName = iconSet.icon;
      bgColor = iconSet.bg;
      iconColor = iconSet.color;
    } else if (content.includes('remote') || content.includes('home') || content.includes('virtual') || content.includes('telecommute')) {
      const iconSet = commuteIcons['remote_work'];
      iconName = iconSet.icon;
      bgColor = iconSet.bg;
      iconColor = iconSet.color;
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 card-hover transition-all duration-200">
      {!isDetailed ? (
        <div className={`w-full h-32 ${bgColor} flex items-center justify-center`}>
          <span className={`material-icons ${iconColor} text-6xl`}>{iconName}</span>
        </div>
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
