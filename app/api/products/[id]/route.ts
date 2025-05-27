import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/app/lib/prisma'
import { productSchema } from '@/app/lib/validations'
import { authOptions } from '@/app/lib/auth'
import { generateSlug } from '@/app/lib/utils'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { 
        id: parseInt(params.id)
      },
      include: {
        category: true,
        user: { include: { role: true } },
        photos: { orderBy: { order: 'asc' } }
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Produit non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json(product)
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du produit' },
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
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = productSchema.parse(body)

    // Vérifier les permissions
    const existingProduct = await prisma.product.findUnique({
      where: { id: parseInt(params.id) }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Produit non trouvé' },
        { status: 404 }
      )
    }

    const canEdit = session.user.role === 'admin' || 
                   existingProduct.usersId === parseInt(session.user.id!)

    if (!canEdit) {
      return NextResponse.json(
        { error: 'Permissions insuffisantes' },
        { status: 403 }
      )
    }

    const slug = generateSlug(validatedData.proName)

    const product = await prisma.product.update({
      where: { id: parseInt(params.id) },
      data: {
        ...validatedData,
        updatedAt: new Date()
      },
      include: {
        category: true,
        user: { include: { role: true } },
        photos: { orderBy: { order: 'asc' } }
      }
    })

    return NextResponse.json(product)
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du produit' },
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
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      )
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id: parseInt(params.id) }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Produit non trouvé' },
        { status: 404 }
      )
    }

    const canDelete = session.user.role === 'admin' || 
                     existingProduct.usersId === parseInt(session.user.id!)

    if (!canDelete) {
      return NextResponse.json(
        { error: 'Permissions insuffisantes' },
        { status: 403 }
      )
    }

    // Soft delete - marquer comme inactif au lieu de supprimer
    await prisma.product.delete({
      where: { id: parseInt(params.id) }
    })

    return NextResponse.json({ message: 'Produit supprimé avec succès' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du produit' },
      { status: 500 }
    )
  }
}