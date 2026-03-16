type ApiErrorPayload = {
      error?: {
            code?: string
            message?: string
      }
      message?: string
}

export async function readApiError(response: Response, fallback: string) {
      try {
            const data = (await response.json()) as ApiErrorPayload
            return data.error?.message ?? data.message ?? fallback
      } catch {
            return fallback
      }
}
