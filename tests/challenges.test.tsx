import { describe, it, expect, beforeAll, afterEach, afterAll, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from './test-utils';
import { server } from './mocks/api';
import { mockAdminUser, mockRegularUser } from './test-utils';
import Challenges from '../client/src/pages/challenges';

// Start mock server before all tests
beforeAll(() => server.listen());
// Reset handlers between tests
afterEach(() => server.resetHandlers());
// Close server after all tests
afterAll(() => server.close());

describe('Challenges Page', () => {
  describe('For regular users', () => {
    beforeEach(() => {
      render(<Challenges />, { user: mockRegularUser });
    });

    it('should display list of available challenges', async () => {
      await waitFor(() => {
        expect(screen.getByText(/Cycle Challenge/i)).toBeInTheDocument();
      });
    });

    it('should display challenge details', async () => {
      await waitFor(() => {
        expect(screen.getByText(/Cycle at least 50km this month/i)).toBeInTheDocument();
        expect(screen.getByText(/100 Points/i)).toBeInTheDocument();
      });
    });

    it('should display progress information for joined challenges', async () => {
      await waitFor(() => {
        // Expect progress bar or percentage
        const progressElement = screen.getByText(/Progress/i)?.closest('div');
        expect(progressElement).toBeInTheDocument();
        expect(progressElement).toHaveTextContent(/25/i); // 25% progress
      });
    });

    it('should have join button for unjoined challenges', async () => {
      // This test would need a mock for an unjoined challenge
      // The current mock setup only has one joined challenge
    });

    it('should not display create challenge button for non-admin users', async () => {
      await waitFor(() => {
        expect(screen.queryByText(/Create Challenge/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('For admin users', () => {
    beforeEach(() => {
      render(<Challenges />, { user: mockAdminUser });
    });

    it('should display create challenge button', async () => {
      await waitFor(() => {
        expect(screen.getByText(/Create Challenge/i)).toBeInTheDocument();
      });
    });

    it('should open create challenge form when button is clicked', async () => {
      // Wait for the button to be rendered
      const createButton = await screen.findByText(/Create Challenge/i);
      
      // Click the button
      fireEvent.click(createButton);
      
      // Check if form appears
      await waitFor(() => {
        expect(screen.getByText(/Create New Challenge/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
      });
    });

    it('should display challenge management controls', async () => {
      await waitFor(() => {
        // Admin should see edit/delete controls for challenges
        expect(screen.getByText(/Edit/i) || screen.getByLabelText(/Edit/i)).toBeInTheDocument();
        expect(screen.getByText(/Delete/i) || screen.getByLabelText(/Delete/i)).toBeInTheDocument();
      });
    });

    it('should open edit form when edit button is clicked', async () => {
      await waitFor(() => {
        // Find the edit button and click it
        const editButton = screen.getByText(/Edit/i) || screen.getByLabelText(/Edit/i);
        fireEvent.click(editButton);
        
        // Check if edit form appears
        expect(screen.getByText(/Edit Challenge/i)).toBeInTheDocument();
        
        // Form should be pre-filled with challenge data
        const titleInput = screen.getByLabelText(/Title/i);
        expect(titleInput).toHaveValue('Cycle Challenge');
      });
    });

    it('should confirm before deleting a challenge', async () => {
      vi.spyOn(window, 'confirm').mockImplementation(() => true);
      
      await waitFor(() => {
        // Find the delete button and click it
        const deleteButton = screen.getByText(/Delete/i) || screen.getByLabelText(/Delete/i);
        fireEvent.click(deleteButton);
        
        // Check if confirmation was requested
        expect(window.confirm).toHaveBeenCalled();
      });
    });
  });

  describe('Challenge card visuals', () => {
    beforeEach(() => {
      render(<Challenges />, { user: mockRegularUser });
    });

    it('should display appropriate icons based on challenge type', async () => {
      await waitFor(() => {
        // For a cycling challenge, should show cycling icon
        const challengeCard = screen.getByText(/Cycle Challenge/i).closest('div');
        const cycleIcon = challengeCard?.querySelector('svg'); // This would need to be adjusted based on how icons are implemented
        expect(cycleIcon).toBeInTheDocument();
      });
    });

    it('should display appropriate progress visualization', async () => {
      await waitFor(() => {
        // Should show progress bar or similar visualization
        const progressBar = screen.getByRole('progressbar');
        expect(progressBar).toBeInTheDocument();
        
        // Progress should match the expected value (25%)
        expect(progressBar).toHaveAttribute('aria-valuenow', '25');
      });
    });
  });
});