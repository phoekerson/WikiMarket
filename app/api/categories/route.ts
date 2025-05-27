import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/app/lib/prisma'
import { categorySchema } from '@/app/lib/validations'
import { authOptions } from '@/app/lib/auth'

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        products: {
          include: {
            photos: {
              where: { isPrimary: true },
              take: 1
            }
          }
        }
      },
      orderBy: { catName: 'asc' }
    })

    return NextResponse.json(categories)
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des catégories' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Accès refusé' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { catName } = categorySchema.parse(body)

    const existingCategory = await prisma.category.findFirst({
      where: { catName }
    })

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Une catégorie avec ce nom existe déjà' },
        { status: 400 }
      )
    }

    const category = await prisma.category.create({
      data: {
        catName,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    return NextResponse.json(category)
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la création de la catégorie' },
      { status: 500 }
    )
  }
}