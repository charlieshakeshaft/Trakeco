import { describe, it, expect, beforeAll, afterEach, afterAll, beforeEach } from 'vitest';
import { render, screen, waitFor } from './test-utils';
import { server } from './mocks/api';
import { mockRegularUser, mockSoloUser } from './test-utils';
import Leaderboard from '../client/src/pages/leaderboard';

// Start mock server before all tests
beforeAll(() => server.listen());
// Reset handlers between tests
afterEach(() => server.resetHandlers());
// Close server after all tests
afterAll(() => server.close());

describe('Leaderboard Page', () => {
  describe('For company users', () => {
    beforeEach(() => {
      render(<Leaderboard />, { user: mockRegularUser });
    });

    it('should display leaderboard title with company name', async () => {
      await waitFor(() => {
        expect(screen.getByText(new RegExp(`${mockRegularUser.company.name}\\s*Leaderboard`, 'i'))).toBeInTheDocument();
      });
    });

    it('should display list of users ranked by points', async () => {
      await waitFor(() => {
        // Expecting "Admin User" to be ranked #1
        expect(screen.getByText(/Admin User/i)).toBeInTheDocument();
        expect(screen.getByText(/150 pts/i)).toBeInTheDocument();
        
        // Expecting "Regular User" to be ranked #2
        expect(screen.getByText(/Regular User/i)).toBeInTheDocument();
        expect(screen.getByText(/75 pts/i)).toBeInTheDocument();
      });
    });

    it('should highlight the current user in the leaderboard', async () => {
      await waitFor(() => {
        // Find the row with the current user
        const userRow = screen.getByText(mockRegularUser.name).closest('div');
        // Check if it has a highlight style
        expect(userRow).toHaveClass('bg-blue-50');
      });
    });

    it('should display rank numbers next to users', async () => {
      await waitFor(() => {
        // Check for rank numbers
        expect(screen.getByText('#1')).toBeInTheDocument();
        expect(screen.getByText('#2')).toBeInTheDocument();
      });
    });

    it('should display badges or special indicators for top performers', async () => {
      await waitFor(() => {
        // Top performer should have a special badge
        const topUserRow = screen.getByText(/Admin User/i).closest('div');
        const badge = topUserRow?.querySelector('.badge');
        expect(badge).toBeInTheDocument();
      });
    });
  });

  describe('For solo users', () => {
    beforeEach(() => {
      render(<Leaderboard />, { user: mockSoloUser });
    });

    it('should display alternative content for solo users', async () => {
      await waitFor(() => {
        // Should show a message about not being part of a company
        expect(screen.getByText(/You are not part of a company/i)).toBeInTheDocument();
      });
    });

    it('should display join company option or invitation info', async () => {
      await waitFor(() => {
        // Should show information about joining a company
        expect(screen.getByText(/join a company/i)).toBeInTheDocument();
      });
    });

    it('should not display company-specific leaderboard', async () => {
      await waitFor(() => {
        // Should not show "Company Leaderboard" heading
        expect(screen.queryByText(/Company Leaderboard/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Visualizations', () => {
    beforeEach(() => {
      render(<Leaderboard />, { user: mockRegularUser });
    });

    it('should display points bars with appropriate lengths', async () => {
      await waitFor(() => {
        // Find the bars representing points
        const pointsBars = document.querySelectorAll('.points-bar');
        
        // We should have at least 2 users
        expect(pointsBars.length).toBeGreaterThanOrEqual(2);
        
        // First bar (150pts) should be longer than second bar (75pts)
        const firstBarWidth = pointsBars[0]?.getBoundingClientRect().width;
        const secondBarWidth = pointsBars[1]?.getBoundingClientRect().width;
        
        expect(firstBarWidth).toBeGreaterThan(secondBarWidth);
      });
    });

    it('should display appropriate CO2 saved data', async () => {
      await waitFor(() => {
        // Check if CO2 saved information is displayed
        expect(screen.getByText(/CO2 Saved/i)).toBeInTheDocument();
      });
    });
  });
});