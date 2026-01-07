import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QuestionForm } from '@/components/question-form'
import { TestProviders } from '../mocks/router'

describe('QuestionForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ questionId: 'q-id', answer: 'AI Answer' }),
    })
  })

  it('should render form elements', () => {
    render(
      <TestProviders>
        <QuestionForm roomId="room-123" />
      </TestProviders>
    )

    expect(screen.getByLabelText(/sua pergunta/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /enviar pergunta/i })
    ).toBeInTheDocument()
  })

  it('should render card with title and description', () => {
    render(
      <TestProviders>
        <QuestionForm roomId="room-123" />
      </TestProviders>
    )

    expect(screen.getByText('Fazer uma Pergunta')).toBeInTheDocument()
    expect(
      screen.getByText(/digite sua pergunta abaixo/i)
    ).toBeInTheDocument()
  })

  it('should show validation error for empty question', async () => {
    const user = userEvent.setup()

    render(
      <TestProviders>
        <QuestionForm roomId="room-123" />
      </TestProviders>
    )

    await user.click(screen.getByRole('button', { name: /enviar pergunta/i }))

    await waitFor(() => {
      expect(screen.getByText(/pergunta é obrigatória/i)).toBeInTheDocument()
    })
  })

  it('should show validation error for short question', async () => {
    const user = userEvent.setup()

    render(
      <TestProviders>
        <QuestionForm roomId="room-123" />
      </TestProviders>
    )

    await user.type(screen.getByLabelText(/sua pergunta/i), 'short')
    await user.click(screen.getByRole('button', { name: /enviar pergunta/i }))

    await waitFor(() => {
      expect(
        screen.getByText(/pelo menos 10 caracteres/i)
      ).toBeInTheDocument()
    })
  })

  it('should submit form with valid question', async () => {
    const user = userEvent.setup()

    render(
      <TestProviders>
        <QuestionForm roomId="room-123" />
      </TestProviders>
    )

    await user.type(
      screen.getByLabelText(/sua pergunta/i),
      'What is the meaning of this content?'
    )
    await user.click(screen.getByRole('button', { name: /enviar pergunta/i }))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3333/rooms/room-123/questions',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('What is the meaning'),
        })
      )
    })
  })

  it('should clear form after successful submission', async () => {
    const user = userEvent.setup()

    render(
      <TestProviders>
        <QuestionForm roomId="room-123" />
      </TestProviders>
    )

    const textarea = screen.getByLabelText(/sua pergunta/i)
    await user.type(textarea, 'This is a valid question with enough characters')
    await user.click(screen.getByRole('button', { name: /enviar pergunta/i }))

    await waitFor(() => {
      expect(textarea).toHaveValue('')
    })
  })

  it('should have placeholder text', () => {
    render(
      <TestProviders>
        <QuestionForm roomId="room-123" />
      </TestProviders>
    )

    expect(
      screen.getByPlaceholderText(/o que você gostaria de saber/i)
    ).toBeInTheDocument()
  })

  it('should use correct roomId in API call', async () => {
    const user = userEvent.setup()

    render(
      <TestProviders>
        <QuestionForm roomId="specific-room-id" />
      </TestProviders>
    )

    await user.type(
      screen.getByLabelText(/sua pergunta/i),
      'Testing the roomId parameter'
    )
    await user.click(screen.getByRole('button', { name: /enviar pergunta/i }))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('specific-room-id'),
        expect.any(Object)
      )
    })
  })
})
