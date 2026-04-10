const baseCorsHeaders = {
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  Vary: 'Origin',
}

function getConfiguredAllowedOrigins(): string[] {
  const configuredOrigins = Deno.env.get('CORS_ALLOWED_ORIGINS')?.trim()
  if (!configuredOrigins) {
    return []
  }

  return configuredOrigins
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
}

function isLocalDevelopmentOrigin(origin: string): boolean {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/u.test(origin)
}

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) {
    return true
  }

  return isLocalDevelopmentOrigin(origin) || getConfiguredAllowedOrigins().includes(origin)
}

export function buildCorsHeaders(origin: string | null): Record<string, string> {
  if (origin && isAllowedOrigin(origin)) {
    return {
      ...baseCorsHeaders,
      'Access-Control-Allow-Origin': origin,
    }
  }

  return { ...baseCorsHeaders }
}

function disallowedOriginResponse(): Response {
  return new Response(JSON.stringify({ error: 'Origin not allowed' }), {
    status: 403,
    headers: {
      ...buildCorsHeaders(null),
      'Content-Type': 'application/json',
    },
  })
}

export function rejectDisallowedOrigin(req: Request): Response | null {
  const origin = req.headers.get('origin')
  if (origin && !isAllowedOrigin(origin)) {
    return disallowedOriginResponse()
  }

  return null
}

export function handleCors(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    const origin = req.headers.get('origin')
    if (origin && !isAllowedOrigin(origin)) {
      return disallowedOriginResponse()
    }

    return new Response('ok', { headers: buildCorsHeaders(origin) })
  }
  return null
}

export function jsonResponse(
  req: Request,
  data: unknown,
  status = 200
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...buildCorsHeaders(req.headers.get('origin')),
      'Content-Type': 'application/json',
    },
  })
}

export function errorResponse(
  req: Request,
  message: string,
  status = 400
): Response {
  return jsonResponse(req, { error: message }, status)
}
