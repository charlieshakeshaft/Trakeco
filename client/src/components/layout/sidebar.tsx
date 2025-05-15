import { useLocation } from "wouter";
import { User } from "@/lib/types";

interface SidebarProps {
  user: User;
}

const Sidebar = ({ user }: SidebarProps) => {
  const [location, setLocation] = useLocation();

  const isActive = (path: string) => {
    return location === path || (path === '/profile' && location.startsWith('/profile'));
  };

  const linkClasses = (path: string) => {
    return `flex items-center px-4 py-3 ${
      isActive(path)
        ? "text-gray-800 bg-gray-100"
        : "text-gray-600 hover:bg-gray-100"
    }`;
  };
  
  // Simplified navigation handler - no tab support
  const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    
    // For all navigation, use direct navigation
    console.log(`Navigating to: ${path}`);
    window.location.href = path;
  };

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-screen sticky top-0">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
            <span className="material-icons text-sm">eco</span>
          </div>
          <h1 className="text-xl font-semibold ml-2 text-gray-800">Trak</h1>
        </div>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        <div className="px-4 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Main
        </div>
        <a 
          href="/" 
          onClick={(e) => handleNavigation(e, "/")}
          className={linkClasses("/")}
        >
          <span className="material-icons text-primary mr-3">dashboard</span>
          Dashboard
        </a>
        <a 
          href="/log-commute" 
          onClick={(e) => handleNavigation(e, "/log-commute")}
          className={linkClasses("/log-commute")}
        >
          <span className="material-icons text-gray-500 mr-3">directions_bike</span>
          Log Commute
        </a>
        <a 
          href="/challenges" 
          onClick={(e) => handleNavigation(e, "/challenges")}
          className={linkClasses("/challenges")}
        >
          <span className="material-icons text-gray-500 mr-3">emoji_events</span>
          Challenges
        </a>
        <a 
          href="/rewards" 
          onClick={(e) => handleNavigation(e, "/rewards")}
          className={linkClasses("/rewards")}
        >
          <span className="material-icons text-gray-500 mr-3">redeem</span>
          Rewards
        </a>
        <a 
          href="/leaderboard" 
          onClick={(e) => handleNavigation(e, "/leaderboard")}
          className={linkClasses("/leaderboard")}
        >
          <span className="material-icons text-gray-500 mr-3">leaderboard</span>
          Leaderboard
        </a>

        <div className="px-4 mt-6 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Account
        </div>
        <a 
          href="/profile" 
          onClick={(e) => handleNavigation(e, "/profile")}
          className={linkClasses("/profile")}
        >
          <span className="material-icons text-gray-500 mr-3">account_circle</span>
          Profile
        </a>
        {user.role === 'admin' && (
          <a 
            href="/company" 
            onClick={(e) => handleNavigation(e, "/company")}
            className={linkClasses("/company")}
          >
            <span className="material-icons text-gray-500 mr-3">business</span>
            Company
          </a>
        )}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center">
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.username || "User")}&background=0D8ABC&color=fff&size=64`}
            className="w-8 h-8 rounded-full"
            alt={`${user.name || user.username}'s avatar`}
          />
          <div className="ml-2">
            <div className="text-sm font-medium text-gray-800">{user.name || user.username}</div>
            <div className="text-xs text-gray-500">{user.email}</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
