import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Send, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  component: ChatPage,
  head: () => ({
    meta: [
      { title: "AI Chat — Powered by n8n" },
      { name: "description", content: "Conversational AI chatbot connected to your n8n webhook." },
    ],
  }),
});

type Message = { id: string; role: "user" | "bot"; content: string };

function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "bot",
      content: "Hi! I'm connected to your n8n workflow. Ask me anything.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      const reply = res.ok
        ? data.reply || "(empty response)"
        : `⚠️ ${data.error || "Something went wrong"}`;
      setMessages((m) => [...m, { id: crypto.randomUUID(), role: "bot", content: reply }]);
    } catch {
      setMessages((m) => [
        ...m,
        { id: crypto.randomUUID(), role: "bot", content: "⚠️ Network error. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col px-4 py-6 sm:py-10">
      <header className="mb-6 flex items-center gap-3">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground"
          style={{ boxShadow: "var(--shadow-glow)" }}
        >
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">AI Assistant</h1>
          <p className="text-xs text-muted-foreground">Connected via secure webhook</p>
        </div>
        <div className="ml-auto flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
          <span className="h-2 w-2 rounded-full bg-accent" />
          Online
        </div>
      </header>

      <div
        ref={scrollRef}
        className="flex-1 space-y-4 overflow-y-auto rounded-3xl border border-border bg-card/40 p-4 backdrop-blur sm:p-6"
        style={{ minHeight: "60vh", maxHeight: "70vh" }}
      >
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
        {loading && <TypingBubble />}
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex items-end gap-2">
        <div className="relative flex-1">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message…"
            className="w-full rounded-2xl border border-border bg-input px-5 py-4 pr-12 text-sm text-foreground placeholder:text-muted-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
            disabled={loading}
            maxLength={4000}
          />
        </div>
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-primary text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          style={{ boxShadow: "var(--shadow-glow)" }}
          aria-label="Send"
        >
          <Send className="h-5 w-5" />
        </button>
      </form>
    </main>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <div className={`msg-in flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser ? "text-bubble-user-foreground" : "bg-bubble-bot text-bubble-bot-foreground"
        }`}
        style={isUser ? { background: "var(--bubble-user)" } : undefined}
      >
        {message.content}
      </div>
    </div>
  );
}

function TypingBubble() {
  return (
    <div className="msg-in flex justify-start">
      <div className="flex gap-1.5 rounded-2xl bg-bubble-bot px-4 py-4">
        <span className="typing-dot h-2 w-2 rounded-full bg-muted-foreground" />
        <span className="typing-dot h-2 w-2 rounded-full bg-muted-foreground" />
        <span className="typing-dot h-2 w-2 rounded-full bg-muted-foreground" />
      </div>
    </div>
  );
}
