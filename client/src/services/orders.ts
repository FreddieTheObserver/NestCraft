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

export type OrderResponse = {
      id: number
      status: string
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

export async function createOrder(data: CreateOrderInput, token: string): Promise<OrderResponse> {
      const response = await fetch('/api/orders', {
            method: 'POST',
            headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
      })

      if (!response.ok) {
            throw new Error('Failed to create order')
      }

      return response.json() as Promise<OrderResponse>
}

export async function getMyOrders(token: string): Promise<OrderResponse[]> {
      const response = await fetch('/api/orders/me', {
            headers: {
                  Authorization: `Bearer ${token}`,
            },
      })

      if (!response.ok) {
            throw new Error('Failed to fetch orders')
      }

      return response.json() as Promise<OrderResponse[]>
}
