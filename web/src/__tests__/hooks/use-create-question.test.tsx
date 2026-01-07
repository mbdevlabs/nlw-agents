import { renderHook, waitFor, act } from '@testing-library/react'
import { useCreateQuestion } from '@/http/use-create-question'
import { TestQueryProvider, createTestQueryClient } from '../mocks/react-query'

describe('useCreateQuestion', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should create question successfully', async () => {
    const mockResponse = { questionId: 'q-id', answer: 'AI Answer' }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    const { result } = renderHook(() => useCreateQuestion('room-123'), {
      wrapper: TestQueryProvider,
    })

    await act(async () => {
      await result.current.mutateAsync({ question: 'What is this?' })
    })

    expect(result.current.isSuccess).toBe(true)
    expect(result.current.data).toEqual(mockResponse)
  })

  it('should call fetch with correct parameters', async () => {
    const mockResponse = { questionId: 'q-id', answer: 'Answer' }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    const { result } = renderHook(() => useCreateQuestion('my-room'), {
      wrapper: TestQueryProvider,
    })

    await act(async () => {
      await result.current.mutateAsync({ question: 'My question here?' })
    })

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3333/rooms/my-room/questions',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: 'My question here?' }),
      }
    )
  })

  it('should perform optimistic update on mutate', async () => {
    const queryClient = createTestQueryClient()

    // Set initial questions data
    queryClient.setQueryData(['get-questions', 'room-123'], [
      { id: 'existing-q', question: 'Existing?', answer: 'Yes', createdAt: '2024-01-01' },
    ])

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ questionId: 'new-q', answer: 'New Answer' }),
    })

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <TestQueryProvider client={queryClient}>{children}</TestQueryProvider>
    )

    const { result } = renderHook(() => useCreateQuestion('room-123'), {
      wrapper,
    })

    act(() => {
      result.current.mutate({ question: 'New question?' })
    })

    // Check optimistic update was applied
    await waitFor(() => {
      const questions = queryClient.getQueryData(['get-questions', 'room-123']) as Array<{
        question: string
        isGeneratingAnswer?: boolean
      }>
      expect(questions?.length).toBe(2)
      expect(questions?.[0]?.question).toBe('New question?')
      expect(questions?.[0]?.isGeneratingAnswer).toBe(true)
    })
  })

  it('should handle mutation error and rollback', async () => {
    const queryClient = createTestQueryClient()
    const originalQuestions = [
      { id: 'q1', question: 'Original?', answer: 'Yes', createdAt: '2024-01-01' },
    ]

    queryClient.setQueryData(['get-questions', 'room-123'], originalQuestions)

    ;(global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error('Network error')
    )

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <TestQueryProvider client={queryClient}>{children}</TestQueryProvider>
    )

    const { result } = renderHook(() => useCreateQuestion('room-123'), {
      wrapper,
    })

    await act(async () => {
      try {
        await result.current.mutateAsync({ question: 'Will fail?' })
      } catch {
        // Expected error
      }
    })

    // Should rollback to original data
    await waitFor(() => {
      const questions = queryClient.getQueryData(['get-questions', 'room-123'])
      expect(questions).toEqual(originalQuestions)
    })
  })

  it('should update question with real ID after success', async () => {
    const queryClient = createTestQueryClient()

    queryClient.setQueryData(['get-questions', 'room-123'], [])

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ questionId: 'real-question-id', answer: 'Real Answer' }),
    })

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <TestQueryProvider client={queryClient}>{children}</TestQueryProvider>
    )

    const { result } = renderHook(() => useCreateQuestion('room-123'), {
      wrapper,
    })

    await act(async () => {
      await result.current.mutateAsync({ question: 'Test question?' })
    })

    await waitFor(() => {
      const questions = queryClient.getQueryData(['get-questions', 'room-123']) as Array<{
        id: string
        answer: string
        isGeneratingAnswer?: boolean
      }>
      expect(questions?.[0]?.id).toBe('real-question-id')
      expect(questions?.[0]?.answer).toBe('Real Answer')
      expect(questions?.[0]?.isGeneratingAnswer).toBe(false)
    })
  })

  it('should handle null answer', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ questionId: 'q-id', answer: null }),
    })

    const { result } = renderHook(() => useCreateQuestion('room-123'), {
      wrapper: TestQueryProvider,
    })

    await act(async () => {
      await result.current.mutateAsync({ question: 'No context question?' })
    })

    expect(result.current.data?.answer).toBeNull()
  })
})
