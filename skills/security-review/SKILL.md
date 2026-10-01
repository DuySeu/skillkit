---
name: security-review
description: Use this skill when adding authentication, handling user input, working with secrets, creating API endpoints, storing or transmitting sensitive data, integrating third-party APIs, or implementing payment/sensitive features. Gives a review procedure, a security checklist per area, and code patterns.
---

# Security review

Review code for vulnerabilities and fix them. Reference examples use Next.js + Supabase; adapt them to the project's own stack and package manager.

## Review procedure

1. Scope: list the files changed (or the feature named) and note which areas below they touch. Entry points first: API routes, form handlers, auth code, config, anything reading env vars or user input.
2. Inspect: for each touched area, open its reference file and walk through its verification steps against the code. Search for red flags (hardcoded keys, string-built SQL, `dangerouslySetInnerHTML`, `localStorage` tokens, unlogged-in routes, `console.log` of request bodies).
3. Report: one entry per finding, ordered by severity. Do not pad the report with passing checks.
4. Fix: propose or apply the smallest change per finding, and add a test for it (see `reference/security-testing.md`).
5. Finish with the pre-deployment checklist below.

### Report format

Each finding has:

- Severity: Critical (exploitable now, data loss or takeover), High (exploitable with some conditions), Medium (weakens a defense), Low (hardening).
- Location: `path/file.ts:42`.
- Issue: one sentence on what is wrong and how it could be abused.
- Fix: the concrete change, with a code snippet if short.

Example: `High - src/app/api/users/route.ts:18 - email is concatenated into the SQL string, allowing injection. Fix: use a parameterized query (reference/injection.md).`

If a check could not be confirmed from the code (config set outside the repo, for example), say "unverified" rather than passing it.

## Areas

- Secrets: no hardcoded keys, env vars only, nothing in git history. See [reference/secrets.md](reference/secrets.md).
- Input validation: schema-validate all input, restrict file uploads, whitelist over blacklist. See [reference/input-validation.md](reference/input-validation.md).
- Injection: parameterized queries only, never concatenate SQL. See [reference/injection.md](reference/injection.md).
- Authentication and authorization: httpOnly cookies, authorization checks before sensitive operations, Row Level Security. See [reference/auth.md](reference/auth.md).
- XSS and CSP: sanitize HTML, CSP with a nonce or hash and no `'unsafe-eval'` or `'unsafe-inline'` in `script-src`. See [reference/xss-csp.md](reference/xss-csp.md).
- CSRF: SameSite cookies plus a CSRF token on state-changing requests; double-submit only for stateless apps. See [reference/csrf.md](reference/csrf.md).
- Rate limiting: limits on all endpoints, stricter on expensive ones. See [reference/rate-limiting.md](reference/rate-limiting.md).
- Sensitive data exposure: redact logs, generic error messages, no stack traces to users. See [reference/data-exposure.md](reference/data-exposure.md).
- Dependencies: audit, lock files committed, automated updates. See [reference/dependencies.md](reference/dependencies.md).
- Security tests: automated tests for auth, authorization, validation, CSRF, rate limits. See [reference/security-testing.md](reference/security-testing.md).
- Blockchain (Solana, stack-specific): wallet signatures and transaction checks. Read only when the project uses Solana. See [reference/blockchain-solana.md](reference/blockchain-solana.md).

## Pre-deployment checklist

Before any production deployment:

- [ ] Secrets: no hardcoded secrets, all in env vars
- [ ] Input validation: all user inputs validated
- [ ] SQL injection: all queries parameterized
- [ ] XSS: user content sanitized, CSP uses nonce or hash
- [ ] CSRF: SameSite cookies plus CSRF token on state-changing requests
- [ ] Authentication: proper token handling
- [ ] Authorization: role checks in place
- [ ] Rate limiting: enabled on all endpoints
- [ ] HTTPS: enforced in production
- [ ] Security headers: CSP, X-Frame-Options configured
- [ ] Error handling: no sensitive data in errors
- [ ] Logging: no sensitive data logged
- [ ] Dependencies: up to date, no known vulnerabilities
- [ ] Row Level Security: enabled in Supabase (if used)
- [ ] CORS: properly configured
- [ ] File uploads: validated (size, type)
- [ ] Wallet signatures: verified (if Solana)

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/security)
- [Supabase Security](https://supabase.com/docs/guides/auth)
- [Web Security Academy](https://portswigger.net/web-security)
