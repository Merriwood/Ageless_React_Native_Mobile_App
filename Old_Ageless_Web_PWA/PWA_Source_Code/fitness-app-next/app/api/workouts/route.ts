import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET all workout entries for current user
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const entries = await prisma.entries.findMany({
      where: { user_id: parseInt(session.user.id) },
      orderBy: { entry_date: 'desc' },
    })

    // Transform snake_case to camelCase for frontend
    const transformedEntries = entries.map((entry) => ({
      id: entry.id,
      userId: entry.user_id,
      entryDate: entry.entry_date,
      weight: entry.weight ? Number(entry.weight) : null,
      fitnessData: entry.fitness_data as Record<string, number>,
      createdAt: entry.created_at,
      updatedAt: entry.updated_at,
    }))

    return NextResponse.json(transformedEntries)
  } catch (error) {
    console.error('GET /api/workouts error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch workouts' },
      { status: 500 }
    )
  }
}

// POST create/update workout entry
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { date, weight, fitnessData } = await request.json()

    if (!date || !fitnessData) {
      return NextResponse.json(
        { error: 'Date and fitness data required' },
        { status: 400 }
      )
    }

    const entry = await prisma.entries.upsert({
      where: {
        user_id_entry_date: {
          user_id: parseInt(session.user.id),
          entry_date: new Date(date),
        },
      },
      update: {
        weight: weight ? parseFloat(weight) : null,
        fitness_data: fitnessData,
        updated_at: new Date(),
      },
      create: {
        user_id: parseInt(session.user.id),
        entry_date: new Date(date),
        weight: weight ? parseFloat(weight) : null,
        fitness_data: fitnessData,
      },
    })

    // Transform snake_case to camelCase for frontend
    const transformedEntry = {
      id: entry.id,
      userId: entry.user_id,
      entryDate: entry.entry_date,
      weight: entry.weight ? Number(entry.weight) : null,
      fitnessData: entry.fitness_data as Record<string, number>,
      createdAt: entry.created_at,
      updatedAt: entry.updated_at,
    }

    return NextResponse.json(transformedEntry)
  } catch (error) {
    console.error('POST /api/workouts error:', error)
    return NextResponse.json(
      { error: 'Failed to save workout' },
      { status: 500 }
    )
  }
}
