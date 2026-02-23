import { NextRequest, NextResponse } from 'next/server'
import { getAniListMangaDetails } from '../../lib/anilist'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const siteId = typeof body?.siteId === 'string' ? body.siteId.trim() : ''

    if (!siteId) {
      return NextResponse.json({}, { status: 400 })
    }

    const details = await getAniListMangaDetails(siteId)
    if (!details) {
      return NextResponse.json({}, { status: 404 })
    }

    return NextResponse.json({
      ...details,
      type: 'manga'
    })
  } catch (error) {
    console.error('Error in getDetails:', error)
    return NextResponse.json({}, { status: 500 })
  }
}
