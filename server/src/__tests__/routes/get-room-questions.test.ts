import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import type { FastifyInstance } from 'fastify'
import Fastify from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'
import { mockQuestions } from '../mocks/db.js'

// Mock the database connection
const mockOrderBy = jest.fn<() => Promise<unknown>>()
jest.unstable_mockModule('../../db/connections.ts', () => ({
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orderBy: mockOrderBy,
  },
}))

// Import the route after mocking
const { getRoomQuestions } = await import(
  '../../http/routes/get-room-questions.ts'
)

describe('GET /rooms/:roomId/questions', () => {
  let app: FastifyInstance

  beforeEach(async () => {
    app = Fastify()
    app.setSerializerCompiler(serializerCompiler)
    app.setValidatorCompiler(validatorCompiler)
    await app.register(getRoomQuestions)
    await app.ready()

    mockOrderBy.mockResolvedValue(mockQuestions)
  })

  afterEach(async () => {
    await app.close()
  })

  it('should return questions for a room', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/rooms/room-uuid-1/questions',
    })

    expect(response.statusCode).toBe(200)
    const body = JSON.parse(response.body)
    expect(Array.isArray(body)).toBe(true)
    expect(body.length).toBe(2)
  })

  it('should return question with id, question, answer and createdAt', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/rooms/room-uuid-1/questions',
    })

    expect(response.statusCode).toBe(200)
    const body = JSON.parse(response.body)
    expect(body[0]).toHaveProperty('id')
    expect(body[0]).toHaveProperty('question')
    expect(body[0]).toHaveProperty('answer')
    expect(body[0]).toHaveProperty('createdAt')
  })

  it('should return empty array when no questions exist', async () => {
    mockOrderBy.mockResolvedValue([])

    const response = await app.inject({
      method: 'GET',
      url: '/rooms/room-uuid-1/questions',
    })

    expect(response.statusCode).toBe(200)
    const body = JSON.parse(response.body)
    expect(Array.isArray(body)).toBe(true)
    expect(body.length).toBe(0)
  })

  it('should accept any roomId format', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/rooms/any-room-id/questions',
    })

    expect(response.statusCode).toBe(200)
  })
})
