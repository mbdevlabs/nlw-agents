import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { TestQueryProvider } from './react-query'

interface TestProvidersProps {
  children: React.ReactNode
  initialEntries?: string[]
}

export function TestProviders({
  children,
  initialEntries = ['/'],
}: TestProvidersProps) {
  return (
    <TestQueryProvider>
      <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
    </TestQueryProvider>
  )
}
