import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { createElement, type ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import {
  fetchPhenologyEstimate,
  fetchTerroirIndices,
  usePhenologyEstimate,
  useTerroirIndices,
} from './bioclimatic'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('bioclimatic API', () => {
  it('fetchPhenologyEstimate возвращает оценку фазы BBCH', async () => {
    const data = await fetchPhenologyEstimate('vineyard-1')
    expect(data.current_bbch).toBe(75)
    expect(data.current_stage_name).toBe('Смыкание ягод (размер «горошина»)')
    expect(data.accumulated_gdd).toBe(820.5)
    expect(data.next_bbch).toBe(81)
  })

  it('fetchTerroirIndices возвращает биоклиматические индексы', async () => {
    const data = await fetchTerroirIndices('vineyard-1')
    expect(data.winkler.gdd_sum).toBe(1720.5)
    expect(data.winkler.region_class).toBe('Region III')
    expect(data.huglin.hi_value).toBe(2140.0)
    expect(data.selyaninov.htc_value).toBe(0.85)
  })

  it('usePhenologyEstimate хук загружает данные', async () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => usePhenologyEstimate('vineyard-1'), {
      wrapper,
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.current_bbch).toBe(75)
  })

  it('useTerroirIndices хук загружает данные', async () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useTerroirIndices('vineyard-1'), {
      wrapper,
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.winkler.region_class).toBe('Region III')
  })
})
