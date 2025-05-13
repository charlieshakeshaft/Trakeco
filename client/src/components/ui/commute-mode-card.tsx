import { CommuteType } from "@/lib/types";
import { commuteTypeConfig } from "@/lib/constants";

interface CommuteModeCardProps {
  type: CommuteType;
  days: number;
  distance: number;
}

const CommuteModeCard = ({ type, days, distance }: CommuteModeCardProps) => {
  const config = commuteTypeConfig[type] || {
    icon: "help",
    backgroundColor: "gray-50",
    borderColor: "gray-100",
    iconBgColor: "gray-200/10",
    iconColor: "gray-500",
  };

  return (
    <div
      className={`flex-1 min-w-[140px] p-3 rounded-lg bg-${config.backgroundColor} border border-${config.borderColor} flex flex-col items-center`}
    >
      <div
        className={`w-10 h-10 rounded-full bg-${config.iconBgColor} flex items-center justify-center text-${config.iconColor} mb-2`}
      >
        <span className="material-icons">{config.icon}</span>
      </div>
      <span className="text-sm font-medium text-gray-800">{config.label}</span>
      <span className="text-xs text-gray-500 mt-1">
        {days} {days === 1 ? "day" : "days"}{distance > 0 ? ` | ${distance} km` : ""}
      </span>
    </div>
  );
};

export default CommuteModeCard;
