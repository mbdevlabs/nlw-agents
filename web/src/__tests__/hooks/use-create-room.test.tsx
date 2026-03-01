import { act, renderHook, waitFor } from '@testing-library/react'
import { useCreateRoom } from '@/http/use-create-room'
import { createTestQueryClient, TestQueryProvider } from '../mocks/react-query'

describe('useCreateRoom', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should create room successfully', async () => {
    const mockResponse = { roomId: 'new-room-id' }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    const { result } = renderHook(() => useCreateRoom(), {
      wrapper: TestQueryProvider,
    })

    act(() => {
      result.current.mutate({
        name: 'Test Room',
        description: 'Test Description',
      })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockResponse)
  })

  it('should call fetch with correct parameters', async () => {
    const mockResponse = { roomId: 'new-room-id' }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    const { result } = renderHook(() => useCreateRoom(), {
      wrapper: TestQueryProvider,
    })

    await act(async () => {
      await result.current.mutateAsync({
        name: 'My Room',
        description: 'My Description',
      })
    })

    expect(global.fetch).toHaveBeenCalledWith('http://localhost:3333/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'My Room', description: 'My Description' }),
    })
  })

  it('should handle mutation error', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error('Network error')
    )

    const { result } = renderHook(() => useCreateRoom(), {
      wrapper: TestQueryProvider,
    })

    act(() => {
      result.current.mutate({ name: 'Test' })
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })

  it('should invalidate rooms query on success', async () => {
    const queryClient = createTestQueryClient()
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries')

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ roomId: 'new-id' }),
    })

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <TestQueryProvider client={queryClient}>{children}</TestQueryProvider>
    )

    const { result } = renderHook(() => useCreateRoom(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync({ name: 'Test' })
    })

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['get-rooms'],
      })
    })
  })

  it('should work without description', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ roomId: 'id' }),
    })

    const { result } = renderHook(() => useCreateRoom(), {
      wrapper: TestQueryProvider,
    })

    act(() => {
      result.current.mutate({ name: 'Room Only Name' })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})
