import { NextResponse } from 'next/server'
import { listTrendingAniListManga } from '../../lib/anilist'

export async function POST() {
  try {
    return NextResponse.json(await listTrendingAniListManga(40))
  } catch (error) {
    console.error('Error in getList:', error)
    return NextResponse.json([])
  }
}
