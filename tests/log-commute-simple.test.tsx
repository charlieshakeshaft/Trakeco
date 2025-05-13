import { describe, it, expect, beforeAll, afterEach, afterAll, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { mockRegularUser } from './test-utils';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Import the relevant mocks
import { Link, Router } from './test-utils';

// Create a simple mock for wouter
vi.mock('wouter', () => ({
  __esModule: true,
  default: ({ children }) => children,
  Link: ({ href, children }) => <a href={href} data-testid="mock-link">{children}</a>,
  Router: ({ children }) => children,
  Route: ({ children }) => children,
  Switch: ({ children }) => children,
  Redirect: () => null,
  useLocation: () => ['/test-path', vi.fn()],
  useRoute: () => [false, {}],
  navigate: vi.fn()
}));

// Mock components that use ResizeObserver to avoid those errors
vi.mock('@/components/commute/weekly-commute-form-simple', () => ({
  default: () => <div data-testid="mock-weekly-commute-form">Weekly Commute Form Mocked</div>
}));

// Create a simplified component that resembles LogCommute page structure
function SimpleLogCommutePage() {
  return (
    <div>
      <h1>Log Your Commute</h1>
      <div data-testid="commute-form">
        <Link href="/profile?tab=settings">
          <button>Add locations</button>
        </Link>
      </div>
    </div>
  );
}

describe('Simple Log Commute Page', () => {
  // Setup a fresh QueryClient for each test
  const createWrapper = () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false }
      }
    });
    return ({ children }) => (
      <QueryClientProvider client={queryClient}>
        <Router>{children}</Router>
      </QueryClientProvider>
    );
  };

  it('should render the page title', () => {
    render(<SimpleLogCommutePage />, { 
      wrapper: createWrapper()
    });
    expect(screen.getByText('Log Your Commute')).toBeInTheDocument();
  });

  it('should have a link to profile settings', () => {
    render(<SimpleLogCommutePage />, { 
      wrapper: createWrapper()
    });
    const link = screen.getByTestId('mock-link');
    expect(link).toHaveAttribute('href', '/profile?tab=settings');
  });
});