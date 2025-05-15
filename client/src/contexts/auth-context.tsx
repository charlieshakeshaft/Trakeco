import React, { createContext, useContext } from 'react';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { User } from '@/lib/types';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  // Backward compatibility
  setCurrentUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  
  const { data: user, isLoading, refetch } = useQuery({
    queryKey: ['/api/user'],
    retry: false,
    staleTime: 5 * 60 * 1000
  });
  
  const login = async (username: string, password: string): Promise<User> => {
    try {
      // For debugging only - record what time login was attempted
      console.log("Login attempt:", { username, timestamp: new Date().toISOString() });
      
      // Make the login request
      const response = await apiRequest("/api/auth/login", { username, password }, "POST");
      console.log("Login API response (success):", response);
      
      // Store auth token in localStorage for cross-session compatibility
      if (response.authToken) {
        localStorage.setItem('authToken', JSON.stringify(response.authToken));
        console.log("Auth token stored in localStorage");
      }
      
      // Clear all cached data to ensure fresh state
      queryClient.clear();
      
      // Put user in the cache for immediate UI updates
      queryClient.setQueryData(['/api/user'], response);
      
      // Mark a successful login in localStorage to help with navigation
      localStorage.setItem('login_success', 'true');
      localStorage.setItem('login_timestamp', new Date().toISOString());
      
      // Use hard page navigation for maximum reliability (even if less smooth)
      // We want to prioritize reliability over UX for now
      setTimeout(() => {
        // Use replace instead of href to avoid history issues
        window.location.replace('/');
      }, 500);
      
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };
  
  const logout = async () => {
    try {
      await apiRequest("/api/auth/logout", null, "POST");
      queryClient.clear();
      // Use client-side navigation instead of page reload
      setLocation('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        variant: "destructive",
        title: "Logout failed",
        description: "There was a problem logging out. Please try again."
      });
    }
  };

  // Function to refresh user data
  const refreshUser = async () => {
    try {
      await refetch();
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };
  
  // For backward compatibility
  const setCurrentUser = (updatedUser: User) => {
    console.warn('setCurrentUser is deprecated. Use query invalidation instead.');
    queryClient.invalidateQueries({ queryKey: ['/api/user'] });
  };

  return (
    <AuthContext.Provider
      value={{
        user: user as User | null,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser,
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