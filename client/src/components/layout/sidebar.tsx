import { Link, useLocation } from "wouter";
import { User } from "@/lib/types";

interface SidebarProps {
  user: User;
}

const Sidebar = ({ user }: SidebarProps) => {
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location === path;
  };

  const linkClasses = (path: string) => {
    return `flex items-center px-4 py-3 ${
      isActive(path)
        ? "text-gray-800 bg-gray-100"
        : "text-gray-600 hover:bg-gray-100"
    }`;
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
        <Link href="/" className={linkClasses("/")}>
          <span className="material-icons text-primary mr-3">dashboard</span>
          Dashboard
        </Link>
        <Link href="/log-commute" className={linkClasses("/log-commute")}>
          <span className="material-icons text-gray-500 mr-3">directions_bike</span>
          Log Commute
        </Link>
        <Link href="/challenges" className={linkClasses("/challenges")}>
          <span className="material-icons text-gray-500 mr-3">emoji_events</span>
          Challenges
        </Link>
        <Link href="/rewards" className={linkClasses("/rewards")}>
          <span className="material-icons text-gray-500 mr-3">redeem</span>
          Rewards
        </Link>
        <Link href="/leaderboard" className={linkClasses("/leaderboard")}>
          <span className="material-icons text-gray-500 mr-3">leaderboard</span>
          Leaderboard
        </Link>

        <div className="px-4 mt-6 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Settings
        </div>
        <Link href="/profile" className={linkClasses("/profile")}>
          <span className="material-icons text-gray-500 mr-3">account_circle</span>
          Profile
        </Link>
        <Link href="/settings" className={linkClasses("/settings")}>
          <span className="material-icons text-gray-500 mr-3">settings</span>
          Settings
        </Link>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100"
            className="w-8 h-8 rounded-full"
            alt={`${user.name}'s avatar`}
          />
          <div className="ml-2">
            <div className="text-sm font-medium text-gray-800">{user.name}</div>
            <div className="text-xs text-gray-500">{user.email}</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
