import React, { createContext, useContext } from 'react';
import { queryClient } from '@/lib/queryClient';
import { User } from '@/lib/types';
import { useQuery } from '@tanstack/react-query';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  // Deprecated: Use query invalidation instead
  setCurrentUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Use tanstack query for data fetching and caching
  const { data: user, isLoading, refetch } = useQuery({
    queryKey: ['/api/auth/user'],
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes 
  });
  
  // Navigate directly to Replit auth logout endpoint
  const logout = async () => {
    try {
      // Redirect to logout endpoint
      window.location.href = '/api/logout';
      // Clear query cache
      queryClient.clear();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Deprecated setCurrentUser function, use query invalidation instead
  const setCurrentUser = (updatedUser: User) => {
    console.warn('setCurrentUser is deprecated. Use query invalidation instead.');
    // Invalidate the user query which will trigger a refetch
    queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
  };

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
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