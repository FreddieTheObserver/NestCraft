import { buildApiUrl, readApiError } from '../utils/api';
import type { OrderStatus } from './orders';

export type OrderStreamEvent =
      | {
              type: 'order.created'
              orderNumber: string
              userId: number
        }
      | {
              type: 'order.updated'
              orderNumber: string
              userId: number
              status: OrderStatus
        };

type OrderStreamSubscriptionOptions = {
      signal?: AbortSignal
      onEvent: (event: OrderStreamEvent) => void
      onError?: (error: Error) => void
};

const ORDER_STREAM_PATH = '/api/orders/stream';
const RECONNECT_DELAY_MS = 3_000;

async function readOrderStream(
      signal: AbortSignal,
      onEvent: (event: OrderStreamEvent) => void,
) {
      const response = await fetch(buildApiUrl(ORDER_STREAM_PATH), {
            headers: {
                  Accept: 'text/event-stream',
            },
            credentials: 'include',
            cache: 'no-store',
            signal,
      });

      if (!response.ok) {
            throw new Error(await readApiError(response, 'Failed to connect to live order updates'));
      }

      if (!response.body) {
            throw new Error('Live order updates are unavailable');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let buffer = '';
      let dataLines: string[] = [];

      const flushEvent = () => {
            if (dataLines.length === 0) {
                  return;
            }

            const payload = dataLines.join('\n');
            dataLines = [];

            onEvent(JSON.parse(payload) as OrderStreamEvent);
      };

      try {
            while (true) {
                  const { done, value } = await reader.read();

                  if (done) {
                        buffer += decoder.decode();
                        break;
                  }

                  buffer += decoder.decode(value, { stream: true });

                  const lines = buffer.split(/\r?\n/);
                  buffer = lines.pop() ?? '';

                  for (const line of lines) {
                        if (line === '') {
                              flushEvent();
                              continue;
                        }

                        if (line.startsWith(':') || line.startsWith('event:') || line.startsWith('retry:')) {
                              continue;
                        }

                        if (line.startsWith('data:')) {
                              dataLines.push(line.slice(5).trimStart());
                        }
                  }
            }

            const trailingLine = buffer.trimEnd();

            if (trailingLine.startsWith('data:')) {
                  dataLines.push(trailingLine.slice(5).trimStart());
            }

            flushEvent();
      } finally {
            reader.releaseLock();
      }
}

export function subscribeToOrderStream({
      signal,
      onEvent,
      onError,
}: OrderStreamSubscriptionOptions) {
      const controller = new AbortController();
      let reconnectTimer: ReturnType<typeof setTimeout> | undefined;

      const handleParentAbort = () => {
            controller.abort();
      };

      signal?.addEventListener('abort', handleParentAbort, { once: true });

      const connect = async () => {
            try {
                  await readOrderStream(controller.signal, onEvent);
            } catch (error) {
                  if (controller.signal.aborted) {
                        return;
                  }

                  onError?.(
                        error instanceof Error
                              ? error
                              : new Error('Live order updates disconnected'),
                  );
            }

            if (controller.signal.aborted) {
                  return;
            }

            reconnectTimer = setTimeout(() => {
                  void connect();
            }, RECONNECT_DELAY_MS);
      };

      void connect();

      return () => {
            if (reconnectTimer) {
                  clearTimeout(reconnectTimer);
            }

            signal?.removeEventListener('abort', handleParentAbort);
            controller.abort();
      };
}
