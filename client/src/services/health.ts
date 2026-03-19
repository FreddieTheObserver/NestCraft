import { apiFetch } from '../utils/api'

export type HealthResponse = {
  status: string
  message: string
  timestamp: string
}

export async function getHealth(): Promise<HealthResponse> {
  const response = await apiFetch('/api/health')

  if (!response.ok) {
    throw new Error('Failed to fetch API health')
  }

  return response.json() as Promise<HealthResponse>
}
