# Sensitive data exposure

Examples use Next.js + Supabase. Adapt to the project's stack.

## Logging

```typescript
// Wrong: logging sensitive data
console.log('User login:', { email, password })
console.log('Payment:', { cardNumber, cvv })

// Correct: redact sensitive data
console.log('User login:', { email, userId })
console.log('Payment:', { last4: card.last4, userId })
```

## Error messages

```typescript
// Wrong: exposing internal details
catch (error) {
  return NextResponse.json(
    { error: error.message, stack: error.stack },
    { status: 500 }
  )
}

// Correct: generic error messages
catch (error) {
  console.error('Internal error:', error)
  return NextResponse.json(
    { error: 'An error occurred. Please try again.' },
    { status: 500 }
  )
}
```

## Verification steps

- [ ] No passwords, tokens, or secrets in logs
- [ ] Error messages generic for users
- [ ] Detailed errors only in server logs
- [ ] No stack traces exposed to users
