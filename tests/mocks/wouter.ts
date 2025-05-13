import { vi } from 'vitest';
import React from 'react';

// Create a mock for the useLocation hook and Link component
const mockUseLocation = vi.fn().mockImplementation(() => ['/test-path', vi.fn()]);
const mockUseRoute = vi.fn().mockImplementation(() => [false, {}]);
const mockLink = vi.fn().mockImplementation(({ to, children }) => {
  return React.createElement('a', { href: to, 'data-testid': 'mock-link' }, children);
});

const mockRoute = vi.fn().mockImplementation((props) => {
  const { component: Component } = props;
  return Component ? React.createElement(Component) : null;
});

const mockRouter = vi.fn().mockImplementation(({ children }) => children);
mockRouter.useConfig = vi.fn();

// Create a mock for the wouter module
vi.mock('wouter', () => {
  return {
    default: mockRouter,
    Router: mockRouter,
    Route: mockRoute,
    Link: mockLink,
    useLocation: mockUseLocation,
    useRoute: mockUseRoute,
    useRouter: vi.fn().mockImplementation(() => ({
      hook: mockUseLocation,
    })),
    navigate: vi.fn(),
    Redirect: vi.fn().mockImplementation(() => null),
    Switch: vi.fn().mockImplementation(({ children }) => children),
  };
});

// Export mock functions so they can be manipulated in tests
export {
  mockUseLocation,
  mockUseRoute,
  mockLink,
  mockRoute,
  mockRouter,
};