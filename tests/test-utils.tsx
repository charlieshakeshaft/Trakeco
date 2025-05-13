import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import { mockAuthContextValue } from './mocks/auth-context';

// Create a full mock for wouter directly in test-utils
const Link = ({ href, children }: { href: string; children: React.ReactNode }) => 
  React.createElement('a', { href, 'data-testid': 'mock-link' }, children);

const Router = ({ children, base = '' }: { children: React.ReactNode; base?: string }) => children;
const Route = ({ children, path, component: Component }: { children?: React.ReactNode; path?: string; component?: React.ComponentType<any> }) => {
  if (Component) {
    return <Component />;
  }
  return children || null;
};
const Switch = ({ children }: { children: React.ReactNode }) => children;
const Redirect = ({ to }: { to: string }) => null;
const useLocation = vi.fn().mockImplementation(() => ['/test-path', vi.fn()]);
const useRoute = vi.fn().mockImplementation(() => [false, {}]);
const navigate = vi.fn();

// Export all wouter mocks
export { Link, Router, Route, Switch, Redirect, useLocation, useRoute, navigate };

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
  
  // Update the mockAuthContextValue for this test
  mockAuthContextValue.user = user;
  mockAuthContextValue.isLoading = isLoading;
  mockAuthContextValue.isAuthenticated = !!user;
  
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <Router base="">
          {children}
        </Router>
      </QueryClientProvider>
    );
  }
  
  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient
  };
}

// Re-export everything from testing-library
export * from '@testing-library/react';
export { customRender as render };