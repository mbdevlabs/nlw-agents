import { GoogleGenAI } from '@google/genai'
import { env } from '../env.ts'

/**
 * Cliente Google GenAI configurado com a API key do ambiente.
 */
const gemini = new GoogleGenAI({
  apiKey: env.GEMINI_API_KEY,
})

/** Modelo padrão para geração de conteúdo e transcrição */
const model = 'gemini-2.5-flash'

/**
 * Transcreve áudio para texto usando o modelo Gemini.
 *
 * @param audioAsBase64 - Áudio codificado em base64
 * @param mimeType - Tipo MIME do áudio (ex: 'audio/webm', 'audio/mp3')
 * @returns Texto transcrito do áudio em português do Brasil
 * @throws Error se a transcrição falhar ou retornar vazio
 *
 * @example
 * ```typescript
 * const audioBuffer = await file.toBuffer()
 * const base64 = audioBuffer.toString('base64')
 * const text = await transcribeAudio(base64, 'audio/webm')
 * ```
 */
export async function transcribeAudio(audioAsBase64: string, mimeType: string) {
  const response = await gemini.models.generateContent({
    model,
    contents: [
      {
        text: 'Transcreva o áudio para português do Brasil. Seja preciso e natural na transcrição. Mantenha a pontuação adequada e dívida o texto em parágrafos quando for apropriado.',
      },
      {
        inlineData: {
          mimeType,
          data: audioAsBase64,
        },
      },
    ],
  })

  if (!response.text) {
    throw new Error('Failed to transcribe audio')
  }

  return response.text
}

/**
 * Gera embeddings vetoriais para um texto usando o modelo text-embedding-004.
 *
 * Os embeddings são usados para busca semântica via pgvector no PostgreSQL.
 * O modelo gera vetores de 768 dimensões.
 *
 * @param text - Texto para gerar embeddings
 * @returns Array de 768 números representando o vetor do texto
 * @throws Error se a geração de embeddings falhar
 *
 * @example
 * ```typescript
 * const embeddings = await generateEmbeddings('Texto para indexar')
 * // embeddings: number[768]
 * await db.insert(audioChunks).values({ transcription, embeddings })
 * ```
 */
export async function generateEmbeddings(text: string) {
  const response = await gemini.models.embedContent({
    model: 'text-embedding-004',
    contents: [{ text }],
    config: {
      taskType: 'RETRIEVAL_DOCUMENT',
    },
  })

  if (!response.embeddings?.[0].values) {
    throw new Error('Failed to generate embeddings.')
  }

  return response.embeddings[0].values
}

/**
 * Gera uma resposta para uma pergunta baseada em contexto fornecido (RAG).
 *
 * Usa o modelo Gemini para gerar respostas em português do Brasil,
 * baseando-se exclusivamente no contexto das transcrições fornecidas.
 *
 * @param question - Pergunta do usuário
 * @param transcriptions - Array de transcrições relevantes como contexto
 * @returns Resposta gerada pela IA baseada no contexto
 * @throws Error se a geração de resposta falhar
 *
 * @example
 * ```typescript
 * const chunks = await findSimilarChunks(questionEmbeddings)
 * const transcriptions = chunks.map(c => c.transcription)
 * const answer = await generateAnswer('O que foi dito sobre X?', transcriptions)
 * ```
 */
export async function generateAnswer(
  question: string,
  transcriptions: string[]
) {
  const context = transcriptions.join('\n\n')

  const prompt = `
    Com base no texto fornecido abaixo como contexto, responda à pergunta de forma clara e objetiva em português do Brasil.

    CONTEXTO:
    ${context}

    PERGUNTA:
    ${question}

    INSTRUÇÕES:
    - Use apenas informações do contexto.
    - Se a resposta não estiver no contexto, apenas responda que não possui informações suficientes para responder".
    - Seja direto e objetivo.
    - Mantenha um tom educativo e profissional.
    - Cite trechos relevantes do contexto, se necessário.
    - Se for citar o contexto, use aspas e indique a parte relevante.
    `.trim()

  const response = await gemini.models.generateContent({
    model,
    contents: [
      {
        text: prompt,
      },
    ],
  })

  if (!response.text) {
    throw new Error('Failed to generate answer')
  }

  return response.text
}
