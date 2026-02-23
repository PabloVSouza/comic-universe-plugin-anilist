import { NextRequest, NextResponse } from 'next/server'
import { getAniListCanonicalChapters } from '../../lib/anilist'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const siteId = typeof body?.siteId === 'string' ? body.siteId.trim() : ''

    if (!siteId) {
      return NextResponse.json([])
    }

    return NextResponse.json(await getAniListCanonicalChapters(siteId))
  } catch (error) {
    console.error('Error in getChapters:', error)
    return NextResponse.json([])
  }
}
