import React from 'react';
import { vi } from 'vitest';

// Create simple functional component mocks
const Link = ({ href, to, children }: { href?: string; to?: string; children: React.ReactNode }) => (
  React.createElement('a', { href: href || to, 'data-testid': 'mock-link' }, children)
);

const Route = (props: any) => {
  const { component: Component, children } = props;
  if (Component) {
    return React.createElement(Component);
  }
  return children || null;
};

const Router = ({ children }: { children: React.ReactNode }) => children;
const Switch = ({ children }: { children: React.ReactNode }) => children;
const Redirect = ({ to }: { to: string }) => null;

// Create function mocks
const useLocation = vi.fn().mockImplementation(() => ['/test-path', vi.fn()]);
const useRoute = vi.fn().mockImplementation(() => [false, {}]);
const navigate = vi.fn();

// Export everything
export {
  Link,
  Route,
  Router,
  Switch,
  Redirect,
  useLocation,
  useRoute,
  navigate
};

// Also default export the Router
export default Router;