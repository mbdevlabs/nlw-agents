import { beforeEach, describe, expect, it, jest } from '@jest/globals'

// Mock GoogleGenAI before importing the module
const mockGenerateContent = jest.fn<() => Promise<unknown>>()
const mockEmbedContent = jest.fn<() => Promise<unknown>>()

jest.unstable_mockModule('@google/genai', () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: {
      generateContent: mockGenerateContent,
      embedContent: mockEmbedContent,
    },
  })),
}))

// Import functions after mocking
const { transcribeAudio, generateEmbeddings, generateAnswer } = await import(
  '../../services/gemini.ts'
)

describe('Gemini Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('transcribeAudio', () => {
    it('should transcribe audio successfully', async () => {
      mockGenerateContent.mockResolvedValue({
        text: 'Transcribed text in Portuguese.',
      })

      const result = await transcribeAudio('base64audiodata', 'audio/webm')

      expect(result).toBe('Transcribed text in Portuguese.')
      expect(mockGenerateContent).toHaveBeenCalledTimes(1)
      expect(mockGenerateContent).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gemini-2.5-flash',
          contents: expect.arrayContaining([
            expect.objectContaining({ text: expect.any(String) }),
            expect.objectContaining({
              inlineData: {
                mimeType: 'audio/webm',
                data: 'base64audiodata',
              },
            }),
          ]),
        })
      )
    })

    it('should throw error when transcription fails', async () => {
      mockGenerateContent.mockResolvedValue({ text: null })

      await expect(transcribeAudio('base64', 'audio/webm')).rejects.toThrow(
        'Failed to transcribe audio'
      )
    })

    it('should throw error when response is empty', async () => {
      mockGenerateContent.mockResolvedValue({ text: '' })

      await expect(transcribeAudio('base64', 'audio/webm')).rejects.toThrow(
        'Failed to transcribe audio'
      )
    })

    it('should handle different audio mime types', async () => {
      mockGenerateContent.mockResolvedValue({ text: 'Transcribed audio.' })

      await transcribeAudio('base64data', 'audio/mp3')

      expect(mockGenerateContent).toHaveBeenCalledWith(
        expect.objectContaining({
          contents: expect.arrayContaining([
            expect.objectContaining({
              inlineData: {
                mimeType: 'audio/mp3',
                data: 'base64data',
              },
            }),
          ]),
        })
      )
    })
  })

  describe('generateEmbeddings', () => {
    it('should generate embeddings successfully', async () => {
      const mockEmbeddings = new Array(768).fill(0.5)
      mockEmbedContent.mockResolvedValue({
        embeddings: [{ values: mockEmbeddings }],
      })

      const result = await generateEmbeddings('Test text for embeddings')

      expect(result).toEqual(mockEmbeddings)
      expect(result.length).toBe(768)
      expect(mockEmbedContent).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'text-embedding-004',
          contents: [{ text: 'Test text for embeddings' }],
        })
      )
    })

    it('should throw error when embeddings are null', async () => {
      mockEmbedContent.mockResolvedValue({ embeddings: null })

      await expect(generateEmbeddings('test')).rejects.toThrow(
        'Failed to generate embeddings'
      )
    })

    it('should throw error when embeddings array is empty', async () => {
      mockEmbedContent.mockResolvedValue({ embeddings: [] })

      await expect(generateEmbeddings('test')).rejects.toThrow(
        'Failed to generate embeddings'
      )
    })

    it('should throw error when values are undefined', async () => {
      mockEmbedContent.mockResolvedValue({
        embeddings: [{ values: undefined }],
      })

      await expect(generateEmbeddings('test')).rejects.toThrow(
        'Failed to generate embeddings'
      )
    })
  })

  describe('generateAnswer', () => {
    it('should generate answer from context successfully', async () => {
      mockGenerateContent.mockResolvedValue({ text: 'AI generated answer.' })

      const result = await generateAnswer('What is this?', [
        'Context paragraph 1.',
        'Context paragraph 2.',
      ])

      expect(result).toBe('AI generated answer.')
      expect(mockGenerateContent).toHaveBeenCalledTimes(1)
    })

    it('should include question and context in prompt', async () => {
      mockGenerateContent.mockResolvedValue({ text: 'Answer' })

      await generateAnswer('My question?', ['Context 1', 'Context 2'])

      expect(mockGenerateContent).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gemini-2.5-flash',
          contents: [
            expect.objectContaining({
              text: expect.stringContaining('My question?'),
            }),
          ],
        })
      )

      expect(mockGenerateContent).toHaveBeenCalledWith(
        expect.objectContaining({
          contents: [
            expect.objectContaining({
              text: expect.stringContaining('Context 1'),
            }),
          ],
        })
      )
    })

    it('should throw error when answer generation fails', async () => {
      mockGenerateContent.mockResolvedValue({ text: null })

      await expect(generateAnswer('question?', ['context'])).rejects.toThrow(
        'Failed to generate answer'
      )
    })

    it('should handle empty context array', async () => {
      mockGenerateContent.mockResolvedValue({ text: 'Answer without context' })

      const result = await generateAnswer('Question?', [])

      expect(result).toBe('Answer without context')
    })

    it('should join multiple transcriptions with newlines', async () => {
      mockGenerateContent.mockResolvedValue({ text: 'Combined answer' })

      await generateAnswer('Question?', [
        'First part',
        'Second part',
        'Third part',
      ])

      expect(mockGenerateContent).toHaveBeenCalledWith(
        expect.objectContaining({
          contents: [
            expect.objectContaining({
              text: expect.stringContaining(
                'First part\n\nSecond part\n\nThird part'
              ),
            }),
          ],
        })
      )
    })
  })
})
