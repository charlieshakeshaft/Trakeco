// This file provides mocks for the auth context used in testing

import { vi } from 'vitest';
import React from 'react';
import { User } from '../../client/src/lib/types';

// Create an actual context value that can be controlled
const createMockAuthContext = () => {
  return {
    user: null as User | null,
    isLoading: false,
    isAuthenticated: false,
    logout: vi.fn().mockImplementation(() => Promise.resolve()),
    setCurrentUser: vi.fn(),
  };
};

// Export the mock auth context value to be used in tests
export const mockAuthContextValue = createMockAuthContext();

// Create a mock for the client/src/contexts/auth-context.tsx module
vi.mock('../../client/src/contexts/auth-context', () => {
  const React = require('react');
  const authContext = React.createContext(mockAuthContextValue);
  
  return {
    AuthContext: authContext,
    AuthProvider: ({ children }: { children: React.ReactNode }) => children,
    useAuth: () => mockAuthContextValue,
  };
});