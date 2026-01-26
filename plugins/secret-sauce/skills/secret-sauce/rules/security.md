# OWASP Security Checklist

> Based on OWASP Top 10. See also: `references/coding-standards.md`

## Input Validation

- [ ] Validate all inputs server-side
- [ ] Use Zod/Yup for schema validation
- [ ] Sanitize user-generated content
- [ ] Validate file uploads (type, size, content)
- [ ] Reject unexpected fields
- [ ] Use allowlists over denylists

## SQL Injection Prevention

- [ ] Use parameterized queries ALWAYS
- [ ] Never concatenate user input into SQL
- [ ] Use ORM/query builders with escaping
- [ ] Validate and cast data types
- [ ] Limit database user privileges

## XSS Prevention

- [ ] Escape output by default (React does this)
- [ ] Avoid `dangerouslySetInnerHTML`
- [ ] Sanitize HTML with DOMPurify if needed
- [ ] Set Content-Security-Policy headers
- [ ] Use `httpOnly` cookies

## CSRF Protection

- [ ] Use CSRF tokens for state-changing requests
- [ ] Validate `Origin` / `Referer` headers
- [ ] Use `SameSite=Strict` for cookies
- [ ] Require re-authentication for sensitive actions

## Rate Limiting

- [ ] Implement rate limits on all endpoints
- [ ] Use sliding window or token bucket
- [ ] Return `429 Too Many Requests`
- [ ] Rate limit by IP and user
- [ ] Stricter limits on auth endpoints

## Authentication

- [ ] Use established providers (Supabase Auth, NextAuth)
- [ ] Enforce strong password policies
- [ ] Implement MFA where possible
- [ ] Secure session management
- [ ] Invalidate sessions on logout
- [ ] Protect password reset flows

## Authorization

- [ ] Verify permissions on every request
- [ ] Use RLS at database level
- [ ] Implement role-based access control
- [ ] Deny by default
- [ ] Log authorization failures

## Secrets Management

- [ ] Never commit secrets to git
- [ ] Use environment variables
- [ ] Rotate secrets regularly
- [ ] Use different secrets per environment
- [ ] Audit secret access
- [ ] Use `.env.local` for local development

## Security Headers

```typescript
// next.config.js headers
{
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=()',
  'Content-Security-Policy': "default-src 'self'..."
}
```

## Logging & Monitoring

- [ ] Log security events
- [ ] Monitor for anomalies
- [ ] Alert on suspicious activity
- [ ] Never log sensitive data
- [ ] Implement audit trails
