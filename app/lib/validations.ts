import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères")
})

export const registerSchema = z.object({
  firstname: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastname: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional()
})

export const productSchema = z.object({
  proName: z.string().min(2, "Le nom du produit doit contenir au moins 2 caractères"),
  proPrice: z.number().min(1, "Le prix doit être supérieur à 0"),
  proDesc: z.string().min(10, "La description doit contenir au moins 10 caractères"),
  categoriesId: z.number().min(1, "Veuillez sélectionner une catégorie"),
  stock: z.number().min(0, "Le stock ne peut pas être négatif").optional(),
  isActive: z.boolean().optional()
})

export const categorySchema = z.object({
  catName: z.string().min(2, "Le nom de la catégorie doit contenir au moins 2 caractères")
})