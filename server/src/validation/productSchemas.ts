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
      imageUrl: z.string().trim().url("Image URL must be valid").optional().or(z.literal("")),
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
      imageUrl: z.string().trim().url("Image URL must be valid").optional().or(z.literal("")),
      categoryId: z.coerce.number().int().positive("Category is required").optional(),
      isFeatured: z.boolean().optional(),
      isActive: z.boolean().optional(),
})
.refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided",
})
