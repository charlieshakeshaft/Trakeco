import { describe, it, expect, beforeAll, afterEach, afterAll, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from './test-utils';
import { server } from './mocks/api';
import { mockAdminUser, mockRegularUser, mockSoloUser, mockNewUser } from './test-utils';
import Dashboard from '../client/src/pages/dashboard';

// Start mock server before all tests
beforeAll(() => server.listen());
// Reset handlers between tests
afterEach(() => server.resetHandlers());
// Close server after all tests
afterAll(() => server.close());

describe('Dashboard Page', () => {
  describe('For admin users', () => {
    beforeEach(() => {
      render(<Dashboard />, { user: mockAdminUser });
    });

    it('should display CO2 savings widget', async () => {
      await waitFor(() => {
        expect(screen.getByText(/CO2 Saved/i)).toBeInTheDocument();
        expect(screen.getByText(/kg/i)).toBeInTheDocument();
      });
    });

    it('should display points widget', async () => {
      await waitFor(() => {
        expect(screen.getByText(/Points/i)).toBeInTheDocument();
        expect(screen.getByText(mockAdminUser.points_total.toString())).toBeInTheDocument();
      });
    });

    it('should display streak widget', async () => {
      await waitFor(() => {
        expect(screen.getByText(/Current Streak/i)).toBeInTheDocument();
        expect(screen.getByText(/weeks/i)).toBeInTheDocument();
      });
    });

    it('should display weekly commute summary', async () => {
      await waitFor(() => {
        expect(screen.getByText(/This Week's Commute/i)).toBeInTheDocument();
      });
    });

    it('should display invite team members button for admin', async () => {
      await waitFor(() => {
        expect(screen.getByText(/Invite Team Member/i)).toBeInTheDocument();
      });
    });

    it('should display company leaderboard', async () => {
      await waitFor(() => {
        expect(screen.getByText(/Leaderboard/i)).toBeInTheDocument();
      });
    });

    it('should display challenges section', async () => {
      await waitFor(() => {
        expect(screen.getByText(/Challenges/i)).toBeInTheDocument();
      });
    });

    it('should display rewards section', async () => {
      await waitFor(() => {
        expect(screen.getByText(/Rewards/i)).toBeInTheDocument();
      });
    });

    it('should display log commute button', async () => {
      await waitFor(() => {
        expect(screen.getByText(/Log Commute/i)).toBeInTheDocument();
      });
    });
  });

  describe('For regular users', () => {
    beforeEach(() => {
      render(<Dashboard />, { user: mockRegularUser });
    });

    it('should display all data widgets with correct user data', async () => {
      await waitFor(() => {
        expect(screen.getByText(/CO2 Saved/i)).toBeInTheDocument();
        expect(screen.getByText(/Points/i)).toBeInTheDocument();
        expect(screen.getByText(mockRegularUser.points_total.toString())).toBeInTheDocument();
      });
    });

    it('should NOT display invite team members button', async () => {
      await waitFor(() => {
        expect(screen.queryByText(/Invite Team Member/i)).not.toBeInTheDocument();
      });
    });

    it('should display company leaderboard', async () => {
      await waitFor(() => {
        expect(screen.getByText(/Leaderboard/i)).toBeInTheDocument();
      });
    });
  });

  describe('For solo users', () => {
    beforeEach(() => {
      render(<Dashboard />, { user: mockSoloUser });
    });

    it('should display data widgets', async () => {
      await waitFor(() => {
        expect(screen.getByText(/CO2 Saved/i)).toBeInTheDocument();
        expect(screen.getByText(/Points/i)).toBeInTheDocument();
        expect(screen.getByText(mockSoloUser.points_total.toString())).toBeInTheDocument();
      });
    });

    it('should NOT display company leaderboard or has alternative content', async () => {
      await waitFor(() => {
        // Either leaderboard is not present, or it shows a message that there's no company
        const leaderboardHeading = screen.queryByText(/Leaderboard/i);
        if (leaderboardHeading) {
          expect(screen.getByText(/join a company/i)).toBeInTheDocument();
        } else {
          expect(leaderboardHeading).not.toBeInTheDocument();
        }
      });
    });

    it('should display only system challenges', async () => {
      await waitFor(() => {
        expect(screen.getByText(/Challenges/i)).toBeInTheDocument();
        // We'd expect some text indicating these are system challenges
        // This might need to be adjusted based on actual implementation
      });
    });
  });

  describe('For new users', () => {
    beforeEach(() => {
      render(<Dashboard />, { user: mockNewUser });
    });

    it('should display welcome banner', async () => {
      await waitFor(() => {
        expect(screen.getByText(/Welcome to EcoCommute/i)).toBeInTheDocument();
      });
    });

    it('should display empty states for widgets with no data', async () => {
      await waitFor(() => {
        // CO2 Widget should show 0 or empty state
        const co2Widget = screen.getByText(/CO2 Saved/i).closest('div');
        expect(co2Widget).toHaveTextContent(/0|No data/i);
        
        // Points widget should show 0
        const pointsWidget = screen.getByText(/Points/i).closest('div');
        expect(pointsWidget).toHaveTextContent('0');
        
        // Streak widget should show 0
        const streakWidget = screen.getByText(/Current Streak/i).closest('div');
        expect(streakWidget).toHaveTextContent('0');
      });
    });

    it('should prompt to set up locations', async () => {
      await waitFor(() => {
        expect(screen.getByText(/set up your home and work locations/i)).toBeInTheDocument();
      });
    });
  });

  describe('Transport mode display in streak widget', () => {
    // We'd need more detailed mocks for this section
    // This is a placeholder for tests that would verify transport icons

    it('should display appropriate transport icons based on commute data', async () => {
      // This test would need mocks with specific commute data
      // to verify the icons are displayed correctly
    });
  });
});