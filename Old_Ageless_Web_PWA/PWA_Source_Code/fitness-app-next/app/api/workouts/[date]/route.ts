import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET workout entry by date
export async function GET(
  request: Request,
  { params }: { params: { date: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const entry = await prisma.entries.findFirst({
      where: {
        user_id: parseInt(session.user.id),
        entry_date: new Date(params.date),
      },
    })

    if (!entry) {
      return NextResponse.json(null)
    }

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
    console.error('GET /api/workouts/[date] error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch workout' },
      { status: 500 }
    )
  }
}

// DELETE workout entry by date
export async function DELETE(
  request: Request,
  { params }: { params: { date: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.entries.deleteMany({
      where: {
        user_id: parseInt(session.user.id),
        entry_date: new Date(params.date),
      },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('DELETE /api/workouts/[date] error:', error)
    return NextResponse.json(
      { error: 'Failed to delete workout' },
      { status: 500 }
    )
  }
}
