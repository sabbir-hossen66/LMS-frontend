'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import {
  Bot,
  Send,
  X,
  Trash2,
  Sparkles,
  ChevronDown,
  RefreshCw,
  User,
  ExternalLink,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

const SUGGESTED_QUESTIONS = [
  'কী কী কোর্স আছে?',
  'কোর্স এনরোল কীভাবে করবো?',
  'পেমেন্ট মেথড কী কী?',
  'কোর্সের মেয়াদ কতদিন?',
  'সার্টিফিকেট পাবো কি?',
  'সাব্বির ভাইয়ের সাথে যোগাযোগ',
];

const INITIAL_BOT_MESSAGE: ChatMessage = {
  id: 'welcome-msg',
  role: 'assistant',
  content:
    'আসসালামু আলাইকুম! আমি **Sabbir Academy**-র অফিসিয়াল AI অ্যাসিস্ট্যান্ট।\n\n' +
    'আমাদের কোর্স, এনরোলমেন্ট, পেমেন্ট, সার্টিফিকেট বা যেকোনো বিষয় নিয়ে প্রশ্ন করতে পারেন। নিচে সাজেস্টেড প্রশ্নগুলোতে ক্লিক করতে পারেন অথবা সরাসরি টাইপ করুন!',
  timestamp: Date.now(),
};

const STORAGE_KEY = 'sabbir_academy_chat_history_v1';

