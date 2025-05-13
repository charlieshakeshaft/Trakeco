import { describe, it, expect, beforeAll, afterEach, afterAll, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { mockRegularUser } from './test-utils';

// Mock all dependencies BEFORE importing the component
vi.mock('@/contexts/auth-context', () => ({
  useAuth: () => ({
    user: {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      name: 'Test User',
      password: 'password123',
      company_id: 1,
      points_total: 50,
      streak_count: 3,
      role: 'user',
      created_at: new Date(),
      home_address: '123 Home St',
      home_latitude: '45.0',
      home_longitude: '-73.0',
      work_address: '456 Work Ave',
      work_latitude: '45.1',
      work_longitude: '-73.1',
      commute_distance_km: 5,
      is_new_user: false,
      needs_password_change: false
    },
    isLoading: false,
    isAuthenticated: true
  })
}));

// Mock wouter
vi.mock('wouter', () => {
  const navigate = vi.fn();
  return {
    Link: ({ href, children }) => <a href={href}>{children}</a>,
    Router: ({ children }) => <div>{children}</div>,
    Route: ({ children }) => <div>{children}</div>,
    Switch: ({ children }) => <div>{children}</div>,
    Redirect: () => null,
    useLocation: () => ['/test-path', navigate],
    useRoute: () => [false, {}],
    navigate
  };
});

// Mock components that use ResizeObserver
vi.mock('@/components/commute/weekly-commute-form', () => ({
  default: () => <div data-testid="mock-weekly-commute-form">Weekly Commute Form Mocked</div>
}));

vi.mock('@/components/commute/weekly-commute-form-simple', () => ({
  default: () => <div data-testid="mock-weekly-commute-form-simple">Weekly Commute Form Simple Mocked</div>
}));

vi.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children }) => <div data-testid="mock-tabs">{children}</div>,
  TabsContent: ({ children }) => <div>{children}</div>,
  TabsList: ({ children }) => <div>{children}</div>,
  TabsTrigger: ({ children }) => <button>{children}</button>
}));

// Only import the component AFTER all mocks are defined
import LogCommute from '../client/src/pages/log-commute';

describe('LogCommute Minimal Test', () => {
  // Create a wrapper with QueryClient
  const createWrapper = () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false }
      }
    });
    return ({ children }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
  
  it('should render the component without errors', () => {
    render(<LogCommute />, { wrapper: createWrapper() });
    
    // Basic checks
    expect(screen.getByTestId('mock-weekly-commute-form-simple')).toBeInTheDocument();
  });
});