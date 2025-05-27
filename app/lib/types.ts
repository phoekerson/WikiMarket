import { Product, Category, User, Role, ProductPhoto, Sale, Bill, Payment, PayMethod } from '@prisma/client'

export type ProductWithDetails = Product & {
  category: Category
  user: User & { role: Role }
  photos: ProductPhoto[]
}

export type CategoryWithProducts = Category & {
  products: (Product & { photos: ProductPhoto[] })[]
}

export type UserWithRole = User & {
  role: Role
}

export type SaleWithDetails = Sale & {
  user: UserWithRole
  payments: (Payment & { paymethod: PayMethod })[]
}

export type BillWithDetails = Bill & {
  product: ProductWithDetails
}

export interface AuthUser {
  id: number
  email: string
  firstname: string
  lastname: string
  role: {
    id: number
    roleName: string
  }
}