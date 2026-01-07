import { jest } from '@jest/globals'

// Mock environment variables
process.env.PORT = '3333'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test'
process.env.GEMINI_API_KEY = 'test-api-key'

// Global timeout for async tests
jest.setTimeout(10000)

// Clear all mocks before each test
beforeEach(() => {
  jest.clearAllMocks()
})
