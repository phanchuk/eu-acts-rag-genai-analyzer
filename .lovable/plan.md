## Migration Plan: Elestio → Hostinger n8n

### Code change (single file)
**`src/routes/api/chat.ts`** — update the `WEBHOOK_URL` constant from the Elestio production URL to the new Hostinger production URL:

```
https://n8n.srv1669108.hstgr.cloud/webhook/8b6b77f6-fac8-4989-bf56-b5174bca87ca
```

The test URL (`/webhook-test/...`) is only used inside the n8n editor for "Execute workflow" runs — it does not belong in app code. App always points to the production URL.

No other code changes needed: JWT signing logic, error handling, and quota fallback all remain identical because Hostinger is just a different host running the same n8n instance.

### Steps you need to do (in order)

**Step 1 — Import the workflow into the new n8n**
- Export the workflow JSON from the Elestio n8n (Workflow menu → Download)
- Import it into the Hostinger n8n
- Verify both webhook nodes still have path `8b6b77f6-fac8-4989-bf56-b5174bca87ca` (n8n usually preserves it; if it generated a new ID, tell me and I'll update the code)

**Step 2 — Re-create credentials in the new n8n**
Credentials don't transfer with the JSON export. In the Hostinger n8n, recreate:
- OpenAI API credential (paste the same OpenAI key)
- Pinecone credential (same API key + environment)
- Google Drive OAuth (re-authorize — OAuth tokens are host-bound)
- Any other credentials your workflow uses

**Step 3 — Configure JWT Auth on both webhook nodes**
On both the embedding and the chat webhook nodes:
- Authentication → JWT Auth
- Create a JWT Auth credential: algorithm `HS256`, secret = the value of `WEBHOOK_JWT` (same secret you use today on Elestio)
- Save and **Activate** the workflow

**Step 4 — Confirm the Hostinger production URL**
Once activated, n8n shows the live production URL on the webhook node. Confirm it is exactly:
```
https://n8n.srv1669108.hstgr.cloud/webhook/8b6b77f6-fac8-4989-bf56-b5174bca87ca
```
If it differs, share the new URL.

**Step 5 — I update the code and you publish**
After you confirm Step 4, switch me to default mode. I update `WEBHOOK_URL` in `src/routes/api/chat.ts`, then you click Publish so the live site hits the new host.

**Step 6 — Smoke test**
- Send a chat message from the published site → expect a real answer
- Trigger the embedding workflow (drop a file in Drive) → expect Pinecone to receive vectors

**Step 7 — Decommission Elestio**
Once Hostinger is confirmed working for a day or two, deactivate the Elestio workflow and shut down the Elestio instance.

### Credentials I will need from you
None right now. The only secret involved is `WEBHOOK_JWT`, which is already set in Lovable — you just need to paste the same value into the n8n JWT Auth credential on the new host. If you've lost that value, tell me and I'll switch to a rotation flow (generate a new secret, update both Lovable and n8n).

### Notes
- The webhook ID (`8b6b77f6-...`) is the same string on both hosts because it lives inside the workflow JSON, so importing the workflow preserves it.
- DNS / custom domain: if you later want `n8n.yourdomain.com` instead of `srv1669108.hstgr.cloud`, that's a Hostinger-side DNS change and one more code update — out of scope for this migration.
