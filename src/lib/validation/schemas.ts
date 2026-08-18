import { z } from "zod";

/**
 * Zod schemas for every authenticated input. All auth inputs
 * are validated server-side before touching Supabase.
 */

export const signInSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z.string().min(6, "Enter your password."),
});

export const signUpSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Enter your full name.")
    .max(100, "Name is too long."),
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters.")
    .max(72, "Password is too long."),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(6, "Password must be at least 6 characters.")
      .max(72, "Password is too long."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const profileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Enter your full name.")
    .max(100, "Name is too long."),
  phone: z
    .string()
    .trim()
    .max(20, "Phone number is too long.")
    .optional()
    .or(z.literal("")),
});

export const newsletterSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
});

// ------------------------------------------------------------
// Admin schemas — structured JSON submitted by admin forms.
// Money arrives as GHS numbers; conversion to pesewas happens
// in the server actions.
// ------------------------------------------------------------

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const productVariantInputSchema = z.object({
  colour: z.string().trim().min(1),
  secondValue: z.string().trim().min(1),
  priceGhs: z.number().positive("Variant price must be greater than zero."),
  compareAtGhs: z.number().positive().nullable(),
  stock: z.number().int().nonnegative("Stock cannot be negative."),
  sku: z.string().trim().max(64).optional(),
  active: z.boolean(),
});

export const productFormSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().trim().min(2, "Name is required.").max(200, "Name is too long."),
    slug: z
      .string()
      .trim()
      .min(2, "Slug is required.")
      .max(200)
      .regex(SLUG_RE, "Slug must be lowercase letters, numbers and hyphens."),
    sku: z.string().trim().max(64).optional(),
    brand: z.string().trim().max(100).optional(),
    categoryId: z.string().min(1, "Pick a category.").nullable(),
    shortDescription: z.string().trim().max(600).optional(),
    description: z.string().trim().optional(),
    seoTitle: z.string().trim().max(200).optional(),
    seoDescription: z.string().trim().max(300).optional(),
    basePriceGhs: z.number().positive("Base price must be greater than zero."),
    compareAtPriceGhs: z.number().positive().nullable(),
    costPriceGhs: z.number().nonnegative().nullable(),
    status: z.enum(["draft", "active", "archived"]),
    isFeatured: z.boolean(),
    isNewArrival: z.boolean(),
    isBestseller: z.boolean(),
    isLimited: z.boolean(),
    trackInventory: z.boolean(),
    colours: z.array(z.string().trim().min(1)).min(1, "Add at least one colour."),
    secondOptionName: z.enum(["Size", "Volume", "Material", "Scent"]).nullable(),
    secondValues: z.array(z.string().trim().min(1)),
    variants: z.array(productVariantInputSchema),
  })
  .refine((data) => !data.secondOptionName || data.secondValues.length > 0, {
    message: "Add at least one value for the second option.",
    path: ["secondValues"],
  })
  .refine((data) => data.variants.length > 0, {
    message: "At least one variant is required.",
    path: ["variants"],
  });

export const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, "Name is required.").max(100),
  slug: z.string().trim().min(1).max(100).regex(SLUG_RE, "Invalid slug format."),
  parentId: z.string().nullable(),
  displayOrder: z.number().int(),
  isActive: z.boolean(),
  isHomepageVisible: z.boolean(),
});

export const discountSchema = z
  .object({
    id: z.string().optional(),
    code: z
      .string()
      .trim()
      .min(3, "Code is too short.")
      .max(20, "Code is too long.")
      .regex(/^[A-Z0-9-]+$/, "Use uppercase letters, numbers and hyphens."),
    description: z.string().trim().max(300).optional(),
    discountType: z.enum(["percentage", "fixed"]),
    discountValue: z.number().positive("Value must be greater than zero."),
    minOrderGhs: z.number().nonnegative(),
    maxDiscountGhs: z.number().positive().nullable(),
    usageLimit: z.number().int().positive().nullable(),
    startsAt: z.string().nullable(),
    expiresAt: z.string().nullable(),
    isActive: z.boolean(),
  })
  .refine(
    (data) => data.discountType !== "percentage" || data.discountValue <= 100,
    { message: "Percentage discounts cannot exceed 100.", path: ["discountValue"] }
  );

export const deliveryMethodSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, "Name is required.").max(100),
  code: z.string().trim().min(1).max(50).regex(/^[a-z0-9_]+$/, "Use lowercase letters, numbers and underscores."),
  description: z.string().trim().max(300).optional(),
  feeGhs: z.number().nonnegative(),
  freeThresholdGhs: z.number().positive().nullable(),
  estimatedDuration: z.string().trim().max(100).optional(),
  isActive: z.boolean(),
  displayOrder: z.number().int(),
});

export const orderStatusSchema = z.object({
  orderId: z.string().min(1),
  status: z.enum([
    "pending",
    "confirmed",
    "processing",
    "ready_for_pickup",
    "out_for_delivery",
    "delivered",
    "cancelled",
    "refunded",
  ]),
  paymentStatus: z.enum([
    "unpaid",
    "pending",
    "paid",
    "failed",
    "refunded",
    "partially_refunded",
  ]),
  adminNotes: z.string().trim().max(2000).optional(),
});

export const roleChangeSchema = z.object({
  profileId: z.string().min(1),
  role: z.enum(["customer", "staff", "admin", "super_admin"]),
});

export type ProductFormInput = z.infer<typeof productFormSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type DiscountInput = z.infer<typeof discountSchema>;
export type DeliveryMethodInput = z.infer<typeof deliveryMethodSchema>;
export type OrderStatusInput = z.infer<typeof orderStatusSchema>;
export type RoleChangeInput = z.infer<typeof roleChangeSchema>;

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type NewsletterInput = z.infer<typeof newsletterSchema>;
