import { jest } from '@jest/globals';

// Set up test environment
beforeAll(() => {
  // Increase timeout for tests that involve file operations
  jest.setTimeout(30000);
});

globalThis.fail = (message?: string): never => {
  throw new Error(message || 'Test failed');
};
