import { render, screen, waitFor } from '@testing-library/react'
import { RoomList } from '@/components/room-list'
import { TestProviders } from '../mocks/router'

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

describe('RoomList', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should show loading state initially', () => {
    ;(global.fetch as jest.Mock).mockImplementation(
      () => new Promise(() => {})
    )

    render(
      <TestProviders>
        <RoomList />
      </TestProviders>
    )

    expect(screen.getByText(/carregando salas/i)).toBeInTheDocument()
  })

  it('should render list of rooms', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockRooms,
    })

    render(
      <TestProviders>
        <RoomList />
      </TestProviders>
    )

    await waitFor(() => {
      expect(screen.getByText('Test Room 1')).toBeInTheDocument()
      expect(screen.getByText('Test Room 2')).toBeInTheDocument()
    })
  })

  it('should display question count for each room', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockRooms,
    })

    render(
      <TestProviders>
        <RoomList />
      </TestProviders>
    )

    await waitFor(() => {
      expect(screen.getByText('5 pergunta(s)')).toBeInTheDocument()
      expect(screen.getByText('3 pergunta(s)')).toBeInTheDocument()
    })
  })

  it('should render links to room pages', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockRooms,
    })

    render(
      <TestProviders>
        <RoomList />
      </TestProviders>
    )

    await waitFor(() => {
      const links = screen.getAllByRole('link')
      expect(links[0]).toHaveAttribute('href', '/room/room-1')
      expect(links[1]).toHaveAttribute('href', '/room/room-2')
    })
  })

  it('should render card header with title and description', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    })

    render(
      <TestProviders>
        <RoomList />
      </TestProviders>
    )

    expect(screen.getByText('Salas recentes')).toBeInTheDocument()
    expect(
      screen.getByText(/acesso rápido às salas/i)
    ).toBeInTheDocument()
  })

  it('should show enter button for each room', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockRooms,
    })

    render(
      <TestProviders>
        <RoomList />
      </TestProviders>
    )

    await waitFor(() => {
      const enterButtons = screen.getAllByText('Entrar')
      expect(enterButtons.length).toBe(2)
    })
  })

  it('should render empty state when no rooms exist', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    })

    render(
      <TestProviders>
        <RoomList />
      </TestProviders>
    )

    await waitFor(() => {
      expect(screen.queryByText(/carregando/i)).not.toBeInTheDocument()
    })

    // No rooms should be rendered
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })
})
