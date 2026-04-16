import type { NextFunction, Request, Response } from "express";
import { ZodError, type ZodTypeAny } from 'zod';

import { sendError } from '../utils/http.js';

type SchemaSet = {
      body?: ZodTypeAny;
      params?: ZodTypeAny;
      query?: ZodTypeAny;
};

export function validate(schemas: SchemaSet) {
      return (req: Request, res: Response, next: NextFunction) => {
            try {
                  if (schemas.body) {
                        const parsed = schemas.body.parse(req.body);
                        res.locals.validatedBody = parsed;
                        req.body = parsed;
                  }

                  if (schemas.params) {
                        const parsed = schemas.params.parse(req.params);
                        res.locals.validatedParams = parsed;
                        req.params = parsed as Request["params"];
                  }

                  if (schemas.query) {
                        res.locals.validatedQuery = schemas.query.parse(req.query);
                  }

                  return next();
            } catch (error) {
                  if (error instanceof ZodError) {
                        return sendError(res, 400, "VALIDATION_ERROR", "Request validation failed", {
                              issues: error.issues.map((issue) => ({
                                    path: issue.path.join("."),
                                    message: issue.message,
                              })),
                        });
                  }
                  return sendError(res, 500, "INTERNAL_ERROR", "Unexpected validation failure");
            }
      };
}
