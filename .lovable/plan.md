## Diagnosis

The app is successfully reaching the n8n production webhook and returning HTTP 200. The problem is in how the Lovable `/api/chat` route extracts the answer from n8n's response.

Your n8n **Respond to Webhook** output screenshot shows this shape:

```text
[
  {
    "index": 0,
    "message": {
      "role": "assistant",
      "content": "The DSA Regulation ..."
    },
    "logprobs": null,
    "finish_reason": "stop"
  }
]
```

The current Lovable parser only checks top-level fields like:

```text
output, reply, message, text, response
```

So when n8n returns an array, or an OpenAI-style object where the actual answer is inside `message.content`, the app can miss the intended assistant content and fall back to the wrong serialized/previous value. This explains why n8n shows the correct answer in the execution, while the chatbot displays nonsensical RAG chunk text.

## Plan

### 1. Update `/api/chat` response extraction

Modify `src/routes/api/chat.ts` so it supports the real n8n/OpenAI response shapes:

- Plain text response
- `{ output: "..." }`
- `{ reply: "..." }`
- `{ text: "..." }`
- `{ response: "..." }`
- `{ message: "..." }`
- `{ message: { content: "..." } }`
- `[ { message: { content: "..." } } ]`
- `[ { output/reply/text/response: "..." } ]`
- OpenAI Chat Completions style: `{ choices: [{ message: { content: "..." } }] }`

The highest-priority extraction will be `message.content`, because that is what your screenshot shows n8n is returning from the final OpenAI node.

### 2. Make empty/unrecognized responses explicit

If n8n returns valid JSON but no extractable answer, return a controlled error instead of displaying unrelated or stringified internals in the chat.

Example client-visible message:

```text
Upstream response did not contain an assistant message
```

The server logs can still include the response shape for debugging, but will avoid exposing secrets or raw upstream error bodies to the browser.

### 3. Add temporary-safe debugging for response shape only

Add a short server log that records only:

- HTTP status
- whether the body is JSON or text
- detected response shape, such as `array[0].message.content`

It will not log `WEBHOOK_JWT`, Authorization headers, or full upstream error bodies.

### 4. Keep your n8n production URL and JWT flow as-is

No change is needed to the webhook URL or JWT signing. The production URL is already being called successfully; the fix is response normalization on the Lovable side.

## Expected result

For your current n8n output, Lovable will display:

```text
The DSA Regulation (Regulation (EU) 2024/1689) was established on June 13, 2024...
```

instead of the irrelevant DMA/EU AI Act chunk summary.

## Technical details

Implement a small helper in `src/routes/api/chat.ts`, for example:

```text
extractReply(data): string | null
```

It will recursively check the common n8n/OpenAI response containers in a safe order, then the POST handler will return:

```text
Response.json({ reply })
```

only when a real assistant message was found.