# XSS prevention and CSP

Examples use Next.js + Supabase. Adapt to the project's stack.

## Sanitize HTML

```typescript
import DOMPurify from 'isomorphic-dompurify'

// ALWAYS sanitize user-provided HTML
function renderUserContent(html: string) {
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p'],
    ALLOWED_ATTR: []
  })
  return <div dangerouslySetInnerHTML={{ __html: clean }} />
}
```

## Content Security Policy

`script-src` must not contain `'unsafe-eval'` or `'unsafe-inline'`. Allow inline scripts with a per-request nonce (or a hash for fixed inline scripts). The nonce must be random for every response, so generate it in middleware and pass it to the page.

```typescript
// middleware.ts - per-request nonce
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const csp = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic';
    style-src 'self' 'nonce-${nonce}';
    img-src 'self' data: https:;
    font-src 'self';
    connect-src 'self' https://api.example.com;
    object-src 'none';
    base-uri 'self';
    frame-ancestors 'none';
  `.replace(/\s{2,}/g, ' ').trim()

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set('Content-Security-Policy', csp)

  const response = NextResponse.next({ request: { headers: requestHeaders } })
  response.headers.set('Content-Security-Policy', csp)
  return response
}
```

- For a fixed inline script, use `script-src 'sha256-<base64 hash>'` instead of a nonce.
- Dev servers (hot reload) may need `'unsafe-eval'` in development only. Never ship it to production.
- If styles cannot take a nonce, `style-src 'unsafe-inline'` is a lower risk than on scripts, but prefer a nonce or hash there too.
- Test the policy in report-only mode (`Content-Security-Policy-Report-Only`) before enforcing.

## Verification steps

- [ ] User-provided HTML sanitized
- [ ] CSP headers configured with nonce or hash, no `'unsafe-eval'` or `'unsafe-inline'` in `script-src`
- [ ] No unvalidated dynamic content rendering
- [ ] React's built-in XSS protection used
