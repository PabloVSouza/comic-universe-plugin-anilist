import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json({
    success: false,
    message: 'AniList plugin is metadata-only and does not provide chapter pages.'
  })
}
