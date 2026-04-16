import { apiFetch, readApiError } from '../utils/api'

export type CheckoutItemInput = {
      productId: number
      quantity: number
}

export type CreateOrderInput = {
      shippingName: string
      shippingEmail: string
      shippingPhone: string
      shippingCity: string
      shippingAddress: string
      notes?: string
      items: CheckoutItemInput[]
}

export type OrderStatus = 'pending' | 'confirmed' | 'cancelled'

export type OrderResponse = {
      id: number
      orderNumber: string
      status: OrderStatus
      subtotal: string
      shippingFee: string
      totalAmount: string
      createdAt: string
      updatedAt?: string
      shippingName: string
      shippingEmail: string
      shippingPhone: string
      shippingCity: string
      shippingAddress: string
      notes?: string | null
      items: Array<{
            id: number
            productId: number
            quantity: number
            unitPrice: string
            product: {
                  id: number
                  name: string
                  slug: string
                  imageUrl: string | null
            }
      }>
}

export async function createOrder(data: CreateOrderInput): Promise<OrderResponse> {
      const response = await apiFetch('/api/orders', {
            method: 'POST',
            headers: {
                  'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
      })

      if (!response.ok) {
            throw new Error(await readApiError(response, 'Failed to create order'))
      }

      return response.json() as Promise<OrderResponse>
}

export async function getMyOrders(): Promise<OrderResponse[]> {
      const response = await apiFetch('/api/orders/me')

      if (!response.ok) {
            throw new Error(await readApiError(response, 'Failed to fetch orders'))
      }

      return response.json() as Promise<OrderResponse[]>
}

export async function getMyOrderByOrderNumber(
      orderNumber: string,
): Promise<OrderResponse> {
      const response = await apiFetch(`/api/orders/${orderNumber}`);

      if (!response.ok) {
            throw new Error(await readApiError(response, "Failed to fetch order"));
      }

      return response.json() as Promise<OrderResponse>;
}
