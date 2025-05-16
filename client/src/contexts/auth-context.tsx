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
      
      // Store transition state in localStorage so we can detect and show a loading screen
      localStorage.setItem('auth_transition', 'login');
      
      // Make the login request - supports both endpoint formats
      const response = await apiRequest("/api/login", { username, password }, "POST");
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
      
      // Try client-side navigation first
      try {
        setLocation('/');
        
        // Use a fallback hard navigation for reliability after a delay
        // This ensures we still get reliable auth even if the client navigation fails
        setTimeout(() => {
          if (window.location.pathname !== '/') {
            console.log("Client navigation seems to have failed, using fallback");
            window.location.replace('/');
          }
        }, 300);
      } catch (navError) {
        console.error("Navigation error:", navError);
        // Fallback to hard navigation
        window.location.replace('/');
      }
      
      return response;
    } catch (error) {
      // Clear transition state
      localStorage.removeItem('auth_transition');
      console.error('Login error:', error);
      throw error;
    }
  };
  
  const logout = async () => {
    try {
      console.log("Logout attempt at:", new Date().toISOString());
      
      // Set transition state for smoother UX
      localStorage.setItem('auth_transition', 'logout');
      
      // First clear local storage items that might be keeping the user logged in
      localStorage.removeItem('authToken');
      localStorage.removeItem('login_success');
      localStorage.removeItem('login_timestamp');
      
      // Update UI state immediately
      queryClient.setQueryData(['/api/user'], null);
      
      // Then make the server request
      await apiRequest("/api/logout", null, "POST");
      console.log("Logout API response successful");
      
      // Clear all cache data
      queryClient.clear();
      
      // Try client-side navigation first
      try {
        setLocation('/login');
        
        // Use a fallback hard navigation for reliability after a delay
        setTimeout(() => {
          if (window.location.pathname !== '/login') {
            console.log("Client navigation seems to have failed, using fallback");
            window.location.replace('/login?loggedout=true');
          }
        }, 300);
      } catch (navError) {
        console.error("Navigation error:", navError);
        // Fallback to hard navigation
        window.location.replace('/login?loggedout=true');
      }
    } catch (error) {
      console.error('Logout error:', error);
      
      // Clear transition state
      localStorage.removeItem('auth_transition');
      
      // Even if server logout fails, try to clear local state
      queryClient.clear();
      queryClient.setQueryData(['/api/user'], null);
      
      toast({
        variant: "destructive",
        title: "Logout failed",
        description: "There was a problem logging out. Please try again."
      });
      
      // As a last resort, force navigation
      setTimeout(() => {
        window.location.replace('/login?loggedout=true&error=true');
      }, 1000);
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