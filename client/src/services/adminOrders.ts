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

export type PaginatedAdminOrders = {
  items: AdminOrder[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}

export async function getAdminOrders(
  params: URLSearchParams = new URLSearchParams({ page: '1', pageSize: '10' }),
): Promise<PaginatedAdminOrders> {
  const response = await apiFetch(`/api/admin/orders?${params.toString()}`)

  if (!response.ok) {
    throw new Error(await readApiError(response, 'Failed to fetch admin orders'))
  }

  return response.json() as Promise<PaginatedAdminOrders>
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
