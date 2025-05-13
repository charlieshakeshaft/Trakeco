import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Redirect all imports for auth-context
vi.mock('../client/src/contexts/auth-context', () => {
  return {
    useAuth: () => ({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      logout: vi.fn(),
      setCurrentUser: vi.fn()
    }),
    AuthProvider: ({ children }: { children: React.ReactNode }) => children
  };
});

// Cleanup after each test case (e.g., clearing jsdom)
afterEach(() => {
  cleanup();
});