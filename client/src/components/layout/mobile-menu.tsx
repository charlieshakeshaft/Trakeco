import { Link, useLocation } from "wouter";
import { User } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/contexts/auth-context";

interface MobileMenuProps {
  isOpen: boolean;
  user: User;
  onClose: () => void;
}

const MobileMenu = ({ isOpen, user, onClose }: MobileMenuProps) => {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      // Use the auth context logout function
      await logout();
      
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account",
      });
      
      // Navigate to login
      setLocation('/login');
    } catch (error) {
      console.error('Logout error:', error);
      setLocation('/login');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="md:hidden fixed inset-0 z-20 bg-black bg-opacity-50" onClick={onClose}>
      <div 
        className="absolute top-0 left-0 w-3/4 h-full bg-white shadow-lg transform transition-transform duration-300 ease-in-out"
        style={{ transform: isOpen ? 'translateX(0)' : 'translateX(-100%)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center mb-4">
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.username || "User")}&background=0D8ABC&color=fff&size=96`}
                alt={`${user.name || user.username}'s avatar`}
                className="w-12 h-12 rounded-full object-cover mr-3"
              />
              <div>
                <h3 className="font-semibold text-gray-800">{user.name || user.username}</h3>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
            <div className="bg-primary/10 rounded-lg p-3">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Points</span>
                <span className="text-sm font-semibold text-primary">{user.points_total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-700">Streak</span>
                <span className="text-sm font-semibold text-primary">{user.streak_count} days</span>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            <Link 
              href="/" 
              className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-100"
              onClick={onClose}
            >
              <span className="material-icons text-gray-600">dashboard</span>
              <span>Dashboard</span>
            </Link>
            <Link 
              href="/log-commute" 
              className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-100"
              onClick={onClose}
            >
              <span className="material-icons text-gray-600">directions_bike</span>
              <span>Log Commute</span>
            </Link>
            <Link 
              href="/challenges" 
              className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-100"
              onClick={onClose}
            >
              <span className="material-icons text-gray-600">emoji_events</span>
              <span>Challenges</span>
            </Link>
            <Link 
              href="/rewards" 
              className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-100"
              onClick={onClose}
            >
              <span className="material-icons text-gray-600">redeem</span>
              <span>Rewards</span>
            </Link>
            <Link 
              href="/leaderboard" 
              className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-100"
              onClick={onClose}
            >
              <span className="material-icons text-gray-600">leaderboard</span>
              <span>Leaderboard</span>
            </Link>
            <Link 
              href="/profile" 
              className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-100"
              onClick={onClose}
            >
              <span className="material-icons text-gray-600">person</span>
              <span>Profile</span>
            </Link>
            {user.role === 'admin' && (
              <Link 
                href="/company" 
                className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-100"
                onClick={onClose}
              >
                <span className="material-icons text-gray-600">business</span>
                <span>Company</span>
              </Link>
            )}
          </nav>

          <div className="p-4 border-t border-gray-200">
            <button 
              className="flex items-center w-full px-3 py-2 space-x-3 text-red-600 rounded-md hover:bg-red-50"
              onClick={(e) => {
                e.preventDefault();
                handleLogout();
              }}
            >
              <span className="material-icons">logout</span>
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;