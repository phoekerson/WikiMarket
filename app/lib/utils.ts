import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(price / 100)
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function generateSaleCode(): string {
  return 'SALE-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase()
}

export function generateBillCode(): string {
  return 'BILL-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase()
}