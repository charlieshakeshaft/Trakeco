import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Import the mocks
import './mocks/auth-context';
import './mocks/wouter';

// Cleanup after each test case (e.g., clearing jsdom)
afterEach(() => {
  cleanup();
});