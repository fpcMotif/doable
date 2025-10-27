import { NextRequest, NextResponse } from 'next/server'
import { getSessionOrNull } from '@/lib/auth-server-helpers'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Get the current user from Better Auth
    const session = await getSessionOrNull()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // For now, return all teams (in production, filter by user membership)
    const teams = await db.team.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(teams)
  } catch (error) {
    console.error('Error fetching teams:', error)
    return NextResponse.json(
      { error: 'Failed to fetch teams' },
      { status: 500 }
    )
  }
}

