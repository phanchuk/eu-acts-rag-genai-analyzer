## Validate Hostinger n8n migration (Option A — reuse existing WEBHOOK_JWT)

No code changes needed — `src/routes/api/chat.ts` already points to the Hostinger production URL and `WEBHOOK_JWT` is unchanged.

### Pre-flight checklist (you, in n8n)
1. Workflow is **Active** (toggle top-right of the workflow editor) — only Active workflows serve `/webhook/...`. The `/webhook-test/...` path only works while you click "Execute workflow".
2. Both webhook nodes (chat + embedding) have **Authentication = JWT Auth**, credential set to HS256 with secret = the Lovable `WEBHOOK_JWT` value.
3. Chat webhook node:
   - HTTP Method: `GET`
   - Path: `8b6b77f6-fac8-4989-bf56-b5174bca87ca`
   - Reads `query.message`
4. OpenAI / Pinecone / Google Drive credentials are recreated and the workflow's nodes reference the new credential entries (not the old Elestio ones — those show as red).

### Validation steps (me, then you)

**Step 1 — Direct curl from my sandbox to the Hostinger webhook**
I'll run two probes against `https://n8n.srv1669108.hstgr.cloud/webhook/8b6b77f6-...`:
- (a) no Authorization header → expect `401/403` (proves JWT Auth is enforced)
- (b) with a fresh HS256 token signed using `WEBHOOK_JWT` → expect `200` and an assistant reply

Possible outcomes and what they mean:
- (a) returns 200 → JWT Auth is NOT enabled on the node — fix in n8n
- (a) 401 + (b) 401 → secret mismatch between Lovable and n8n — re-paste in n8n
- (a) 401 + (b) 404 → workflow not Active, or webhook path differs — re-check
- (a) 401 + (b) 200 with quota text → auth works, OpenAI key issue (separate problem)
- (a) 401 + (b) 200 with reply → migration is good

**Step 2 — End-to-end through the deployed app**
Once Step 1 is green, you click **Publish → Update** so the live site picks up the new `WEBHOOK_URL`, then send a chat message from `https://eu-acts-rag-ai-analyzer.lovable.app`. I'll watch server logs (`n8n response { status, shape }`) to confirm.

**Step 3 — Embedding workflow smoke test**
Drop a test file into the configured Google Drive folder. Confirm in n8n's Executions tab that the embedding workflow ran and Pinecone received vectors.

**Step 4 — Decommission**
Once Steps 1–3 pass and stay green for ~24h, deactivate the Elestio workflow and shut down the Elestio instance.

### What I need from you to start
Just confirm the workflow is **Active** on Hostinger and JWT Auth is configured on both nodes. Then approve this plan and I'll run Step 1 immediately.
