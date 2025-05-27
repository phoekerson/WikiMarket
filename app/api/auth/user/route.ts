import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/app/lib/prisma'
import { registerSchema } from '@/app/lib/validations'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = registerSchema.parse(body)

    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Un utilisateur avec cet email existe déjà' },
        { status: 400 }
      )
    }

    // Récupérer ou créer le rôle user
    let userRole = await prisma.role.findFirst({
      where: { roleName: 'user' }
    })

    if (!userRole) {
      userRole = await prisma.role.create({
        data: {
          roleName: 'user',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 12)

    const user = await prisma.user.create({
      data: {
        ...validatedData,
        password: hashedPassword,
        rolesId: userRole.id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      include: {
        role: true
      }
    })

    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      message: 'Utilisateur créé avec succès',
      user: userWithoutPassword
    })
  } catch (error) {
    console.error('Erreur création utilisateur:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'utilisateur' },
      { status: 500 }
    )
  }
}