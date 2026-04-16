import type { Response } from 'express';

import { subscribeOrderEvents, type OrderStreamEvent } from '../lib/orderEvents.js';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { sendError } from '../utils/http.js';

const HEARTBEAT_INTERVAL_MS = 15_000;

function writeSseComment(res: Response, comment: string) {
      res.write(`: ${comment}\n\n`);
}

function writeSseEvent(res: Response, event: OrderStreamEvent) {
      res.write(`event: ${event.type}\n`);
      res.write(`data: ${JSON.stringify(event)}\n\n`);
}

export function streamOrderEventsHandler(
      req: AuthenticatedRequest,
      res: Response,
) {
      const user = req.user;

      if (!user) {
            return sendError(res, 401, 'UNAUTHORIZED', 'Authentication is required');
      }

      res.status(200);
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no');
      res.flushHeaders();

      writeSseComment(res, 'connected');

      const unsubscribe = subscribeOrderEvents({
            userId: user.id,
            role: user.role === "admin" ? "admin" : "customer",
            send(event) {
                  writeSseEvent(res, event);
            },
      });

      const heartbeat = setInterval(() => {
            writeSseComment(res, 'heartbeat');
      }, HEARTBEAT_INTERVAL_MS);

      let cleanedUp = false;

      const cleanup = () => {
            if (cleanedUp) {
                  return;
            }

            cleanedUp = true;
            clearInterval(heartbeat);
            unsubscribe();
      };

      req.on('close', cleanup);
      res.on('close', cleanup);
}
