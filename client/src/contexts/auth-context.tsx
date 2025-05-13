import React, { createContext, useContext } from 'react';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { User } from '@/lib/types';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  // Backward compatibility
  setCurrentUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  
  const { data: user, isLoading, refetch } = useQuery({
    queryKey: ['/api/user'],
    retry: false,
    staleTime: 5 * 60 * 1000,
    onError: () => {
      // Silent failure on auth errors
      console.log('Failed to fetch user - not authenticated');
    }
  });
  
  const login = async (username: string, password: string): Promise<User> => {
    try {
      const response = await apiRequest("/api/login", { username, password }, "POST");
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };
  
  const logout = async () => {
    try {
      await apiRequest("/api/logout", null, "POST");
      queryClient.clear();
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        variant: "destructive",
        title: "Logout failed",
        description: "There was a problem logging out. Please try again."
      });
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