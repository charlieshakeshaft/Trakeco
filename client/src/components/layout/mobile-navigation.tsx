import { Link, useLocation } from "wouter";

const MobileNavigation = () => {
  const [location] = useLocation();
  
  const isActive = (path: string) => location === path;
  
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10">
      <div className="flex justify-around">
        <Link 
          href="/" 
          className={`flex flex-col items-center py-2 ${isActive("/") ? "text-primary" : "text-gray-500"}`}
        >
          <span className="material-icons">dashboard</span>
          <span className="text-xs mt-1">Dashboard</span>
        </Link>
        <Link 
          href="/log-commute" 
          className={`flex flex-col items-center py-2 ${isActive("/log-commute") ? "text-primary" : "text-gray-500"}`}
        >
          <span className="material-icons">directions_bike</span>
          <span className="text-xs mt-1">Log</span>
        </Link>
        <Link 
          href="/challenges" 
          className={`flex flex-col items-center py-2 ${isActive("/challenges") ? "text-primary" : "text-gray-500"}`}
        >
          <span className="material-icons">emoji_events</span>
          <span className="text-xs mt-1">Challenges</span>
        </Link>
        <Link 
          href="/rewards" 
          className={`flex flex-col items-center py-2 ${isActive("/rewards") ? "text-primary" : "text-gray-500"}`}
        >
          <span className="material-icons">redeem</span>
          <span className="text-xs mt-1">Rewards</span>
        </Link>
      </div>
    </nav>
  );
};

export default MobileNavigation;
