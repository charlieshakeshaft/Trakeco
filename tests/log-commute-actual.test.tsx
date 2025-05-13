import { describe, it, expect, beforeAll, afterEach, afterAll, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { mockRegularUser } from './test-utils';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { server } from './mocks/api';

// IMPORTANT: All mocks must be defined before importing the components that use them
// Create a mock for wouter
vi.mock('wouter', () => ({
  __esModule: true,
  default: ({ children }) => children,
  Link: ({ href, children }) => <a href={href} data-testid="mock-link">{children}</a>,
  Router: ({ children }) => children,
  Route: ({ children }) => children,
  Switch: ({ children }) => children,
  Redirect: () => null,
  useLocation: () => ['/test-path', vi.fn()],
  useRoute: () => [false, {}],
  navigate: vi.fn()
}));

// Mock any components that might use ResizeObserver
vi.mock('@/components/commute/weekly-commute-form-simple', () => ({
  default: () => <div data-testid="mock-weekly-commute-form">Weekly Commute Form Mocked</div>
}));

vi.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children }) => <div data-testid="mock-tabs">{children}</div>,
  TabsContent: ({ children }) => <div>{children}</div>,
  TabsList: ({ children }) => <div>{children}</div>,
  TabsTrigger: ({ children }) => <button>{children}</button>
}));

// Create a flexible mock for the auth context
const mockUser = { ...mockRegularUser };
const useAuthMock = vi.fn();
vi.mock('@/contexts/auth-context', () => ({
  useAuth: () => useAuthMock()
}));

// Default mock implementation
useAuthMock.mockImplementation(() => ({
  user: mockUser,
  isLoading: false,
  isAuthenticated: !!mockUser
}));

// Now it's safe to import the component that depends on these mocks
import LogCommute from '../client/src/pages/log-commute';

describe('LogCommute Page with Mocks', () => {
  // Start mock server before all tests
  beforeAll(() => server.listen());
  
  // Reset handlers between tests
  afterEach(() => {
    server.resetHandlers();
    // Reset mockUser to default for each test
    Object.assign(mockUser, mockRegularUser);
  });
  
  // Clean up after all tests
  afterAll(() => server.close());

  // Setup a fresh QueryClient for each test
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

  it('should render the page with user who has locations set', async () => {
    render(<LogCommute />, { wrapper: createWrapper() });
    
    // Check for the weekly commute form
    expect(screen.getByTestId('mock-weekly-commute-form')).toBeInTheDocument();
  });
  
  it('should handle user without location settings', async () => {
    // Modify the mock user to simulate missing location data
    Object.assign(mockUser, {
      ...mockRegularUser,
      home_address: null,
      work_address: null,
      commute_distance_km: null
    });
    
    render(<LogCommute />, { wrapper: createWrapper() });
    
    // Still should render the form component, even if empty
    expect(screen.getByTestId('mock-weekly-commute-form')).toBeInTheDocument();
  });
  
  it('should handle loading state', async () => {
    // Set up the mock to return loading state for this specific test
    useAuthMock.mockReturnValueOnce({
      user: null,
      isLoading: true,
      isAuthenticated: false
    });
    
    render(<LogCommute />, { wrapper: createWrapper() });
    
    // In a loading state, we should still find our component
    expect(screen.getByTestId('mock-weekly-commute-form')).toBeInTheDocument();
  });
});