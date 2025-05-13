import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Import the mocks
import './mocks/auth-context';
// We're mocking wouter directly in each test file now

// Mock ResizeObserver which is not available in JSDOM
class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

// Attach the mock to the global object
global.ResizeObserver = MockResizeObserver;

// Also mock other browser APIs that might be missing in JSDOM
if (!global.DOMRect) {
  global.DOMRect = class DOMRect {
    bottom: number;
    height: number;
    left: number;
    right: number;
    top: number;
    width: number;
    x: number;
    y: number;
    
    constructor(x = 0, y = 0, width = 0, height = 0) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.top = y;
      this.right = x + width;
      this.bottom = y + height;
      this.left = x;
    }
    
    static fromRect(other?: DOMRectInit): DOMRect {
      return new DOMRect(other?.x, other?.y, other?.width, other?.height);
    }
    
    toJSON() {
      return JSON.stringify(this);
    }
  };
}

// Cleanup after each test case (e.g., clearing jsdom)
afterEach(() => {
  cleanup();
});