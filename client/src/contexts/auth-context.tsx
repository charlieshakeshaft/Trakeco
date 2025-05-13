import React, { createContext, useContext, useState, useEffect } from 'react';
import { queryClient } from '@/lib/queryClient';
import { User } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  setCurrentUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const fetchUser = async () => {
      try {
        // First, check localStorage for cached user data
        const cachedUser = localStorage.getItem('currentUser');
        if (cachedUser) {
          try {
            const parsedUser = JSON.parse(cachedUser);
            console.log('User data from localStorage:', parsedUser);
            setUser(parsedUser);
          } catch (e) {
            console.error('Error parsing cached user:', e);
          }
        }
        
        // Then try to get from the server
        const response = await fetch('/api/user/profile');
        if (response.ok) {
          const userData = await response.json();
          console.log('User data from profile API:', userData);
          setUser(userData);
          localStorage.setItem('currentUser', JSON.stringify(userData));
        } else {
          console.log('Not authenticated:', await response.text());
          // Only clear user if we don't have cached data
          if (!cachedUser) {
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        // Don't clear user if there's an error and we have cached data
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      queryClient.clear();
      setUser(null);
      localStorage.removeItem('currentUser');
    } catch (error) {
      console.error('Logout error:', error);
      // Still reset user state even if API call fails
      setUser(null);
    }
  };

  const setCurrentUser = (userData: User | null) => {
    console.log("Setting current user:", userData);
    setUser(userData);
    
    // Store in local state as a backup mechanism
    if (userData) {
      localStorage.setItem('currentUser', JSON.stringify(userData));
    } else {
      localStorage.removeItem('currentUser');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        logout,
        setCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}