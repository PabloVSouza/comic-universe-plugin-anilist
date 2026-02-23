import { NextRequest, NextResponse } from 'next/server'
import { searchAniListManga } from '../../lib/anilist'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { search } = body as { search?: string }

    if (!search) {
      return NextResponse.json([])
    }

    return NextResponse.json(await searchAniListManga(String(search), 25))
  } catch (error) {
    console.error('Error in search:', error)
    return NextResponse.json([])
  }
}
