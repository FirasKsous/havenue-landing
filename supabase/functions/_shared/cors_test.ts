import { assertEquals, assertNotMatch } from 'jsr:@std/assert'

import { buildCorsHeaders, handleCors, rejectDisallowedOrigin } from './cors.ts'

Deno.test('buildCorsHeaders echoes allowed localhost origins instead of wildcard', () => {
  const headers = buildCorsHeaders('http://127.0.0.1:4176')

  assertEquals(headers['Access-Control-Allow-Origin'], 'http://127.0.0.1:4176')
  assertEquals(headers.Vary, 'Origin')
})

Deno.test('handleCors rejects disallowed origins during preflight', () => {
  const response = handleCors(new Request('https://example.com', {
    method: 'OPTIONS',
    headers: { origin: 'https://evil.example.com' },
  }))

  assertEquals(response?.status, 403)
})

Deno.test('rejectDisallowedOrigin blocks non-allowed request origins', async () => {
  const response = rejectDisallowedOrigin(new Request('https://example.com', {
    method: 'POST',
    headers: { origin: 'https://evil.example.com' },
  }))

  assertEquals(response?.status, 403)
  const body = await response?.text()
  assertNotMatch(body ?? '', /\*/u)
})
