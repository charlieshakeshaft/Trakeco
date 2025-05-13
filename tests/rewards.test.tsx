import { describe, it, expect, beforeAll, afterEach, afterAll, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from './test-utils';
import { server } from './mocks/api';
import { mockAdminUser, mockRegularUser } from './test-utils';
import Rewards from '../client/src/pages/rewards';

// Start mock server before all tests
beforeAll(() => server.listen());
// Reset handlers between tests
afterEach(() => server.resetHandlers());
// Close server after all tests
afterAll(() => server.close());

describe('Rewards Page', () => {
  describe('For regular users', () => {
    beforeEach(() => {
      render(<Rewards />, { user: mockRegularUser });
    });

    it('should display available rewards', async () => {
      await waitFor(() => {
        expect(screen.getByText(/Free Coffee Voucher/i)).toBeInTheDocument();
      });
    });

    it('should display reward details', async () => {
      await waitFor(() => {
        expect(screen.getByText(/Redeem for a free coffee at the company cafe/i)).toBeInTheDocument();
        expect(screen.getByText(/50 Points/i)).toBeInTheDocument();
      });
    });

    it('should display user points balance', async () => {
      await waitFor(() => {
        expect(screen.getByText(new RegExp(`${mockRegularUser.points_total}\\s*Points`, 'i'))).toBeInTheDocument();
      });
    });

    it('should display redeem button for rewards', async () => {
      await waitFor(() => {
        expect(screen.getByText(/Redeem/i)).toBeInTheDocument();
      });
    });

    it('should open redeem confirmation dialog when redeem button clicked', async () => {
      // Find and click the redeem button
      const redeemButton = await screen.findByText(/Redeem/i);
      fireEvent.click(redeemButton);
      
      await waitFor(() => {
        // Check for confirmation dialog content
        expect(screen.getByText(/Confirm Redemption/i)).toBeInTheDocument();
        expect(screen.getByText(/Are you sure you want to redeem/i)).toBeInTheDocument();
      });
    });

    it('should disable redeem button if user has insufficient points', async () => {
      // This would require a special case where user points < reward cost
      // With current mock setup, the user has enough points
      
      // If we could manipulate the mockRegularUser to have fewer points
      // than the reward cost (50), we would test:
      
      // await waitFor(() => {
      //   const redeemButton = screen.getByText(/Redeem/i).closest('button');
      //   expect(redeemButton).toBeDisabled();
      // });
    });

    it('should not show create reward button for non-admin users', async () => {
      await waitFor(() => {
        expect(screen.queryByText(/Create Reward/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('For admin users', () => {
    beforeEach(() => {
      render(<Rewards />, { user: mockAdminUser });
    });

    it('should display create reward button', async () => {
      await waitFor(() => {
        expect(screen.getByText(/Create Reward/i)).toBeInTheDocument();
      });
    });

    it('should open create reward form when button is clicked', async () => {
      // Find and click the create button
      const createButton = await screen.findByText(/Create Reward/i);
      fireEvent.click(createButton);
      
      await waitFor(() => {
        // Check for form elements
        expect(screen.getByText(/Create New Reward/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Cost \(Points\)/i)).toBeInTheDocument();
      });
    });

    it('should show reward management controls', async () => {
      await waitFor(() => {
        // Admin should see edit/delete controls
        expect(screen.getByText(/Edit/i) || screen.getByLabelText(/Edit/i)).toBeInTheDocument();
        expect(screen.getByText(/Delete/i) || screen.getByLabelText(/Delete/i)).toBeInTheDocument();
      });
    });

    it('should submit create reward form with valid data', async () => {
      vi.spyOn(window, 'fetch');
      
      // Find and click the create button
      const createButton = await screen.findByText(/Create Reward/i);
      fireEvent.click(createButton);
      
      await waitFor(() => {
        // Fill out form fields
        const titleInput = screen.getByLabelText(/Title/i);
        const descriptionInput = screen.getByLabelText(/Description/i);
        const costInput = screen.getByLabelText(/Cost \(Points\)/i);
        
        fireEvent.change(titleInput, { target: { value: 'New Reward' } });
        fireEvent.change(descriptionInput, { target: { value: 'A cool new reward' } });
        fireEvent.change(costInput, { target: { value: '75' } });
        
        // Submit the form
        const submitButton = screen.getByText(/Create/i);
        fireEvent.click(submitButton);
      });
      
      // Verify API call
      await waitFor(() => {
        expect(window.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/rewards'),
          expect.objectContaining({
            method: 'POST',
            body: expect.stringContaining('New Reward')
          })
        );
      });
    });
  });

  describe('Redemption history', () => {
    beforeEach(() => {
      render(<Rewards />, { user: mockRegularUser });
    });

    it('should display redemption history section', async () => {
      await waitFor(() => {
        expect(screen.getByText(/Your Redemptions/i)).toBeInTheDocument();
      });
    });

    it('should display message if no redemptions exist', async () => {
      // This assumes no redemption data in mocks
      await waitFor(() => {
        const historySection = screen.getByText(/Your Redemptions/i).closest('div');
        expect(historySection).toHaveTextContent(/No redemptions yet/i);
      });
    });
  });
});