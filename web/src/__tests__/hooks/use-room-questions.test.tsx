import { renderHook, waitFor } from '@testing-library/react'
import { useRoomQuestions } from '@/http/use-room-questions'
import { TestQueryProvider } from '../mocks/react-query'

const mockQuestions = [
  {
    id: 'q1',
    question: 'What is TypeScript?',
    answer: 'A typed superset of JavaScript.',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'q2',
    question: 'How does RAG work?',
    answer: 'RAG combines retrieval with generation.',
    createdAt: '2024-01-02T00:00:00Z',
  },
]

describe('useRoomQuestions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should fetch questions for a room', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockQuestions,
    })

    const { result } = renderHook(() => useRoomQuestions('room-123'), {
      wrapper: TestQueryProvider,
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockQuestions)
    expect(result.current.data?.length).toBe(2)
  })

  it('should call fetch with correct URL including roomId', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockQuestions,
    })

    renderHook(() => useRoomQuestions('my-room-id'), {
      wrapper: TestQueryProvider,
    })

    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        'http://127.0.0.1:3333/rooms/my-room-id/questions'
      )
    )
  })

  it('should handle fetch error', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error('Network error')
    )

    const { result } = renderHook(() => useRoomQuestions('room-123'), {
      wrapper: TestQueryProvider,
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })

  it('should return empty array when no questions exist', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    })

    const { result } = renderHook(() => useRoomQuestions('empty-room'), {
      wrapper: TestQueryProvider,
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual([])
  })

  it('should refetch when roomId changes', async () => {
    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockQuestions,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [mockQuestions[0]],
      })

    const { result, rerender } = renderHook(
      ({ roomId }) => useRoomQuestions(roomId),
      {
        wrapper: TestQueryProvider,
        initialProps: { roomId: 'room-1' },
      }
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.length).toBe(2)

    rerender({ roomId: 'room-2' })

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2))
  })

  it('should include roomId in query key', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockQuestions,
    })

    const { result } = renderHook(() => useRoomQuestions('specific-room'), {
      wrapper: TestQueryProvider,
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    // Verify the fetch was called with the specific room
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('specific-room')
    )
  })
})
