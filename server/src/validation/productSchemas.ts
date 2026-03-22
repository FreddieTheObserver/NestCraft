import { z } from 'zod';

export const productSlugParamsSchema = z.object({
      slug: z     
            .string() 
            .trim() 
            .min(1, "Product slug is required")
            .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid product slug"),
});

export const productIdParamsSchema = z.object({
      id: z.coerce.number().int().positive("Product id must be a positive integer"),
});

const optionalSearchSchema = z.preprocess(
      (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
      z
            .string()
            .trim()
            .min(1, "Search must not be empty")
            .max(100, "Search is too long")
            .optional(),
);

const optionalCategorySchema = z.preprocess(
      (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
      z
            .string()
            .trim()
            .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid category slug")
            .optional(),
);

export const productListQuerySchema = z.object({
      search: optionalSearchSchema,
      category: optionalCategorySchema,
      sort: z.enum(["newest", "price-asc", "price-desc"]).optional().default("newest"),
});

export type ProductListQuery = z.infer<typeof productListQuerySchema>;

const optionalProductImageSchema = z
      .string() 
      .trim()
      .optional()
      .refine(
            (value) => 
                  value === undefined || 
                  value === "" ||
                  value.startsWith("/api/uploads") ||
                  z.string().url().safeParse(value).success,
            {
                  message: "Image must be an uploaded file path or valid URL",
            },
      );

export const createProductSchema = z.object({
      name: z.string().trim().min(2, "Name must be at least 2 characters"),
      slug: z
            .string()
            .trim()
            .min(2, "Slug is required")
            .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be URL-friendly"),
      description: z.string().trim().min(10, "Description must be at least 10 characters"),
      price: z.coerce.number().positive("Price must be greater than 0"),
      stock: z.coerce.number().int().min(0, "Stock cannot be negative"), 
      imageUrl: optionalProductImageSchema,
      categoryId: z.coerce.number().int().positive("Category is required"),
      isFeatured: z.boolean().optional(),
      isActive: z.boolean().optional(),
});

export const updateProductSchema = z.object({
      name: z.string().trim().min(2, "Name must be at least 2 characters").optional(),
      slug: z
            .string()
            .trim()
            .min(2, "Slug is required")
            .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be URL-friendly")
            .optional(),
      description: z.string().trim().min(10, "Description must be at least 10 characters").optional(),
      price: z.coerce.number().positive("Price must be greater than 0").optional(),
      stock: z.coerce.number().int().min(0, "Stock cannot be negative").optional(), 
      imageUrl: optionalProductImageSchema,
      categoryId: z.coerce.number().int().positive("Category is required").optional(),
      isFeatured: z.boolean().optional(),
      isActive: z.boolean().optional(),
})
.refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided",
})
