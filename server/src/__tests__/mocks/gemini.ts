import { jest } from '@jest/globals'

// Mock functions for Gemini service
export const mockTranscribeAudio = jest.fn<() => Promise<string>>()
export const mockGenerateEmbeddings = jest.fn<() => Promise<number[]>>()
export const mockGenerateAnswer = jest.fn<() => Promise<string>>()

// Default mock implementations
mockTranscribeAudio.mockResolvedValue('Transcribed audio text in Portuguese.')
mockGenerateEmbeddings.mockResolvedValue(new Array(768).fill(0.1))
mockGenerateAnswer.mockResolvedValue('AI generated answer based on context.')

// Helper to reset all Gemini mocks
export function resetGeminiMocks() {
  mockTranscribeAudio.mockClear()
  mockGenerateEmbeddings.mockClear()
  mockGenerateAnswer.mockClear()

  mockTranscribeAudio.mockResolvedValue('Transcribed audio text in Portuguese.')
  mockGenerateEmbeddings.mockResolvedValue(new Array(768).fill(0.1))
  mockGenerateAnswer.mockResolvedValue('AI generated answer based on context.')
}
