import React, { createContext, useContext } from 'react';
import { queryClient } from '@/lib/queryClient';
import { User } from '@/lib/types';
import { useQuery } from '@tanstack/react-query';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  // Backward compatibility
  setCurrentUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = useQuery({
    queryKey: ['/api/auth/user'],
    retry: false,
    staleTime: 5 * 60 * 1000,
    onError: () => {
      // Silent failure on auth errors
      console.log('Failed to fetch user - not authenticated');
    }
  });
  
  const logout = async () => {
    try {
      window.location.href = '/api/logout';
      queryClient.clear();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // For backward compatibility
  const setCurrentUser = (updatedUser: User) => {
    console.warn('setCurrentUser is deprecated. Use query invalidation instead.');
    queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
  };

  return (
    <AuthContext.Provider
      value={{
        user: user as User | null,
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