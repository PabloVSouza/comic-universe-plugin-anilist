# Comic Universe Plugin - AniList

Metadata plugin HTTP API for Comic Universe backed by AniList.

## Capabilities

- `metadata`
- Provides canonical manga metadata and canonical chapter list based on AniList chapter count.
- Does not provide readable chapter pages (use content plugins for that).

## Endpoints

- `POST /api/getList` - trending list
- `POST /api/search` - body `{ search }`
- `POST /api/getDetails` - body `{ siteId }`
- `POST /api/getChapters` - body `{ siteId }`
- `POST /api/getPages` - returns `[]` (metadata-only)
- `POST /api/downloadChapter` - stub
- `GET /api/metadata`

## Dev

```bash
npm install
npm run dev
```

## Install in Comic Universe

Use deep link:

```text
comic-universe-tauri://plugin/install?url=<PLUGIN_BASE_URL>/api&metadataUrl=<PLUGIN_BASE_URL>/api/metadata&name=AniList&tag=anilist
```
