interface StreakDisplayProps {
  days: number;
}

const weekdays = ["M", "T", "W", "T", "F"];

const StreakDisplay = ({ days }: StreakDisplayProps) => {
  return (
    <div className="flex">
      {weekdays.map((day, index) => (
        <div key={day + index} className="flex-1 flex flex-col items-center">
          <div className="text-xs mb-1 text-gray-500">{day}</div>
          {index < days ? (
            <div className="w-6 h-6 rounded-full bg-secondary text-white flex items-center justify-center">
              <span className="material-icons text-sm">check</span>
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center">
              <span className="material-icons text-sm">directions_bike</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default StreakDisplay;
