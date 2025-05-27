import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/app/lib/prisma'
import { categorySchema } from '@/app/lib/validations'
import { authOptions } from '@/app/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const category = await prisma.category.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        products: {
          include: {
            photos: {
              orderBy: { order: 'asc' }
            }
          }
        }
      }
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Catégorie non trouvée' },
        { status: 404 }
      )
    }

    return NextResponse.json(category)
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la catégorie' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const category = await prisma.category.update({
      where: { id: parseInt(params.id) },
      data: {
        catName,
        updatedAt: new Date()
      }
    })

    return NextResponse.json(category)
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la catégorie' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Accès refusé' },
        { status: 403 }
      )
    }

    // Vérifier s'il y a des produits dans cette catégorie
    const productsCount = await prisma.product.count({
      where: { categoriesId: parseInt(params.id) }
    })

    if (productsCount > 0) {
      return NextResponse.json(
        { error: 'Impossible de supprimer une catégorie contenant des produits' },
        { status: 400 }
      )
    }

    await prisma.category.delete({
      where: { id: parseInt(params.id) }
    })

    return NextResponse.json({ message: 'Catégorie supprimée avec succès' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la catégorie' },
      { status: 500 }
    )
  }
}