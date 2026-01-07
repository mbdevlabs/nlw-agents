import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import Fastify from 'fastify'
import type { FastifyInstance } from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'
import { mockAudioChunks } from '../mocks/db'

// Mock Gemini service
const mockGenerateEmbeddings = jest.fn<() => Promise<number[]>>()
const mockGenerateAnswer = jest.fn<() => Promise<string>>()

jest.unstable_mockModule('../../services/gemini.ts', () => ({
  generateEmbeddings: mockGenerateEmbeddings,
  generateAnswer: mockGenerateAnswer,
}))

// Mock database
const mockLimit = jest.fn()
const mockReturning = jest.fn()

jest.unstable_mockModule('../../db/connections.ts', () => ({
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: mockLimit,
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    returning: mockReturning,
  },
}))

// Import the route after mocking
const { createQuestionRoute } = await import(
  '../../http/routes/create-question.ts'
)

describe('POST /rooms/:roomId/questions', () => {
  let app: FastifyInstance

  beforeEach(async () => {
    app = Fastify()
    app.setSerializerCompiler(serializerCompiler)
    app.setValidatorCompiler(validatorCompiler)
    await app.register(createQuestionRoute)
    await app.ready()

    // Default mock implementations
    mockGenerateEmbeddings.mockResolvedValue(new Array(768).fill(0.1))
    mockGenerateAnswer.mockResolvedValue('AI generated answer')
    mockLimit.mockResolvedValue(mockAudioChunks)
    mockReturning.mockResolvedValue([{ id: 'question-uuid' }])
  })

  afterEach(async () => {
    await app.close()
  })

  it('should create question with AI answer when context exists', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/rooms/room-uuid/questions',
      payload: { question: 'What is this about?' },
    })

    expect(response.statusCode).toBe(201)
    const body = JSON.parse(response.body)
    expect(body).toHaveProperty('questionId')
    expect(body).toHaveProperty('answer')
    expect(body.answer).toBe('AI generated answer')
    expect(mockGenerateEmbeddings).toHaveBeenCalledWith('What is this about?')
    expect(mockGenerateAnswer).toHaveBeenCalled()
  })

  it('should create question without answer when no context found', async () => {
    mockLimit.mockResolvedValue([]) // No similar chunks found

    const response = await app.inject({
      method: 'POST',
      url: '/rooms/room-uuid/questions',
      payload: { question: 'What is this about?' },
    })

    expect(response.statusCode).toBe(201)
    const body = JSON.parse(response.body)
    expect(body).toHaveProperty('questionId')
    expect(body.answer).toBeNull()
    expect(mockGenerateAnswer).not.toHaveBeenCalled()
  })

  it('should reject empty question', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/rooms/room-uuid/questions',
      payload: { question: '' },
    })

    expect(response.statusCode).toBe(400)
  })

  it('should reject request without question', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/rooms/room-uuid/questions',
      payload: {},
    })

    expect(response.statusCode).toBe(400)
  })

  it('should handle database insertion error', async () => {
    mockReturning.mockResolvedValue([])

    const response = await app.inject({
      method: 'POST',
      url: '/rooms/room-uuid/questions',
      payload: { question: 'Valid question here' },
    })

    expect(response.statusCode).toBe(500)
  })

  it('should generate embeddings for the question', async () => {
    await app.inject({
      method: 'POST',
      url: '/rooms/room-uuid/questions',
      payload: { question: 'Test question for embeddings' },
    })

    expect(mockGenerateEmbeddings).toHaveBeenCalledWith(
      'Test question for embeddings'
    )
  })
})
