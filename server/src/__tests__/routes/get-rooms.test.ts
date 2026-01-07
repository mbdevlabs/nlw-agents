import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import Fastify from 'fastify'
import type { FastifyInstance } from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'
import { mockRooms } from '../mocks/db'

// Mock the database connection
const mockOrderBy = jest.fn()
jest.unstable_mockModule('../../db/connections.ts', () => ({
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    orderBy: mockOrderBy,
  },
}))

// Import the route after mocking
const { getRoomsRoute } = await import('../../http/routes/get-rooms.ts')

describe('GET /rooms', () => {
  let app: FastifyInstance

  beforeEach(async () => {
    app = Fastify()
    app.setSerializerCompiler(serializerCompiler)
    app.setValidatorCompiler(validatorCompiler)
    await app.register(getRoomsRoute)
    await app.ready()

    mockOrderBy.mockResolvedValue(mockRooms)
  })

  afterEach(async () => {
    await app.close()
  })

  it('should return list of rooms with question counts', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/rooms',
    })

    expect(response.statusCode).toBe(200)
    const body = JSON.parse(response.body)
    expect(Array.isArray(body)).toBe(true)
    expect(body.length).toBe(2)
    expect(body[0]).toHaveProperty('id')
    expect(body[0]).toHaveProperty('name')
    expect(body[0]).toHaveProperty('questionsCount')
  })

  it('should return empty array when no rooms exist', async () => {
    mockOrderBy.mockResolvedValue([])

    const response = await app.inject({
      method: 'GET',
      url: '/rooms',
    })

    expect(response.statusCode).toBe(200)
    const body = JSON.parse(response.body)
    expect(Array.isArray(body)).toBe(true)
    expect(body.length).toBe(0)
  })

  it('should return rooms ordered by creation date', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/rooms',
    })

    expect(response.statusCode).toBe(200)
    const body = JSON.parse(response.body)
    expect(body[0].name).toBe('Test Room 1')
    expect(body[1].name).toBe('Test Room 2')
  })
})
