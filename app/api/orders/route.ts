import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/app/lib/prisma'
import { authOptions } from '@/app/lib/auth'
import { generateSaleCode, generateBillCode } from '@/app/lib/utils'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    const where: any = {}
    
    // Si pas admin, ne voir que ses propres commandes
    if (session.user.role !== 'admin') {
      where.usersId = parseInt(session.user.id!)
    } else if (userId) {
      where.usersId = parseInt(userId)
    }

    const sales = await prisma.sale.findMany({
      where,
      include: {
        user: { include: { role: true } },
        payments: { include: { paymethod: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(sales)
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des commandes' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { items, paymentMethodId } = body

    // Créer la vente
    const sale = await prisma.sale.create({
      data: {
        saleCode: generateSaleCode(),
        usersId: parseInt(session.user.id!),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    // Créer les factures pour chaque item
    const bills = []
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      })
      if (!product) {
        throw new Error(`Produit non trouvé`)
      }

      const bill = await prisma.bill.create({
        data: {
          qty: item.quantity,
          billCode: generateBillCode(),
          productsId: item.productId,
          prixVente: product.proPrice,
          total: product.proPrice * item.quantity,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })

      // Mettre à jour le stock
      await prisma.product.update({
        where: { id: item.product