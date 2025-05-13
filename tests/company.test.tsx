import { describe, it, expect, beforeAll, afterEach, afterAll, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from './test-utils';
import { server } from './mocks/api';
import { mockAdminUser, mockRegularUser, mockSoloUser } from './test-utils';
import Company from '../client/src/pages/company';

// Start mock server before all tests
beforeAll(() => server.listen());
// Reset handlers between tests
afterEach(() => server.resetHandlers());
// Close server after all tests
afterAll(() => server.close());

describe('Company Page', () => {
  describe('For admin users', () => {
    beforeEach(() => {
      render(<Company />, { user: mockAdminUser });
    });

    it('should display company details', async () => {
      await waitFor(() => {
        expect(screen.getByText(mockAdminUser.company.name)).toBeInTheDocument();
        expect(screen.getByText(mockAdminUser.company.domain)).toBeInTheDocument();
      });
    });

    it('should display team members list', async () => {
      await waitFor(() => {
        expect(screen.getByText(/Team Members/i)).toBeInTheDocument();
        expect(screen.getByText(/Admin User/i)).toBeInTheDocument();
        expect(screen.getByText(/Regular User/i)).toBeInTheDocument();
      });
    });

    it('should display invite member button', async () => {
      await waitFor(() => {
        expect(screen.getByText(/Invite Member/i)).toBeInTheDocument();
      });
    });

    it('should open invite form when button is clicked', async () => {
      // Find and click invite button
      const inviteButton = await screen.findByText(/Invite Member/i);
      fireEvent.click(inviteButton);
      
      await waitFor(() => {
        // Check if form appears
        expect(screen.getByText(/Invite Team Member/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
      });
    });

    it('should submit invite form with valid data', async () => {
      vi.spyOn(window, 'fetch');
      
      // Find and click invite button
      const inviteButton = await screen.findByText(/Invite Member/i);
      fireEvent.click(inviteButton);
      
      await waitFor(() => {
        // Fill out form fields
        const nameInput = screen.getByLabelText(/Name/i);
        const emailInput = screen.getByLabelText(/Email/i);
        
        fireEvent.change(nameInput, { target: { value: 'New User' } });
        fireEvent.change(emailInput, { target: { value: 'newuser@example.com' } });
        
        // Submit the form
        const submitButton = screen.getByText(/Send Invitation/i);
        fireEvent.click(submitButton);
      });
      
      // Verify API call
      await waitFor(() => {
        expect(window.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/company/invite'),
          expect.objectContaining({
            method: 'POST',
            body: expect.stringContaining('newuser@example.com')
          })
        );
      });
    });

    it('should display admin controls for team members', async () => {
      await waitFor(() => {
        // Admin should be able to manage members
        expect(screen.getByText(/Manage/i) || screen.getByLabelText(/Manage/i)).toBeInTheDocument();
      });
    });
  });

  describe('For regular company users', () => {
    beforeEach(() => {
      render(<Company />, { user: mockRegularUser });
    });

    it('should display company details', async () => {
      await waitFor(() => {
        expect(screen.getByText(mockRegularUser.company.name)).toBeInTheDocument();
        expect(screen.getByText(mockRegularUser.company.domain)).toBeInTheDocument();
      });
    });

    it('should display team members list', async () => {
      await waitFor(() => {
        expect(screen.getByText(/Team Members/i)).toBeInTheDocument();
        expect(screen.getAllByText(/Admin User|Regular User/i).length).toBeGreaterThanOrEqual(2);
      });
    });

    it('should not display admin controls', async () => {
      await waitFor(() => {
        // Regular user should not see admin controls
        expect(screen.queryByText(/Invite Member/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Manage/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('For solo users', () => {
    beforeEach(() => {
      render(<Company />, { user: mockSoloUser });
    });

    it('should display solo user message', async () => {
      await waitFor(() => {
        expect(screen.getByText(/You are not part of a company/i)).toBeInTheDocument();
      });
    });

    it('should display company creation option', async () => {
      await waitFor(() => {
        expect(screen.getByText(/Create Company/i)).toBeInTheDocument();
      });
    });

    it('should open company creation form when button is clicked', async () => {
      // Find and click create button
      const createButton = await screen.findByText(/Create Company/i);
      fireEvent.click(createButton);
      
      await waitFor(() => {
        // Check if form appears
        expect(screen.getByText(/Create New Company/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Company Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Company Domain/i)).toBeInTheDocument();
      });
    });

    it('should display join existing company option', async () => {
      await waitFor(() => {
        expect(screen.getByText(/Join Existing Company/i)).toBeInTheDocument();
      });
    });
  });

  describe('Company statistics', () => {
    beforeEach(() => {
      render(<Company />, { user: mockAdminUser });
    });

    it('should display company-wide CO2 savings', async () => {
      await waitFor(() => {
        expect(screen.getByText(/Total CO2 Saved/i)).toBeInTheDocument();
        expect(screen.getByText(/kg/i)).toBeInTheDocument();
      });
    });

    it('should display company-wide commute statistics', async () => {
      await waitFor(() => {
        expect(screen.getByText(/Total Sustainable Commutes/i)).toBeInTheDocument();
      });
    });

    it('should display company challenges stats', async () => {
      await waitFor(() => {
        expect(screen.getByText(/Active Challenges/i)).toBeInTheDocument();
      });
    });
  });
});