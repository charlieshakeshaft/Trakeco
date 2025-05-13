// This file mocks the useAuth hook for testing purposes

// Create a mock version of the useAuth hook that returns the same structure
// but is controlled by our test wrapper
export const mockUseAuth = () => {
  return {
    user: null,
    isLoading: false,
    isAuthenticated: false,
    logout: async () => {},
    setCurrentUser: () => {}
  };
};