import { z } from "zod";

export const adminProductListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(12),
  search: z.string().trim().min(1).max(100).optional(),
  isActive: z.enum(["true", "false"]).optional(),
  isFeatured: z.enum(["true", "false"]).optional(),
});

export type AdminProductListQuery = z.infer<typeof adminProductListQuerySchema>;
