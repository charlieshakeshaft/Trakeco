import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Import the mocks
import './mocks/auth-context';
// We're mocking wouter directly in each test file now

// Cleanup after each test case (e.g., clearing jsdom)
afterEach(() => {
  cleanup();
});