import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/app/lib/prisma'
import { registerSchema } from '@/app/lib/validations'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, firstname, lastname } = registerSchema.parse(body)

    // Vérifier si l'admin existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Un utilisateur avec cet email existe déjà' },
        { status: 400 }
      )
    }

    // Récupérer le rôle admin
    let adminRole = await prisma.role.findFirst({
      where: { roleName: 'admin' }
    })

    // Créer le rôle admin s'il n'existe pas
    if (!adminRole) {
      adminRole = await prisma.role.create({
        data: {
          roleName: 'admin',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12)

    // Créer l'admin
    const admin = await prisma.user.create({
      data: {
        firstname,
        lastname,
        email,
        password: hashedPassword,
        rolesId: adminRole.id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      include: {
        role: true
      }
    })

    const { password: _, ...adminWithoutPassword } = admin

    return NextResponse.json({
      message: 'Admin créé avec succès',
      user: adminWithoutPassword
    })
  } catch (error) {
    console.error('Erreur création admin:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'admin' },
      { status: 500 }
    )
  }
}