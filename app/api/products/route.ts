import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/app/lib/prisma'
import { productSchema } from '@/app/lib/validations'
import { authOptions } from '@/app/lib/auth'
import { generateSlug } from '@/app/lib/utils'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '12')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = { isActive: true }

    if (category) {
      where.categoriesId = parseInt(category)
    }

    if (search) {
      where.OR = [
        { proName: { contains: search, mode: 'insensitive' } },
        { proDesc: { contains: search, mode: 'insensitive' } }
      ]
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        photos: {
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    })

    const total = await prisma.product.count({ where })

    return NextResponse.json({
      products,
      total,
      hasMore: offset + limit < total
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des produits' },
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
    const validatedData = productSchema.parse(body)

    const slug = generateSlug(validatedData.proName)

    const product = await prisma.product.create({
      data: {
        ...validatedData,
        slug,
        usersId: parseInt(session.user.id!),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      include: {
        category: true,
        user: { include: { role: true } },
        photos: true
      }
    })

    return NextResponse.json(product)
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la création du produit' },
      { status: 500 }
    )
  }
}