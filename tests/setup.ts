import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Import the auth context mock
import './mocks/auth-context';

// Cleanup after each test case (e.g., clearing jsdom)
afterEach(() => {
  cleanup();
});