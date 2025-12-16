# ADR 002: Use JWT for Authentication

## Status

Accepted

## Context

We need an authentication mechanism for our API that:
- Works well with stateless REST APIs
- Scales horizontally (no server-side sessions)
- Supports both web and potential mobile clients
- Provides secure token-based authentication
- Allows frontend to store tokens easily

## Decision

We will use JSON Web Tokens (JWT) with bearer token authentication via Passport.js.

## Consequences

### Positive Consequences

- **Stateless**: No server-side session storage required
- **Scalable**: Works across multiple server instances without shared session store
- **Standard**: Industry-standard authentication mechanism
- **Self-contained**: Token contains all necessary information
- **Cross-domain**: Works well with CORS and microservices
- **Mobile-friendly**: Easy to implement in mobile apps

### Negative Consequences

- **Token Revocation**: Difficult to invalidate tokens before expiration
- **Token Size**: Larger than session IDs (included in every request)
- **Security Risk**: If token is compromised, it's valid until expiration
- **No Refresh Implementation**: Current implementation doesn't support token refresh

## Alternatives Considered

1. **Session-based Authentication**: More secure token revocation, but requires shared session store (Redis) for scaling
2. **OAuth 2.0**: More complex, overkill for simple app without third-party auth
3. **Basic Auth**: Too simple, credentials sent with every request

## Future Improvements

- Implement refresh tokens for better security
- Add token blacklist for immediate revocation
- Implement sliding sessions
- Add Redis for token storage if needed

## References

- [JWT.io](https://jwt.io/)
- [Passport.js Documentation](http://www.passportjs.org/)
- [NestJS Authentication](https://docs.nestjs.com/security/authentication)
