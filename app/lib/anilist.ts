const ANILIST_API_URL = 'https://graphql.anilist.co'

interface AniListTitle {
  romaji?: string | null
  english?: string | null
  native?: string | null
  userPreferred?: string | null
}

interface AniListCoverImage {
  extraLarge?: string | null
  large?: string | null
  medium?: string | null
}

interface AniListMedia {
  id: number
  title?: AniListTitle | null
  description?: string | null
  status?: string | null
  coverImage?: AniListCoverImage | null
  siteUrl?: string | null
  chapters?: number | null
  volumes?: number | null
  format?: string | null
  countryOfOrigin?: string | null
  genres?: string[] | null
  startDate?: { year?: number | null } | null
  isAdult?: boolean | null
}

interface AniListPageResponse {
  data?: {
    Page?: {
      media?: AniListMedia[]
    }
  }
}

interface AniListDetailsResponse {
  data?: {
    Media?: AniListMedia | null
  }
}

export interface PluginMangaSummary {
  siteId: string
  name: string
  synopsis: string
  status: string
  cover: string
  chapterCount: number | null
  languageCodes: string[]
  contentType: 'manga'
  siteLink: string
}

export interface PluginChapterSummary {
  siteId: string
  name: string
  number: string
  language: string
  languageCodes: string[]
  offline: boolean
  pages: Array<Record<string, unknown>>
}

const toStringId = (value: number | string): string => String(value)

const pickTitle = (title: AniListTitle | null | undefined): string => {
  if (!title) return ''
  return (
    title.userPreferred?.trim() ||
    title.english?.trim() ||
    title.romaji?.trim() ||
    title.native?.trim() ||
    ''
  )
}

const normalizeStatus = (value: string | null | undefined): string => {
  if (!value) return 'Unknown'
  const normalized = value.trim().toUpperCase()
  if (normalized === 'RELEASING') return 'Em andamento'
  if (normalized === 'FINISHED') return 'Concluido'
  if (normalized === 'HIATUS') return 'Hiato'
  if (normalized === 'CANCELLED') return 'Cancelado'
  return value
}

const pickCover = (coverImage: AniListCoverImage | null | undefined): string => {
  if (!coverImage) return ''
  return coverImage.extraLarge || coverImage.large || coverImage.medium || ''
}

const stripHtml = (value: string | null | undefined): string => {
  if (!value) return ''
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

const postGraphQL = async <T>(query: string, variables: Record<string, unknown>): Promise<T> => {
  const response = await fetch(ANILIST_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify({ query, variables })
  })

  if (!response.ok) {
    throw new Error(`AniList request failed (${response.status})`)
  }

  return (await response.json()) as T
}

const toSummary = (media: AniListMedia): PluginMangaSummary => {
  const siteId = toStringId(media.id)
  const title = pickTitle(media.title) || siteId
  return {
    siteId,
    name: title,
    synopsis: stripHtml(media.description),
    status: normalizeStatus(media.status),
    cover: pickCover(media.coverImage),
    chapterCount: typeof media.chapters === 'number' && media.chapters > 0 ? media.chapters : null,
    languageCodes: ['en'],
    contentType: 'manga',
    siteLink: media.siteUrl || `https://anilist.co/manga/${siteId}`
  }
}

const normalizeSearchToken = (value: string): string =>
  value
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[^a-z0-9 ]+/g, '')
    .trim()

const isRelevantTitleMatch = (query: string, title: string): boolean => {
  const normalizedQuery = normalizeSearchToken(query)
  const normalizedTitle = normalizeSearchToken(title)
  if (!normalizedQuery || !normalizedTitle) return false
  if (normalizedTitle.includes(normalizedQuery)) return true

  const queryTokens = normalizedQuery.split(' ').filter(Boolean)
  const titleTokens = normalizedTitle.split(' ').filter(Boolean)
  return queryTokens.every((token) =>
    titleTokens.some((titleToken) => titleToken.startsWith(token) || token.startsWith(titleToken))
  )
}

export async function searchAniListManga(query: string, limit = 25): Promise<PluginMangaSummary[]> {
  const graphql = `
    query SearchManga($search: String, $page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        media(type: MANGA, search: $search, sort: SEARCH_MATCH) {
          id
          title { romaji english native userPreferred }
          description(asHtml: false)
          status
          coverImage { extraLarge large medium }
          siteUrl
          chapters
          volumes
          format
          countryOfOrigin
          genres
          startDate { year }
          isAdult
        }
      }
    }
  `

  const payload = await postGraphQL<AniListPageResponse>(graphql, {
    search: query,
    page: 1,
    perPage: Math.max(1, Math.min(limit, 50))
  })

  const media = payload.data?.Page?.media ?? []
  const filtered = media.filter((entry) => entry.isAdult !== true)
  const mapped = filtered.map(toSummary)
  const relevant = mapped.filter((entry) => isRelevantTitleMatch(query, entry.name))
  return relevant
}

export async function listTrendingAniListManga(limit = 40): Promise<PluginMangaSummary[]> {
  const graphql = `
    query TrendingManga($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        media(type: MANGA, sort: POPULARITY_DESC, isAdult: false) {
          id
          title { romaji english native userPreferred }
          description(asHtml: false)
          status
          coverImage { extraLarge large medium }
          siteUrl
          chapters
          volumes
          format
          countryOfOrigin
          genres
          startDate { year }
          isAdult
        }
      }
    }
  `

  const payload = await postGraphQL<AniListPageResponse>(graphql, {
    page: 1,
    perPage: Math.max(1, Math.min(limit, 50))
  })

  const media = payload.data?.Page?.media ?? []
  return media.filter((entry) => entry.isAdult !== true).map(toSummary)
}

export async function getAniListMangaDetails(siteId: string): Promise<PluginMangaSummary | null> {
  const numericId = Number(siteId)
  if (!Number.isFinite(numericId)) return null

  const graphql = `
    query MangaDetails($id: Int) {
      Media(id: $id, type: MANGA) {
        id
        title { romaji english native userPreferred }
        description(asHtml: false)
        status
        coverImage { extraLarge large medium }
        siteUrl
        chapters
        volumes
        format
        countryOfOrigin
        genres
        startDate { year }
        isAdult
      }
    }
  `

  const payload = await postGraphQL<AniListDetailsResponse>(graphql, {
    id: numericId
  })

  const media = payload.data?.Media
  if (!media) return null
  if (media.isAdult === true) return null
  return toSummary(media)
}

export async function getAniListCanonicalChapters(siteId: string): Promise<PluginChapterSummary[]> {
  const details = await getAniListMangaDetails(siteId)
  if (!details) return []

  const chapterCount = details.chapterCount
  if (!chapterCount || chapterCount <= 0) return []

  const chapters: PluginChapterSummary[] = []
  for (let index = 1; index <= chapterCount; index += 1) {
    chapters.push({
      siteId: `${details.siteId}:${index}`,
      name: `Chapter ${index}`,
      number: String(index),
      language: 'unknown',
      languageCodes: details.languageCodes,
      offline: false,
      pages: []
    })
  }

  return chapters
}
