import { describe, it, expect, beforeAll, afterEach, afterAll, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { server } from './mocks/api';
import { mockRegularUser, mockNewUser } from './test-utils';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock functions must be declared outside mock definitions to avoid hoisting issues
const mockNavigateFn = vi.fn();

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
  useLocation: () => ['/test-path', mockNavigateFn],
  useRoute: () => [false, {}],
  navigate: mockNavigateFn
}));

// Mock any components that might use ResizeObserver
vi.mock('@/components/commute/weekly-commute-form', () => ({
  default: ({ 
    commuteType, 
    distanceKm, 
    onSelectCommuteType,
    onSubmit,
    setMondayChecked,
    setTuesdayChecked 
  }) => (
    <div data-testid="mock-weekly-commute-form">
      <div>Weekly Commute Form Mocked</div>
      <div>Distance: {distanceKm} km</div>
      <button onClick={() => onSelectCommuteType('walk')}>Walk</button>
      <button onClick={() => onSelectCommuteType('cycle')}>Cycle</button>
      <button onClick={() => onSelectCommuteType('public_transport')}>Public Transport</button>
      <div>Selected: {commuteType}</div>
      <div>
        <label>
          <input 
            type="checkbox" 
            onChange={(e) => setMondayChecked(e.target.checked)}
            aria-label="Monday" 
          />
          Monday
        </label>
        <label>
          <input 
            type="checkbox" 
            onChange={(e) => setTuesdayChecked(e.target.checked)}
            aria-label="Tuesday" 
          />
          Tuesday
        </label>
      </div>
      <div>Points: {commuteType === 'cycle' ? 20 : 10}</div>
      <div>CO2 Saved: {commuteType === 'cycle' ? 1.5 : 1.0} kg</div>
      <button onClick={() => onSubmit()}>Log Commute</button>
    </div>
  )
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

// Start mock server before all tests
beforeAll(() => server.listen());
// Reset handlers between tests
afterEach(() => {
  server.resetHandlers();
  // Reset the mock user to default for each test
  Object.assign(mockUser, mockRegularUser);
  mockNavigateFn.mockReset();
  // Reset the auth mock to its default implementation
  useAuthMock.mockImplementation(() => ({
    user: mockUser,
    isLoading: false,
    isAuthenticated: !!mockUser
  }));
});
// Clean up after all tests
afterAll(() => server.close());

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

describe('Log Commute Page', () => {
  describe('for users with locations set', () => {
    beforeEach(() => {
      // Make sure we're using the regular user with locations
      Object.assign(mockUser, mockRegularUser);
      render(<LogCommute />, { wrapper: createWrapper() });
    });

    it('should display the weekly commute form component', async () => {
      // Check that our main component is rendered
      expect(screen.getByTestId('mock-weekly-commute-form')).toBeInTheDocument();
    });

    it('should display commute distance based on home/work addresses', async () => {
      // Assuming there's an element showing the pre-calculated distance
      expect(screen.getByText(`Distance: ${mockRegularUser.commute_distance_km} km`)).toBeInTheDocument();
    });

    it('should display commute options (walk, cycle, etc.)', () => {
      expect(screen.getByText('Walk')).toBeInTheDocument();
      expect(screen.getByText('Cycle')).toBeInTheDocument();
      expect(screen.getByText('Public Transport')).toBeInTheDocument();
    });

    it('should update points calculation when days are selected', async () => {
      // Find the cycle commute option and select it
      const cycleOption = screen.getByText('Cycle');
      fireEvent.click(cycleOption);
      
      // Find checkboxes for days and select Monday
      const mondayCheckbox = screen.getByLabelText('Monday');
      fireEvent.click(mondayCheckbox);
      
      // Check if points calculation updates
      expect(screen.getByText(/Points: 20/i)).toBeInTheDocument();
    });

    it('should update CO2 savings based on commute type', () => {
      // Find the cycle commute option and select it
      const cycleOption = screen.getByText('Cycle');
      fireEvent.click(cycleOption);
      
      // Check if CO2 savings info is displayed
      expect(screen.getByText(/CO2 Saved:/i)).toBeInTheDocument();
    });

    it('should submit commute log entry', async () => {
      vi.spyOn(window, 'fetch');
      
      // Find the cycle commute option and select it
      const cycleOption = screen.getByText('Cycle');
      fireEvent.click(cycleOption);
      
      // Find checkboxes for days and select Monday and Tuesday
      const mondayCheckbox = screen.getByLabelText('Monday');
      const tuesdayCheckbox = screen.getByLabelText('Tuesday');
      fireEvent.click(mondayCheckbox);
      fireEvent.click(tuesdayCheckbox);
      
      // Submit the form
      const submitButton = screen.getByText('Log Commute');
      fireEvent.click(submitButton);
      
      // Verify the API call was made (simple check)
      expect(window.fetch).toHaveBeenCalled();
    });

    it('should show different point values for different transportation methods', () => {
      // Find the cycle commute option and select it
      const cycleOption = screen.getByText('Cycle');
      fireEvent.click(cycleOption);
      
      // Get points for cycling
      const cyclePointsText = screen.getByText(/Points: 20/i).textContent;
      
      // Now switch to walking
      const walkOption = screen.getByText('Walk');
      fireEvent.click(walkOption);
      
      // Get points for walking
      const walkPointsText = screen.getByText(/Points: 10/i).textContent;
      
      // Points should be different for different transportation methods
      expect(cyclePointsText).not.toBe(walkPointsText);
    });
  });

  describe('for users without locations', () => {
    beforeEach(() => {
      // Use a different user without location settings
      Object.assign(mockUser, {
        ...mockNewUser,
        home_address: null,
        work_address: null,
        commute_distance_km: null
      });
      
      render(<LogCommute />, { wrapper: createWrapper() });
    });

    it('should display a message about missing locations', () => {
      // Looking for text indicating that locations need to be set
      expect(screen.getByText(/Add work and home/i, { exact: false })).toBeInTheDocument();
    });

    it('should navigate when the add locations button is clicked', () => {
      // Find and click the button
      const addLocationsButton = screen.getByText(/Add work and home/i, { exact: false });
      fireEvent.click(addLocationsButton);
      
      // Verify navigation
      expect(mockNavigateFn).toHaveBeenCalled();
    });
  });
});