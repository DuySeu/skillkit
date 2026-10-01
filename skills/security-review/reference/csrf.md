# CSRF protection

Examples use Next.js + Supabase. Adapt to the project's stack.

## Default pattern

Use SameSite cookies plus a CSRF token on every state-changing request (POST, PUT, PATCH, DELETE). The cookie flag blocks most cross-site sends; the token covers the rest (older browsers, same-site subdomains, SameSite=Lax top-level navigations).

### SameSite session cookie

```typescript
res.setHeader('Set-Cookie',
  `session=${sessionId}; HttpOnly; Secure; SameSite=Strict`)
```

Use `SameSite=Lax` instead of `Strict` if users arrive from external links and must stay signed in. Keep the token check in both cases.

### CSRF token on state-changing requests

The server issues a token tied to the session. The client sends it in a header on each state-changing request.

```typescript
import { csrf } from '@/lib/csrf'

export async function POST(request: Request) {
  const token = request.headers.get('X-CSRF-Token')

  if (!csrf.verify(token)) {
    return NextResponse.json(
      { error: 'Invalid CSRF token' },
      { status: 403 }
    )
  }

  // Process request
}
```

`@/lib/csrf` is a project-local helper, not a library. Implement it as a random token stored server-side against the session (synchronizer token).

## When double-submit applies instead

Use the double-submit cookie pattern only when the server keeps no session state (stateless API, JWT in a cookie). The server sets a random token in a cookie readable by JavaScript, the client copies it into the `X-CSRF-Token` header, and the server checks that the two match. Sign the cookie value (HMAC bound to the session or user) so a subdomain cannot plant its own value. Do not run both patterns at once.

## Verification steps

- [ ] Session cookies are HttpOnly, Secure, and SameSite (Strict, or Lax with a reason)
- [ ] CSRF token required and verified on every state-changing request
- [ ] GET requests never change state
- [ ] If the app is stateless, double-submit is used with a signed cookie value, in place of the session-bound token
