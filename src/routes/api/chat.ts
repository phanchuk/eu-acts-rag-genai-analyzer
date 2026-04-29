import { createFileRoute } from "@tanstack/react-router";

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

          const jwt = process.env.WEBHOOK_JWT;
          if (!jwt) {
            return Response.json({ error: "Server missing WEBHOOK_JWT" }, { status: 500 });
          }

          const url = `${WEBHOOK_URL}?message=${encodeURIComponent(message)}`;
          const res = await fetch(url, {
            method: "GET",
            headers: { Authorization: `Bearer ${jwt}` },
          });

          const text = await res.text();
          if (!res.ok) {
            console.error("Webhook error", res.status, text);
            return Response.json(
              { error: `Webhook returned ${res.status}`, details: text.slice(0, 500) },
              { status: 502 }
            );
          }

          // Try to parse JSON; fall back to plain text
          let reply: string;
          try {
            const data = JSON.parse(text);
            reply =
              data.output ??
              data.reply ??
              data.message ??
              data.text ??
              data.response ??
              (typeof data === "string" ? data : JSON.stringify(data));
          } catch {
            reply = text;
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
