import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CreateRoomForm } from '@/components/create-room-form'
import { TestProviders } from '../mocks/router'

describe('CreateRoomForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ roomId: 'new-room-id' }),
    })
  })

  it('should render form fields', () => {
    render(
      <TestProviders>
        <CreateRoomForm />
      </TestProviders>
    )

    expect(screen.getByLabelText(/nome da sala/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/descrição/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /criar sala/i })
    ).toBeInTheDocument()
  })

  it('should render card with title and description', () => {
    render(
      <TestProviders>
        <CreateRoomForm />
      </TestProviders>
    )

    expect(
      screen.getByText('Criar sala', { selector: '[data-slot="card-title"]' })
    ).toBeInTheDocument()
    expect(
      screen.getByText(/crie uma nova sala para começar/i)
    ).toBeInTheDocument()
  })

  it('should show validation error for short name', async () => {
    const user = userEvent.setup()

    render(
      <TestProviders>
        <CreateRoomForm />
      </TestProviders>
    )

    const nameInput = screen.getByLabelText(/nome da sala/i)
    await user.type(nameInput, 'ab')

    const submitButton = screen.getByRole('button', { name: /criar sala/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/pelo menos 3 caracteres/i)).toBeInTheDocument()
    })
  })

  it('should submit form successfully with valid data', async () => {
    const user = userEvent.setup()

    render(
      <TestProviders>
        <CreateRoomForm />
      </TestProviders>
    )

    await user.type(screen.getByLabelText(/nome da sala/i), 'Test Room')
    await user.type(screen.getByLabelText(/descrição/i), 'A description')
    await user.click(screen.getByRole('button', { name: /criar sala/i }))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3333/rooms',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('Test Room'),
        })
      )
    })
  })

  it('should clear form after successful submission', async () => {
    const user = userEvent.setup()

    render(
      <TestProviders>
        <CreateRoomForm />
      </TestProviders>
    )

    const nameInput = screen.getByLabelText(/nome da sala/i)
    const descriptionInput = screen.getByLabelText(/descrição/i)

    await user.type(nameInput, 'Test Room')
    await user.type(descriptionInput, 'Description')
    await user.click(screen.getByRole('button', { name: /criar sala/i }))

    await waitFor(() => {
      expect(nameInput).toHaveValue('')
      expect(descriptionInput).toHaveValue('')
    })
  })

  it('should work without description', async () => {
    const user = userEvent.setup()

    render(
      <TestProviders>
        <CreateRoomForm />
      </TestProviders>
    )

    await user.type(screen.getByLabelText(/nome da sala/i), 'Room Without Desc')
    await user.click(screen.getByRole('button', { name: /criar sala/i }))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled()
    })
  })

  it('should have placeholder text on name input', () => {
    render(
      <TestProviders>
        <CreateRoomForm />
      </TestProviders>
    )

    expect(
      screen.getByPlaceholderText(/digite o nome da sala/i)
    ).toBeInTheDocument()
  })
})
