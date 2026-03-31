import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Send, Bot, MessageSquareText } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

function TypingIndicator() {
  return (
    <div className="flex gap-2">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent">
        <Bot className="h-3.5 w-3.5 text-accent-foreground" />
      </div>
      <div className="rounded-2xl bg-secondary px-4 py-3 flex gap-1 items-center">
        <span className="typing-dot h-1.5 w-1.5 rounded-full bg-muted-foreground" />
        <span className="typing-dot h-1.5 w-1.5 rounded-full bg-muted-foreground" />
        <span className="typing-dot h-1.5 w-1.5 rounded-full bg-muted-foreground" />
      </div>
    </div>
  );
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hey! 👋 I'm your EvoWell AI fitness assistant. Ask me anything about workouts, nutrition, or your fitness plan." },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg: Message = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "I'm being set up! Once the AI backend is connected, I'll be able to answer all your fitness questions with personalized advice based on your goals and progress." },
      ]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-background">
      <div className="pointer-events-none absolute -left-20 top-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-20 h-64 w-64 rounded-full bg-info/10 blur-3xl" />
      {/* Header */}
      <header className="relative z-10 flex items-center gap-3 glass-strong px-4 py-3">
        <Button variant="ghost" size="icon" asChild className="rounded-xl">
          <Link to="/dashboard"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full gradient-primary">
            <Bot className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <div className="text-sm font-semibold">EvoWell AI</div>
            <div className="text-xs text-muted-foreground">Your fitness assistant</div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="relative z-10 flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn("flex gap-2", msg.role === "user" ? "justify-end" : "justify-start")}
          >
            {msg.role === "assistant" && (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent">
                <Bot className="h-3.5 w-3.5 text-accent-foreground" />
              </div>
            )}
            <div
              className={cn(
                "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                msg.role === "user"
                  ? "gradient-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              )}
            >
              {msg.content}
            </div>
          </motion.div>
        ))}
        {isLoading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="relative z-10 border-t border-border/50 glass-strong p-4">
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="rounded-2xl border border-border/70 bg-card/80 p-3 shadow-sm backdrop-blur-sm"
        >
          <label htmlFor="chatInput" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Message
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <MessageSquareText className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="chatInput"
                placeholder="Ask about workouts, nutrition, or your plan..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="h-11 pl-10"
              />
            </div>
            <Button type="submit" size="icon" disabled={!input.trim() || isLoading} className="h-11 w-11 rounded-xl gradient-primary shadow-md transition-transform duration-200 hover:-translate-y-0.5">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
