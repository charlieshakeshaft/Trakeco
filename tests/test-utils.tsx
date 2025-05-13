import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthContext } from '@/contexts/auth-context';

// Mock user data for different user types
export const mockAdminUser = {
  id: 1,
  username: 'admin_user',
  email: 'admin@example.com',
  name: 'Admin User',
  company_id: 1,
  points_total: 150,
  streak_count: 3,
  role: 'admin',
  home_address: 'BS34QU',
  home_latitude: '51.4545',
  home_longitude: '-2.5879',
  work_address: 'M11AD',
  work_latitude: '53.4808',
  work_longitude: '-2.2426',
  commute_distance_km: 5,
  is_new_user: false,
  needs_password_change: false,
  company: {
    id: 1,
    name: 'Test Company',
    domain: 'testcompany.com'
  }
};

export const mockRegularUser = {
  id: 2,
  username: 'regular_user',
  email: 'user@example.com',
  name: 'Regular User',
  company_id: 1,
  points_total: 75,
  streak_count: 1,
  role: 'user',
  home_address: 'BS34QU',
  home_latitude: '51.4545',
  home_longitude: '-2.5879',
  work_address: 'M11AD',
  work_latitude: '53.4808',
  work_longitude: '-2.2426',
  commute_distance_km: 5,
  is_new_user: false,
  needs_password_change: false,
  company: {
    id: 1,
    name: 'Test Company',
    domain: 'testcompany.com'
  }
};

export const mockSoloUser = {
  id: 3,
  username: 'solo_user',
  email: 'solo@example.com',
  name: 'Solo User',
  company_id: null,
  points_total: 50,
  streak_count: 2,
  role: 'user',
  home_address: 'BS34QU',
  home_latitude: '51.4545',
  home_longitude: '-2.5879',
  work_address: 'M11AD',
  work_latitude: '53.4808',
  work_longitude: '-2.2426',
  commute_distance_km: 5,
  is_new_user: false,
  needs_password_change: false,
  company: null
};

export const mockNewUser = {
  id: 4,
  username: 'new_user',
  email: 'new@example.com',
  name: 'New User',
  company_id: 1,
  points_total: 0,
  streak_count: 0,
  role: 'user',
  home_address: null,
  home_latitude: null,
  home_longitude: null,
  work_address: null,
  work_latitude: null,
  work_longitude: null,
  commute_distance_km: null,
  is_new_user: true,
  needs_password_change: false,
  company: {
    id: 1,
    name: 'Test Company',
    domain: 'testcompany.com'
  }
};

export const mockTempPasswordUser = {
  id: 5,
  username: 'temp_password_user',
  email: 'temp@example.com',
  name: 'Temp Password User',
  company_id: 1,
  points_total: 0,
  streak_count: 0,
  role: 'user',
  home_address: null,
  home_latitude: null,
  home_longitude: null,
  work_address: null,
  work_latitude: null,
  work_longitude: null,
  commute_distance_km: null,
  is_new_user: false,
  needs_password_change: true,
  company: {
    id: 1,
    name: 'Test Company',
    domain: 'testcompany.com'
  }
};

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  route?: string;
  user?: any;
  isLoading?: boolean;
}

/**
 * Custom render function that wraps components with necessary providers
 */
function customRender(
  ui: ReactElement,
  { 
    route = '/',
    user = null,
    isLoading = false,
    ...renderOptions
  }: CustomRenderOptions = {}
) {
  // Create a fresh query client for each test
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  
  // Mock auth context methods
  const authContextValue = {
    user,
    isLoading,
    setCurrentUser: vi.fn(),
    login: vi.fn().mockResolvedValue({}),
    logout: vi.fn(),
    path: route,
  };
  
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[route]}>
          <AuthContext.Provider value={authContextValue}>
            {children}
          </AuthContext.Provider>
        </MemoryRouter>
      </QueryClientProvider>
    );
  }
  
  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient,
    authContextValue,
  };
}

// Re-export everything from testing-library
export * from '@testing-library/react';
export { customRender as render };