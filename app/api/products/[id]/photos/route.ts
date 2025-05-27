import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/app/lib/prisma'
import { authOptions } from '@/app/lib/auth'

export async function POST(
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
    const { filename, url, altText, isPrimary = false, order = 0 } = body

    // Si c'est la photo principale, désactiver les autres
    if (isPrimary) {
      await prisma.productPhoto.updateMany({
        where: { productId: parseInt(params.id), isPrimary: true },
        data: { isPrimary: false }
      })
    }

    const photo = await prisma.productPhoto.create({
      data: {
        filename,
        url,
        altText,
        isPrimary,
        order,
        productId: parseInt(params.id),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    return NextResponse.json(photo)
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de l\'ajout de la photo' },
      { status: 500 }
    )
  }
}