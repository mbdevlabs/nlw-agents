import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import type { FastifyInstance } from 'fastify'
import Fastify from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'

// Mock the database connection
const mockReturning = jest.fn<() => Promise<unknown>>()
jest.unstable_mockModule('../../db/connections.ts', () => ({
  db: {
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    returning: mockReturning,
  },
}))

// Import the route after mocking
const { createRoomRoute } = await import('../../http/routes/create-room.ts')

describe('POST /rooms', () => {
  let app: FastifyInstance

  beforeEach(async () => {
    app = Fastify()
    app.setSerializerCompiler(serializerCompiler)
    app.setValidatorCompiler(validatorCompiler)
    await app.register(createRoomRoute)
    await app.ready()

    mockReturning.mockResolvedValue([{ id: 'new-room-uuid' }])
  })

  afterEach(async () => {
    await app.close()
  })

  it('should create a new room successfully', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/rooms',
      payload: { name: 'Test Room', description: 'A test room' },
    })

    expect(response.statusCode).toBe(201)
    const body = JSON.parse(response.body)
    expect(body).toHaveProperty('roomId')
    expect(body.roomId).toBe('new-room-uuid')
  })

  it('should create room without description', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/rooms',
      payload: { name: 'Room Without Description' },
    })

    expect(response.statusCode).toBe(201)
    const body = JSON.parse(response.body)
    expect(body).toHaveProperty('roomId')
  })

  it('should reject room without name', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/rooms',
      payload: { description: 'No name provided' },
    })

    expect(response.statusCode).toBe(400)
  })

  it('should reject empty name', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/rooms',
      payload: { name: '' },
    })

    expect(response.statusCode).toBe(400)
  })

  it('should handle database error gracefully', async () => {
    mockReturning.mockResolvedValue([])

    const response = await app.inject({
      method: 'POST',
      url: '/rooms',
      payload: { name: 'Test Room' },
    })

    expect(response.statusCode).toBe(500)
  })
})
