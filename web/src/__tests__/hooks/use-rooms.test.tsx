import { renderHook, waitFor } from '@testing-library/react'
import { useRooms } from '@/http/use-rooms'
import { TestQueryProvider } from '../mocks/react-query'

const mockRooms = [
  {
    id: 'room-1',
    name: 'Test Room 1',
    createdAt: '2024-01-01T00:00:00Z',
    questionsCount: 5,
  },
  {
    id: 'room-2',
    name: 'Test Room 2',
    createdAt: '2024-01-02T00:00:00Z',
    questionsCount: 3,
  },
]

describe('useRooms', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should fetch rooms successfully', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockRooms,
    })

    const { result } = renderHook(() => useRooms(), {
      wrapper: TestQueryProvider,
    })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockRooms)
    expect(result.current.data?.length).toBe(2)
  })

  it('should call fetch with correct URL', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockRooms,
    })

    renderHook(() => useRooms(), {
      wrapper: TestQueryProvider,
    })

    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith('http://127.0.0.1:3333/rooms')
    )
  })

  it('should handle fetch error', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error('Network error')
    )

    const { result } = renderHook(() => useRooms(), {
      wrapper: TestQueryProvider,
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error).toBeDefined()
  })

  it('should return empty array when no rooms exist', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    })

    const { result } = renderHook(() => useRooms(), {
      wrapper: TestQueryProvider,
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual([])
  })

  it('should have correct query key', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockRooms,
    })

    const { result } = renderHook(() => useRooms(), {
      wrapper: TestQueryProvider,
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    // The hook uses queryKey: ['get-rooms']
    expect(global.fetch).toHaveBeenCalledTimes(1)
  })
})
