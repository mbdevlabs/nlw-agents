import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type React from 'react'

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

interface TestQueryProviderProps {
  children: React.ReactNode
  client?: QueryClient
}

export function TestQueryProvider({
  children,
  client,
}: TestQueryProviderProps) {
  const queryClient = client ?? createTestQueryClient()
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
