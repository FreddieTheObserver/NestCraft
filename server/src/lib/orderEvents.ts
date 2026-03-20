import { randomUUID } from 'node:crypto';
import type { OrderStatus } from '../generated/prisma/client.js';

type UserRole = 'customer' | 'admin';

export type OrderStreamEvent = 
|     {
      type: 'order.created'
      orderNumber: string 
      userId: number
      }
|     {
      type: 'order.updated'
      orderNumber: string
      userId: number 
      status: OrderStatus
      }

type Subscriber = {
      id: string 
      userId: number 
      role: UserRole
      send: (event: OrderStreamEvent) => void
}

const subscribers = new Map<string, Subscriber>();

export function subscribeOrderEvents(subscriber: Omit<Subscriber, 'id'>) {
      const id = randomUUID()

      subscribers.set(id, {
            id,
            ...subscriber,
      })

      return () => {
            subscribers.delete(id)
      }
}

function canReceiveEvent(subscriber: Subscriber, event: OrderStreamEvent) {
      return subscriber.role === 'admin' || subscriber.userId === event.userId
}

function broadcastEvent(event: OrderStreamEvent) {
      for (const subscriber of subscribers.values()) {
            if (!canReceiveEvent(subscriber, event)) {
                  continue
            }

            try {
                  subscriber.send(event)
            } catch {
                  subscribers.delete(subscriber.id)
            }
      }
}

export function broadcastOrderCreated(orderNumber: string, userId: number) {
      broadcastEvent({
            type: 'order.created',
            orderNumber,
            userId,
      })
}

export function broadcastOrderUpdated(
      orderNumber: string,
      userId: number,
      status: OrderStatus,
) {
      broadcastEvent({
            type: 'order.updated',
            orderNumber,
            userId,
            status,
      })
}
