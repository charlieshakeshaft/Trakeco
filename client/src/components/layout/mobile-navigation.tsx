import { useLocation } from "wouter";
import { useAuth } from "@/contexts/auth-context";

const MobileNavigation = () => {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  
  const isActive = (path: string) => location === path;
  
  const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    
    // For all navigation, use direct navigation
    console.log(`Mobile navigating to: ${path}`);
    window.location.href = path;
  };
  
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10">
      <div className="flex justify-around">
        <a
          href="/"
          onClick={(e) => handleNavigation(e, "/")}
          className={`flex flex-col items-center py-2 ${isActive("/") ? "text-primary" : "text-gray-500"}`}
        >
          <span className="material-icons">dashboard</span>
          <span className="text-xs mt-1">Dashboard</span>
        </a>
        <a
          href="/log-commute"
          onClick={(e) => handleNavigation(e, "/log-commute")}
          className={`flex flex-col items-center py-2 ${isActive("/log-commute") ? "text-primary" : "text-gray-500"}`}
        >
          <span className="material-icons">directions_bike</span>
          <span className="text-xs mt-1">Log</span>
        </a>
        <a
          href="/challenges"
          onClick={(e) => handleNavigation(e, "/challenges")} 
          className={`flex flex-col items-center py-2 ${isActive("/challenges") ? "text-primary" : "text-gray-500"}`}
        >
          <span className="material-icons">emoji_events</span>
          <span className="text-xs mt-1">Challenges</span>
        </a>
        <a
          href="/rewards"
          onClick={(e) => handleNavigation(e, "/rewards")}
          className={`flex flex-col items-center py-2 ${isActive("/rewards") ? "text-primary" : "text-gray-500"}`}
        >
          <span className="material-icons">redeem</span>
          <span className="text-xs mt-1">Rewards</span>
        </a>
      </div>
    </nav>
  );
};

export default MobileNavigation;
