import { describe, it, expect, beforeAll, afterEach, afterAll, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent, userEvent } from './test-utils';
import { server } from './mocks/api';
import { mockTempPasswordUser, mockNewUser, mockRegularUser } from './test-utils';
import Profile from '../client/src/pages/profile';

// Start mock server before all tests
beforeAll(() => server.listen());
// Reset handlers between tests
afterEach(() => server.resetHandlers());
// Close server after all tests
afterAll(() => server.close());

describe('Profile Page', () => {
  describe('For regular users', () => {
    beforeEach(() => {
      render(<Profile />, { user: mockRegularUser });
    });

    it('should display the user profile information', async () => {
      await waitFor(() => {
        expect(screen.getByText(mockRegularUser.name)).toBeInTheDocument();
        expect(screen.getByText(mockRegularUser.email)).toBeInTheDocument();
      });
    });

    it('should display company information', async () => {
      await waitFor(() => {
        expect(screen.getByText(mockRegularUser.company.name)).toBeInTheDocument();
      });
    });

    it('should display location settings with pre-filled values', async () => {
      // Click on settings tab
      const settingsTab = await screen.findByText('Settings');
      fireEvent.click(settingsTab);

      await waitFor(() => {
        // Check if home and work addresses are pre-filled
        const homeAddressInput = screen.getByLabelText(/Home Address/i);
        const workAddressInput = screen.getByLabelText(/Work Address/i);

        expect(homeAddressInput).toHaveValue(mockRegularUser.home_address);
        expect(workAddressInput).toHaveValue(mockRegularUser.work_address);
      });
    });

    it('should allow updating location settings', async () => {
      vi.spyOn(window, 'fetch');

      // Click on settings tab
      const settingsTab = await screen.findByText('Settings');
      fireEvent.click(settingsTab);

      // Update home address
      const homeAddressInput = await screen.findByLabelText(/Home Address/i);
      fireEvent.change(homeAddressInput, { target: { value: 'New Home Address' } });

      // Submit the form
      const saveButton = screen.getByText('Save Settings');
      fireEvent.click(saveButton);

      // Verify update request was made
      await waitFor(() => {
        expect(window.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/user/update-profile'),
          expect.objectContaining({
            method: 'PATCH',
          })
        );
      });
    });

    it('should display password change form', async () => {
      // Click on settings tab
      const settingsTab = await screen.findByText('Settings');
      fireEvent.click(settingsTab);

      await waitFor(() => {
        expect(screen.getByText('Change Your Password')).toBeInTheDocument();
        expect(screen.getByLabelText(/Current Password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/New Password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Confirm New Password/i)).toBeInTheDocument();
      });
    });
  });

  describe('For users with temporary passwords', () => {
    beforeEach(() => {
      render(<Profile />, { user: mockTempPasswordUser });
    });

    it('should display password change notification banner', async () => {
      await waitFor(() => {
        expect(screen.getByText(/You're using a temporary password/i)).toBeInTheDocument();
        expect(screen.getByText('Change password').closest('button')).toBeInTheDocument();
      });
    });

    it('should navigate to settings tab when banner button is clicked', async () => {
      // Setup a mock implementation of document.querySelector
      const mockDispatchEvent = vi.fn();
      const mockElement = { dispatchEvent: mockDispatchEvent };
      document.querySelector = vi.fn().mockReturnValue(mockElement);
      
      // Click the Change password button
      const changePasswordButton = await screen.findByText('Change password');
      fireEvent.click(changePasswordButton);
      
      // Verify the click was dispatched
      expect(document.querySelector).toHaveBeenCalledWith('[data-value="settings"]');
      expect(mockDispatchEvent).toHaveBeenCalled();
    });

    it('should show highlighted password change form in settings tab', async () => {
      // Click on settings tab
      const settingsTab = await screen.findByText('Settings');
      fireEvent.click(settingsTab);
      
      await waitFor(() => {
        // Expecting a highlighted form for temporary password users
        const form = screen.getByText(/You're using a temporary password/i).closest('div');
        expect(form).toHaveClass('bg-blue-50');
      });
    });

    it('should validate password form fields', async () => {
      // Click on settings tab
      const settingsTab = await screen.findByText('Settings');
      fireEvent.click(settingsTab);
      
      // Try to submit the form without filling it
      const updatePasswordButton = await screen.findByText('Update Password');
      fireEvent.click(updatePasswordButton);
      
      await waitFor(() => {
        // Expect validation errors
        expect(screen.getByText(/Current password is required/i)).toBeInTheDocument();
        expect(screen.getByText(/New password is required/i)).toBeInTheDocument();
      });
    });

    it('should validate password confirmation match', async () => {
      // Click on settings tab
      const settingsTab = await screen.findByText('Settings');
      fireEvent.click(settingsTab);
      
      // Fill out form with non-matching passwords
      const currentPasswordInput = await screen.findByLabelText(/Current Password/i);
      const newPasswordInput = await screen.findByLabelText(/New Password/i);
      const confirmPasswordInput = await screen.findByLabelText(/Confirm New Password/i);
      
      fireEvent.change(currentPasswordInput, { target: { value: 'current123' } });
      fireEvent.change(newPasswordInput, { target: { value: 'newpass123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'different123' } });
      
      // Submit the form
      const updatePasswordButton = await screen.findByText('Update Password');
      fireEvent.click(updatePasswordButton);
      
      await waitFor(() => {
        // Expect validation error for mismatched passwords
        expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
      });
    });

    it('should submit the password change when form is valid', async () => {
      vi.spyOn(window, 'fetch');
      
      // Click on settings tab
      const settingsTab = await screen.findByText('Settings');
      fireEvent.click(settingsTab);
      
      // Fill out form with matching passwords
      const currentPasswordInput = await screen.findByLabelText(/Current Password/i);
      const newPasswordInput = await screen.findByLabelText(/New Password/i);
      const confirmPasswordInput = await screen.findByLabelText(/Confirm New Password/i);
      
      fireEvent.change(currentPasswordInput, { target: { value: 'current123' } });
      fireEvent.change(newPasswordInput, { target: { value: 'newpass123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'newpass123' } });
      
      // Submit the form
      const updatePasswordButton = await screen.findByText('Update Password');
      fireEvent.click(updatePasswordButton);
      
      // Verify update request was made with the right data
      await waitFor(() => {
        expect(window.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/user/update'),
          expect.objectContaining({
            method: 'PATCH',
            body: expect.stringContaining('password'),
          })
        );
      });
    });
  });

  describe('For new users', () => {
    beforeEach(() => {
      render(<Profile />, { user: mockNewUser });
    });

    it('should display welcome banner for new users', async () => {
      await waitFor(() => {
        expect(screen.getByText(/Welcome to EcoCommute/i)).toBeInTheDocument();
        expect(screen.getByText(/set up your home and work locations/i)).toBeInTheDocument();
      });
    });

    it('should navigate to settings tab and mark user as not new when setup button clicked', async () => {
      vi.spyOn(window, 'fetch');
      
      // Setup a mock implementation of document.querySelector
      const mockDispatchEvent = vi.fn();
      const mockElement = { dispatchEvent: mockDispatchEvent };
      document.querySelector = vi.fn().mockReturnValue(mockElement);
      
      // Click the Set up locations button
      const setupButton = await screen.findByText('Set up locations');
      fireEvent.click(setupButton);
      
      // Verify the click was dispatched
      expect(document.querySelector).toHaveBeenCalledWith('[data-value="settings"]');
      
      // Verify API call was made to update new user status
      await waitFor(() => {
        expect(window.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/user/update'),
          expect.objectContaining({
            method: 'PATCH',
            body: expect.stringContaining('"is_new_user":false'),
          })
        );
      });
    });

    it('should show empty location fields in settings tab', async () => {
      // Click on settings tab
      const settingsTab = await screen.findByText('Settings');
      fireEvent.click(settingsTab);
      
      await waitFor(() => {
        // Check if home and work addresses are empty
        const homeAddressInput = screen.getByLabelText(/Home Address/i);
        const workAddressInput = screen.getByLabelText(/Work Address/i);

        expect(homeAddressInput).toHaveValue('');
        expect(workAddressInput).toHaveValue('');
      });
    });
  });
});