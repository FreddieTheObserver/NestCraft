import { apiFetch, readApiError } from '../utils/api'
import type { OrderResponse, OrderStatus } from './orders'

export type AdminOrder = OrderResponse & {
  userId: number
  updatedAt: string
  user: {
    id: number
    name: string
    email: string
    role: string
  }
}

export async function getAdminOrders(): Promise<AdminOrder[]> {
  const response = await apiFetch('/api/admin/orders')

  if (!response.ok) {
    throw new Error(await readApiError(response, 'Failed to fetch admin orders'))
  }

  return response.json() as Promise<AdminOrder[]>
}

export async function updateAdminOrderStatus(
  id: number,
  status: OrderStatus,
): Promise<AdminOrder> {
  const response = await apiFetch(`/api/admin/orders/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  })

  if (!response.ok) {
    throw new Error(await readApiError(response, 'Failed to update order status'))
  }

  return response.json() as Promise<AdminOrder>
}
