import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from './client'

export type Fungicide = 'contact' | 'systemic' | 'sulfur'
export type TreatmentAction = 'protect' | 'cure' | 'inspect'
export type TreatmentDisease = 'downy_mildew' | 'powdery_mildew'

export type Treatment = {
  id: string
  vineyard_id: string
  applied_on: string
  fungicide: Fungicide
  product: string | null
  created_at: string
  updated_at: string
}

export type TreatmentCreateInput = {
  applied_on: string
  fungicide: Fungicide
  product?: string | null
}

export type Recommendation = {
  action: TreatmentAction
  disease: TreatmentDisease
  fungicide: Fungicide | null
  due_by: string
  risk_day: string
  reason: string
}

export type TreatmentPlan = {
  today: string
  protected_until: {
    downy_mildew: string | null
    powdery_mildew: string | null
  }
  recommendations: Recommendation[]
}

export const treatmentsKey = (id: string) =>
  ['vineyards', id, 'treatments'] as const
export const treatmentPlanKey = (id: string) =>
  ['vineyards', id, 'treatments', 'plan'] as const

export async function fetchTreatments(vineyardId: string) {
  const { data } = await api.get<Treatment[]>(
    `/vineyards/${vineyardId}/treatments`,
  )
  return data
}

export function useTreatments(vineyardId: string, enabled = true) {
  return useQuery({
    queryKey: treatmentsKey(vineyardId),
    queryFn: () => fetchTreatments(vineyardId),
    staleTime: 5 * 60_000,
    enabled,
  })
}

export async function fetchTreatmentPlan(vineyardId: string) {
  const { data } = await api.get<TreatmentPlan>(
    `/vineyards/${vineyardId}/treatments/plan`,
  )
  return data
}

export function useTreatmentPlan(vineyardId: string, enabled = true) {
  return useQuery({
    queryKey: treatmentPlanKey(vineyardId),
    queryFn: () => fetchTreatmentPlan(vineyardId),
    staleTime: 5 * 60_000,
    enabled,
  })
}

export async function createTreatment(
  vineyardId: string,
  input: TreatmentCreateInput,
) {
  const { data } = await api.post<Treatment>(
    `/vineyards/${vineyardId}/treatments`,
    input,
  )
  return data
}

export function useCreateTreatment(vineyardId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: TreatmentCreateInput) =>
      createTreatment(vineyardId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: treatmentsKey(vineyardId),
      })
      void queryClient.invalidateQueries({
        queryKey: treatmentPlanKey(vineyardId),
      })
    },
  })
}

export async function deleteTreatment(vineyardId: string, treatmentId: string) {
  await api.delete(`/vineyards/${vineyardId}/treatments/${treatmentId}`)
}

export function useDeleteTreatment(vineyardId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (treatmentId: string) =>
      deleteTreatment(vineyardId, treatmentId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: treatmentsKey(vineyardId),
      })
      void queryClient.invalidateQueries({
        queryKey: treatmentPlanKey(vineyardId),
      })
    },
  })
}