export function ChatWidget() {
  const pathname = usePathname();

  // Hide AI Chatbot widget on the Code Editor page
  if (pathname?.startsWith('/editor')) {
    return null;
  }

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const API_BASE =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

  // Load chat history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      }
    } catch {
      // Fallback
    }
    setMessages([INITIAL_BOT_MESSAGE]);
  }, []);

  // Save chat history to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      } catch {
        // Ignore storage errors
      }
    }
  }, [messages]);

  // Auto-scroll to bottom
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom('auto');
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom('smooth');
  }, [messages, isLoading]);

  const handleClearChat = () => {
    const freshList = [INITIAL_BOT_MESSAGE];
    setMessages(freshList);
    setErrorMsg(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  };

  const sendMessage = async (textToSend?: string) => {
    const text = (textToSend ?? inputMessage).trim();
    if (!text || isLoading) return;

    setErrorMsg(null);
    setInputMessage('');

    const userMsgId = 'usr-' + Date.now();
    const newUserMsg: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    // Prepare previous history (last 10 items) for backend context
    const currentMessages = [...messages, newUserMsg];
    setMessages(currentMessages);
    setIsLoading(true);

    const historyPayload = currentMessages
      .filter((m) => m.id !== 'welcome-msg')
      .slice(-10)
      .map((m) => ({
        role: m.role,
        content: m.content,
      }));

    const botMsgId = 'bot-' + Date.now();
    let accumulatedText = '';

    try {
      // Attempt streaming endpoint first
      const response = await fetch(`${API_BASE}/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: historyPayload.slice(0, -1), // exclude current msg from history
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Streaming not available, falling back');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let isFirstChunk = true;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const rawChunk = decoder.decode(value, { stream: true });
        const lines = rawChunk.split('\n');

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;
          const dataStr = trimmed.slice(5).trim();

          if (dataStr === '[DONE]') {
            break;
          }

          try {
            const parsed = JSON.parse(dataStr);
            if (parsed.text) {
              accumulatedText += parsed.text;

              if (isFirstChunk) {
                isFirstChunk = false;
                setMessages((prev) => [
                  ...prev,
                  {
                    id: botMsgId,
                    role: 'assistant',
                    content: accumulatedText,
                    timestamp: Date.now(),
                  },
                ]);
              } else {
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === botMsgId
                      ? { ...msg, content: accumulatedText }
                      : msg,
                  ),
                );
              }
            }
          } catch {
            // Ignore partial SSE chunk formatting
          }
        }
      }

      if (!accumulatedText) {
        throw new Error('No streaming data received');
      }
    } catch {
      // Fallback to standard POST /chat endpoint
      try {
        const fbRes = await fetch(`${API_BASE}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            history: historyPayload.slice(0, -1),
          }),
        });

        if (!fbRes.ok) {
          throw new Error(`HTTP ${fbRes.status}`);
        }

        const data = await fbRes.json();
        const reply =
          data.data?.reply ||
          data.reply ||
          'দুঃখিত, কোনো উত্তর পাওয়া যায়নি। সাব্বির ভাইয়ের সাথে WhatsApp-এ (+880 1783-780066) কথা বলুন।';

        setMessages((prev) => [
          ...prev.filter((m) => m.id !== botMsgId),
          {
            id: botMsgId,
            role: 'assistant',
            content: reply,
            timestamp: Date.now(),
          },
        ]);
      } catch (err: any) {
        setErrorMsg('মেসেজ পাঠাতে সমস্যা হচ্ছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
        setMessages((prev) => [
          ...prev.filter((m) => m.id !== botMsgId),
          {
            id: botMsgId,
            role: 'assistant',
            content:
              'দুঃখিত! সার্ভারের সাথে সংযোগ করতে সমস্যা হচ্ছে। সরাসরি সাব্বির ভাইয়ের সাথে যোগাযোগ করতে পারেন:\n\n' +
              '📱 **WhatsApp**: [+880 1783-780066](https://wa.me/8801783780066)\n' +
              '✉️ **Email**: sabbir.ms2000@gmail.com',
            timestamp: Date.now(),
          },
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center group">
        {/* Tooltip on hover */}
        <div className="pointer-events-none absolute right-16 sm:right-20 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:-translate-x-1 whitespace-nowrap bg-neutral-900 text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-xl border border-white/10 hidden sm:flex items-center space-x-1.5">
          <span>Ask AI Assistant</span>
          <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
        </div>

        <button
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label="Toggle Sabbir Academy AI Chatbot"
          className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-primary to-orange-400 text-white flex items-center justify-center shadow-[0_10px_25px_-5px_rgba(249,115,22,0.5)] hover:scale-110 active:scale-95 transition-all duration-300 border-2 border-white/20"
        >
          {isOpen ? (
            <ChevronDown className="w-7 h-7 sm:w-8 sm:h-8 text-white transition-transform" />
          ) : (
            <>
              {/* Soft pulsing halo animation */}
              <span className="absolute -inset-1 rounded-full bg-primary/30 animate-ping pointer-events-none" />
              <Bot className="w-7 h-7 sm:w-8 sm:h-8 text-white relative z-10 drop-shadow-sm" />
              <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-neutral-900 z-20" />
            </>
          )}
        </button>
      </div>

      {/* Chat Window Modal */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[420px] h-[580px] max-h-[82vh] bg-card/95 backdrop-blur-xl border border-border shadow-2xl rounded-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-300 text-card-foreground"
          role="dialog"
          aria-label="Sabbir Academy AI Chatbot Window"
        >
          {/* Header */}
          <div className="px-4 py-3.5 bg-gradient-to-r from-primary/15 via-primary/5 to-transparent border-b border-border/60 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-inner">
                <Bot className="w-5 h-5 text-primary" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-card" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <h3 className="font-semibold text-sm leading-tight text-foreground">
                    Sabbir Academy AI
                  </h3>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-primary/15 text-primary uppercase tracking-wider">
                    Free AI
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground flex items-center space-x-1">
                  <span>Course & Admission Assistant</span>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={handleClearChat}
                title="Clear Chat History"
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-neutral-500/10 transition-colors"
                aria-label="Clear chat"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-neutral-500/10 transition-colors"
                aria-label="Close chat window"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs sm:text-sm custom-scrollbar">
            {messages.map((msg) => {
              const isBot = msg.role === 'assistant';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${
                    isBot ? 'justify-start' : 'justify-end'
                  }`}
                >
                  {isBot && (
                    <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex-shrink-0 flex items-center justify-center text-primary mt-0.5">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl leading-relaxed whitespace-pre-wrap break-words shadow-sm ${
                      isBot
                        ? 'bg-neutral-100 dark:bg-neutral-800/80 text-foreground border border-border/50 rounded-tl-sm'
                        : 'bg-primary text-primary-foreground font-medium rounded-tr-sm'
                    }`}
                  >
                    {msg.content}
                  </div>

                  {!isBot && (
                    <div className="w-7 h-7 rounded-lg bg-neutral-200 dark:bg-neutral-700 flex-shrink-0 flex items-center justify-center text-muted-foreground mt-0.5">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Suggested Question Chips (Only show if less than 4 user messages) */}
            {messages.filter((m) => m.role === 'user').length < 3 && (
              <div className="pt-2">
                <p className="text-[11px] font-semibold text-muted-foreground mb-2 flex items-center space-x-1">
                  <span>💡 দ্রুত জানার জন্য ক্লিক করুন:</span>
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTED_QUESTIONS.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => sendMessage(q)}
                      disabled={isLoading}
                      className="px-2.5 py-1 text-xs bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-full font-medium transition-all duration-200 hover:scale-[1.02] active:scale-95 disabled:opacity-50 text-left"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Typing / Loading indicator */}
            {isLoading && (
              <div className="flex items-center space-x-2 text-muted-foreground py-1">
                <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Bot className="w-3.5 h-3.5 animate-spin" />
                </div>
                <div className="flex items-center space-x-1 bg-neutral-100 dark:bg-neutral-800/80 px-3 py-2 rounded-2xl border border-border/50">
                  <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center justify-between">
                <span>{errorMsg}</span>
                <button
                  onClick={() => sendMessage()}
                  className="flex items-center space-x-1 text-xs font-semibold hover:underline"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Retry</span>
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input & Footer */}
          <div className="p-3 bg-neutral-50 dark:bg-neutral-900/50 border-t border-border/70">
            <div className="relative flex items-center">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about courses, enrollment, fees..."
                maxLength={500}
                disabled={isLoading}
                className="w-full pl-3.5 pr-12 py-2.5 text-xs sm:text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-muted-foreground disabled:opacity-60"
              />
              <button
                onClick={() => sendMessage()}
                disabled={!inputMessage.trim() || isLoading}
                className="absolute right-1.5 p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-30 disabled:hover:bg-primary transition-all duration-200"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground px-1">
              <span>{inputMessage.length} / 500 chars</span>
              <a
                href="https://wa.me/8801783780066"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors flex items-center space-x-1"
              >
                <span>Direct WhatsApp Mentorship</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
