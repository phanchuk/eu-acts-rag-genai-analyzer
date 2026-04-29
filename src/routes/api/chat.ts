import { createFileRoute } from "@tanstack/react-router";
import jwt from "jsonwebtoken";

const WEBHOOK_URL =
  "https://n8n-rag-test-u72212.vm.elestio.app/webhook/8b6b77f6-fac8-4989-bf56-b5174bca87ca";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { message } = (await request.json()) as { message?: string };
          if (!message || typeof message !== "string") {
            return Response.json({ error: "message is required" }, { status: 400 });
          }
          if (message.length > 4000) {
            return Response.json({ error: "message too long" }, { status: 400 });
          }

          const secret = process.env.WEBHOOK_JWT;
          if (!secret) {
            return Response.json({ error: "Server missing WEBHOOK_JWT" }, { status: 500 });
          }

          // Sign a fresh HS256 token per request using WEBHOOK_JWT as the shared secret
          const token = jwt.sign({}, secret, { algorithm: "HS256", expiresIn: "5m" });

          const url = `${WEBHOOK_URL}?message=${encodeURIComponent(message)}`;
          const res = await fetch(url, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          });

          const text = await res.text();
          if (!res.ok) {
            console.error("Webhook error", res.status, text);
            return Response.json(
              { error: "Upstream service unavailable" },
              { status: 502 }
            );
          }

          // Try to parse JSON; fall back to plain text
          let reply: string | null = null;
          let shape = "text";
          try {
            const data = JSON.parse(text);
            const extracted = extractReply(data);
            if (extracted.value) {
              reply = extracted.value;
              shape = extracted.shape;
            }
          } catch {
            if (text.trim()) {
              reply = text;
              shape = "raw-text";
            }
          }

          console.log("n8n response", { status: res.status, shape });

          if (!reply) {
            return Response.json(
              { error: "Upstream response did not contain an assistant message" },
              { status: 502 }
            );
          }

          return Response.json({ reply });
        } catch (err) {
          console.error("chat handler failed", err);
          return Response.json({ error: "Internal error" }, { status: 500 });
        }
      },
    },
  },
});

function pickString(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v : null;
}

function extractReply(data: unknown): { value: string | null; shape: string } {
  if (typeof data === "string") return { value: data, shape: "string" };

  if (Array.isArray(data)) {
    if (data.length === 0) return { value: null, shape: "empty-array" };
    const inner = extractReply(data[0]);
    return { value: inner.value, shape: `array[0].${inner.shape}` };
  }

  if (data && typeof data === "object") {
    const d = data as Record<string, unknown>;

    // OpenAI-style: { choices: [{ message: { content } }] }
    if (Array.isArray(d.choices) && d.choices.length > 0) {
      const inner = extractReply(d.choices[0]);
      if (inner.value) return { value: inner.value, shape: `choices[0].${inner.shape}` };
    }

    // { message: { content } } or { message: "..." }
    if (d.message !== undefined) {
      if (typeof d.message === "string" && d.message.trim()) {
        return { value: d.message, shape: "message" };
      }
      if (d.message && typeof d.message === "object") {
        const c = pickString((d.message as Record<string, unknown>).content);
        if (c) return { value: c, shape: "message.content" };
      }
    }

    // Direct content field
    const direct =
      pickString(d.output) ??
      pickString(d.reply) ??
      pickString(d.text) ??
      pickString(d.response) ??
      pickString(d.content) ??
      pickString(d.answer);
    if (direct) return { value: direct, shape: "field" };
  }

  return { value: null, shape: "unknown" };
}
