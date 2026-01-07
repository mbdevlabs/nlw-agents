import { render, screen } from '@testing-library/react'
import { QuestionItem } from '@/components/question-item'

describe('QuestionItem', () => {
  it('should render question text', () => {
    const question = {
      id: '1',
      question: 'What is TypeScript?',
      answer: 'A typed superset of JavaScript.',
      createdAt: '2024-01-01T00:00:00Z',
    }

    render(<QuestionItem question={question} />)

    expect(screen.getByText('What is TypeScript?')).toBeInTheDocument()
  })

  it('should render answer when provided', () => {
    const question = {
      id: '1',
      question: 'What is React?',
      answer: 'A JavaScript library for building user interfaces.',
      createdAt: '2024-01-01T00:00:00Z',
    }

    render(<QuestionItem question={question} />)

    expect(
      screen.getByText('A JavaScript library for building user interfaces.')
    ).toBeInTheDocument()
    expect(screen.getByText('Resposta da IA')).toBeInTheDocument()
  })

  it('should show loading state when generating answer', () => {
    const question = {
      id: '1',
      question: 'Pending question?',
      answer: null,
      createdAt: '2024-01-01T00:00:00Z',
      isGeneratingAnswer: true,
    }

    render(<QuestionItem question={question} />)

    expect(screen.getByText(/gerando resposta/i)).toBeInTheDocument()
  })

  it('should not show answer section when no answer and not generating', () => {
    const question = {
      id: '1',
      question: 'No answer yet',
      answer: null,
      createdAt: '2024-01-01T00:00:00Z',
      isGeneratingAnswer: false,
    }

    render(<QuestionItem question={question} />)

    expect(screen.queryByText('Resposta da IA')).not.toBeInTheDocument()
  })

  it('should display pergunta label', () => {
    const question = {
      id: '1',
      question: 'Test question',
      answer: null,
      createdAt: '2024-01-01T00:00:00Z',
    }

    render(<QuestionItem question={question} />)

    expect(screen.getByText('Pergunta')).toBeInTheDocument()
  })

  it('should handle empty answer string', () => {
    const question = {
      id: '1',
      question: 'Test',
      answer: '',
      createdAt: '2024-01-01T00:00:00Z',
    }

    render(<QuestionItem question={question} />)

    // Empty string is falsy, so answer section should not show
    expect(screen.queryByText('Resposta da IA')).not.toBeInTheDocument()
  })

  it('should render with multiline question', () => {
    const question = {
      id: '1',
      question: 'First line\nSecond line\nThird line',
      answer: 'Answer here',
      createdAt: '2024-01-01T00:00:00Z',
    }

    render(<QuestionItem question={question} />)

    expect(screen.getByText(/First line/)).toBeInTheDocument()
  })

  it('should render with multiline answer', () => {
    const question = {
      id: '1',
      question: 'Question?',
      answer: 'First paragraph\n\nSecond paragraph',
      createdAt: '2024-01-01T00:00:00Z',
    }

    render(<QuestionItem question={question} />)

    expect(screen.getByText(/First paragraph/)).toBeInTheDocument()
  })
})
