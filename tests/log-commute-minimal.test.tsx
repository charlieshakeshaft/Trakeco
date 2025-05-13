import { describe, it, expect, beforeAll, afterEach, afterAll, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { mockRegularUser } from './test-utils';

// Setup mock users for different scenarios
const mockUserWithLocations = {
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
};

const mockUserWithoutLocations = {
  id: 2,
  username: 'newuser',
  email: 'new@example.com',
  name: 'New User',
  password: 'password123',
  company_id: 1,
  points_total: 0,
  streak_count: 0,
  role: 'user',
  created_at: new Date(),
  home_address: null,
  home_latitude: null,
  home_longitude: null,
  work_address: null,
  work_latitude: null,
  work_longitude: null,
  commute_distance_km: null,
  is_new_user: true,
  needs_password_change: false
};

// Create a mock implementation that can be changed between tests
const mockAuthFn = vi.fn();

// Mock all dependencies BEFORE importing the component
vi.mock('@/contexts/auth-context', () => ({
  useAuth: () => mockAuthFn()
}));

// Create a navigate mock that can be accessed in tests  
const navigateFn = vi.fn();

// Mock wouter
vi.mock('wouter', () => ({
  Link: ({ href, children }) => <a href={href}>{children}</a>,
  Router: ({ children }) => <div>{children}</div>,
  Route: ({ children }) => <div>{children}</div>,
  Switch: ({ children }) => <div>{children}</div>,
  Redirect: () => null,
  useLocation: () => ['/test-path', navigateFn],
  useRoute: () => [false, {}],
  navigate: navigateFn
}));

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

describe('LogCommute Component Tests', () => {
  // Create a wrapper with QueryClient for all tests
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

  // Reset any previous configurations
  vi.resetAllMocks();
  
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    navigateFn.mockReset();
  });
  
  describe('User With Locations', () => {
    beforeEach(() => {
      // Setup auth mock for user with locations
      mockAuthFn.mockReturnValue({
        user: mockUserWithLocations,
        isLoading: false,
        isAuthenticated: true
      });
    });
    
    it('should render the weekly commute form for users with locations', () => {
      render(<LogCommute />, { wrapper: createWrapper() });
      
      // Check that the form is rendered
      expect(screen.getByTestId('mock-weekly-commute-form-simple')).toBeInTheDocument();
      
      // Check the page title is present
      expect(screen.getByText('Log Your Commute')).toBeInTheDocument();
      
      // Check that commute type info is shown
      expect(screen.getByText('Walking')).toBeInTheDocument();
      expect(screen.getByText('Cycling')).toBeInTheDocument();
      expect(screen.getByText('Public Transport')).toBeInTheDocument();
    });
  });
  
  describe('User Without Locations', () => {
    beforeEach(() => {
      // Setup auth mock for user without locations
      mockAuthFn.mockReturnValue({
        user: mockUserWithoutLocations,
        isLoading: false,
        isAuthenticated: true
      });
    });
    
    it('should display a message about adding location info', () => {
      render(<LogCommute />, { wrapper: createWrapper() });
      
      // Form should not be rendered
      expect(screen.queryByTestId('mock-weekly-commute-form-simple')).not.toBeInTheDocument();
      
      // Message about adding locations should be displayed
      expect(screen.getByText(/Add work and home/i)).toBeInTheDocument();
    });
    
    it('should navigate to profile page when add locations button is clicked', () => {
      render(<LogCommute />, { wrapper: createWrapper() });
      
      // Find and click the add locations button
      const addLocationsButton = screen.getByRole('button', { name: /Add work and home/i });
      addLocationsButton.click();
      
      // Check that navigate was called with correct path
      expect(navigateFn).toHaveBeenCalledWith('/profile');
    });
  });
  
  describe('Loading State', () => {
    beforeEach(() => {
      // Setup auth mock for loading state
      mockAuthFn.mockReturnValue({
        user: null,
        isLoading: true,
        isAuthenticated: false
      });
    });
    
    it('should display loading indicator while authentication is loading', () => {
      render(<LogCommute />, { wrapper: createWrapper() });
      
      // Form should not be rendered
      expect(screen.queryByTestId('mock-weekly-commute-form-simple')).not.toBeInTheDocument();
      
      // Loading indicator should be displayed
      expect(screen.getByText(/Loading/i)).toBeInTheDocument();
    });
  });
});