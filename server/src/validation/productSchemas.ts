import { z } from 'zod';

export const productSlugParamsSchema = z.object({
      slug: z     
            .string() 
            .trim() 
            .min(1, "Product slug is required")
            .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid product slug"),
});

