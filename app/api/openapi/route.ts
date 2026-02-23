import { NextResponse } from 'next/server'

const openApiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'Comic Universe Plugin - AniList API',
    version: '1.0.0',
    description: 'HTTP API exposed by the AniList metadata plugin for Comic Universe.'
  },
  servers: [{ url: '/' }],
  paths: {
    '/api/getList': { post: { summary: 'Get trending manga list', responses: { '200': { description: 'OK' } } } },
    '/api/search': {
      post: {
        summary: 'Search manga by name',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', properties: { search: { type: 'string' } } } } }
        },
        responses: { '200': { description: 'OK' } }
      }
    },
    '/api/getDetails': {
      post: {
        summary: 'Get manga metadata details',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', properties: { siteId: { type: 'string' } } } } }
        },
        responses: { '200': { description: 'OK' } }
      }
    },
    '/api/getChapters': {
      post: {
        summary: 'Get canonical chapter list (metadata only)',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', properties: { siteId: { type: 'string' } } } } }
        },
        responses: { '200': { description: 'OK' } }
      }
    },
    '/api/getPages': {
      post: {
        summary: 'Metadata plugin does not provide pages (returns empty array)',
        responses: { '200': { description: 'OK' } }
      }
    },
    '/api/metadata': {
      get: {
        summary: 'Plugin metadata (capabilities: metadata-only)',
        responses: { '200': { description: 'OK' } }
      }
    }
  }
}

export async function GET() {
  return NextResponse.json(openApiDocument)
}
