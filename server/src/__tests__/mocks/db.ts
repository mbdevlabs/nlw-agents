import { jest } from '@jest/globals'

// Chainable mock builder for Drizzle ORM queries
export function createMockDb() {
  const mockResult = jest.fn()

  const chainableMock = {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockImplementation(() => mockResult()),
    where: jest.fn().mockReturnThis(),
    limit: jest.fn().mockImplementation(() => mockResult()),
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    returning: jest.fn().mockImplementation(() => mockResult()),
    // Helper to set what the final call should return
    _setResult: (result: unknown) => {
      mockResult.mockResolvedValue(result)
    },
  }

  return chainableMock
}

// Sample test data
export const mockRooms = [
  {
    id: 'room-uuid-1',
    name: 'Test Room 1',
    createdAt: new Date('2024-01-01'),
    questionsCount: 5,
  },
  {
    id: 'room-uuid-2',
    name: 'Test Room 2',
    createdAt: new Date('2024-01-02'),
    questionsCount: 3,
  },
]

export const mockQuestions = [
  {
    id: 'question-uuid-1',
    question: 'What is TypeScript?',
    answer: 'TypeScript is a typed superset of JavaScript.',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'question-uuid-2',
    question: 'How does RAG work?',
    answer: 'RAG combines retrieval with generation.',
    createdAt: new Date('2024-01-02'),
  },
]

export const mockAudioChunks = [
  {
    id: 'chunk-uuid-1',
    roomId: 'room-uuid-1',
    transcription: 'This is a test transcription.',
    similarity: 0.85,
  },
]
