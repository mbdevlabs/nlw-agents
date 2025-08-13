import { useQuery } from '@tanstack/react-query'
import type { GetRoomsResponse } from './types/get-rooms-response'

export function useRooms() {
  return useQuery({
    queryKey: ['get-rooms'],
    queryFn: async () => {
      const response = await fetch('http://127.0.0.1:3333/rooms')
      const result: GetRoomsResponse = await response.json()
      return result
    },
  })
}
