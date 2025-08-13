import { useQuery } from '@tanstack/react-query'
import type { GetRoomQuestionsResponse } from './types/get-room-questions-response'

export function useRoomQuestions(roomId: string) {
  return useQuery({
    queryKey: ['get-questions', roomId],
    queryFn: async () => {
      const response = await fetch(
        `http://127.0.0.1:3333/rooms/${roomId}/questions`
      )
      const result: GetRoomQuestionsResponse = await response.json()
      return result
    },
  })
}
