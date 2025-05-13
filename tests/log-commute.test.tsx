import { describe, it, expect, beforeAll, afterEach, afterAll, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from './test-utils';
import { server } from './mocks/api';
import { mockRegularUser, mockNewUser } from './test-utils';
import LogCommute from '../client/src/pages/log-commute';
import React from 'react';

// Mock wouter's Link component which is used in the LogCommute component
vi.mock('wouter', () => {
  return {
    __esModule: true,
    default: vi.fn(),
    Router: ({ children }) => children,
    Route: ({ children }) => children,
    Link: ({ href, children }) => {
      return <a href={href}>{children}</a>;
    },
    useLocation: () => ['/test-path', vi.fn()],
    useRoute: () => [false, {}],
    navigate: vi.fn(),
    Switch: ({ children }) => children,
    Redirect: () => null,
  };
});

// Start mock server before all tests
beforeAll(() => server.listen());
// Reset handlers between tests
afterEach(() => server.resetHandlers());
// Close server after all tests
afterAll(() => server.close());

describe('Log Commute Page', () => {
  describe('for users with locations set', () => {
    beforeEach(() => {
      render(<LogCommute />, { user: mockRegularUser });
    });

    it('should display commute distance based on home/work addresses', async () => {
      await waitFor(() => {
        // Assuming there's an element showing the pre-calculated distance
        expect(screen.getByText(new RegExp(`${mockRegularUser.commute_distance_km}\\s*km`, 'i'))).toBeInTheDocument();
      });
    });

    it('should display commute options (walk, cycle, etc.)', async () => {
      await waitFor(() => {
        expect(screen.getByText(/Walk/i)).toBeInTheDocument();
        expect(screen.getByText(/Cycle/i)).toBeInTheDocument();
        expect(screen.getByText(/Public Transport/i)).toBeInTheDocument();
      });
    });

    it('should display tabs for current and previous week', async () => {
      await waitFor(() => {
        expect(screen.getByText(/This Week/i)).toBeInTheDocument();
        expect(screen.getByText(/Last Week/i)).toBeInTheDocument();
      });
    });

    it('should update points calculation when days are selected', async () => {
      await waitFor(() => {
        // Find the cycle commute option and select it
        const cycleOption = screen.getByText(/Cycle/i);
        fireEvent.click(cycleOption);
        
        // Find checkboxes for days and select Monday
        const mondayCheckbox = screen.getByLabelText(/Monday/i);
        fireEvent.click(mondayCheckbox);
        
        // Check if points calculation updates
        expect(screen.getByText(/Points:/i)).toBeInTheDocument();
      });
    });

    it('should update CO2 savings based on commute type', async () => {
      await waitFor(() => {
        // Find the cycle commute option and select it
        const cycleOption = screen.getByText(/Cycle/i);
        fireEvent.click(cycleOption);
        
        // Check if CO2 savings info is displayed
        expect(screen.getByText(/CO2 Saved:/i)).toBeInTheDocument();
      });
    });

    it('should submit commute log entry', async () => {
      vi.spyOn(window, 'fetch');
      
      await waitFor(() => {
        // Find the cycle commute option and select it
        const cycleOption = screen.getByText(/Cycle/i);
        fireEvent.click(cycleOption);
        
        // Find checkboxes for days and select Monday and Tuesday
        const mondayCheckbox = screen.getByLabelText(/Monday/i);
        const tuesdayCheckbox = screen.getByLabelText(/Tuesday/i);
        fireEvent.click(mondayCheckbox);
        fireEvent.click(tuesdayCheckbox);
        
        // Submit the form
        const submitButton = screen.getByText(/Log Commute/i);
        fireEvent.click(submitButton);
      });
      
      // Verify the API call was made
      await waitFor(() => {
        expect(window.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/commutes'),
          expect.objectContaining({
            method: 'POST'
          })
        );
      });
    });

    it('should show different point values for different transportation methods', async () => {
      let cyclePoints = '';
      let walkPoints = '';
      
      await waitFor(() => {
        // Find the cycle commute option and select it
        const cycleOption = screen.getByText(/Cycle/i);
        fireEvent.click(cycleOption);
        
        // Find checkboxes for days and select Monday
        const mondayCheckbox = screen.getByLabelText(/Monday/i);
        fireEvent.click(mondayCheckbox);
        
        // Get points for cycling
        const pointsText = screen.getByText(/Points:/i).textContent || '';
        cyclePoints = pointsText.match(/\d+/)?.[0] || '';
      });
      
      // Now switch to walking
      fireEvent.click(screen.getByText(/Walk/i));
      
      await waitFor(() => {
        // Get points for walking
        const pointsText = screen.getByText(/Points:/i).textContent || '';
        walkPoints = pointsText.match(/\d+/)?.[0] || '';
        
        // Points should be different for different transportation methods
        expect(cyclePoints).not.toBe(walkPoints);
      });
    });
  });

  describe('for users without locations', () => {
    beforeEach(() => {
      render(<LogCommute />, { user: mockNewUser });
    });

    it('should display "Add work and home" button', async () => {
      await waitFor(() => {
        expect(screen.getByText(/Add work and home/i)).toBeInTheDocument();
      });
    });

    it('should navigate to profile settings when button is clicked', async () => {
      const mockNavigate = vi.fn();
      vi.mock('wouter', () => ({
        useLocation: () => ['/log-commute', mockNavigate]
      }));
      
      // Find and click the button
      const addLocationsButton = await screen.findByText(/Add work and home/i);
      fireEvent.click(addLocationsButton);
      
      // Verify navigation
      expect(mockNavigate).toHaveBeenCalledWith('/profile');
    });

    it('should disable or show message until locations are set', async () => {
      await waitFor(() => {
        // Look for disabled state of form or message about missing locations
        const commuteForm = screen.queryByText(/Select Your Commute Type/i);
        
        if (commuteForm) {
          // If form is displayed, it should be disabled
          const submitButton = screen.getByText(/Log Commute/i);
          expect(submitButton).toBeDisabled();
        } else {
          // If form is not displayed, there should be a message
          expect(screen.getByText(/set up your home and work locations/i)).toBeInTheDocument();
        }
      });
    });
  });
});