## Goal

Fix the `403 — jwt malformed` error by having the server sign a fresh JWT for every webhook call, instead of sending the secret value as if it were a token.

## What changes

### 1. `src/routes/api/chat.ts`
- Import `jsonwebtoken` (already installed).
- Treat `WEBHOOK_JWT` as the **HS256 shared secret** (matching n8n's JWT Auth credential), not as a pre-made token.
- For every request, sign a new token:
  - Algorithm: `HS256`
  - Payload: `{}` (no claims required)
  - Expiry: `5m` (short-lived, regenerated each call)
- Send it as `Authorization: Bearer <signed-token>` to the n8n webhook.

### 2. No UI / no other file changes
The frontend already POSTs to `/api/chat`; behavior stays identical from the user's perspective.

## What you need to do in n8n

In the Webhook node's **JWT Auth** credential:
- Algorithm: **HS256**
- Secret: the **same string** you stored in `WEBHOOK_JWT` here

If those match, the webhook will accept the signed token.

## Notes

- `jsonwebtoken` is pure JS and runs fine in the Worker SSR runtime.
- The secret never leaves the server — only the signed token is sent over the wire.
- If n8n later requires specific claims (`iss`, `aud`, `sub`, etc.), we can add them to the `jwt.sign` payload in one small edit.
