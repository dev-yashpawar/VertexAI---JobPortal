import { useEffect, useRef, useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Loader2, Send, Sparkles, X } from 'lucide-react';
import api from '../../lib/api';
import { cn } from '../../lib/utils';
import useAssistantStore from '../../store/useAssistantStore';
import useAuthStore from '../../store/useAuthStore';

const starterPrompts = {
  student: [
    'How can I improve my resume for ATS?',
    'Give me a 2-week interview preparation plan.',
    'How do I tailor applications for frontend roles?',
  ],
  recruiter: [
    'Write a better job description for a React developer.',
    'How can I shortlist candidates faster but fairly?',
    'Give me interview questions for a Node.js backend role.',
  ],
};

const parseAssistantTemplate = (message) => {
  if (!message || typeof message !== 'string') return null;

  const lines = message
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const quickIdx = lines.findIndex((line) => /^quick answer:?$/i.test(line));
  const nextIdx = lines.findIndex((line) => /^next step:?$/i.test(line));

  if (quickIdx === -1) return null;

  const answersEnd = nextIdx > quickIdx ? nextIdx : lines.length;
  const answerLines = lines.slice(quickIdx + 1, answersEnd);
  const nextLines = nextIdx !== -1 ? lines.slice(nextIdx + 1) : [];

  const points = answerLines
    .map((line) => line.replace(/^\d+\)\s*/, '').trim())
    .filter(Boolean);
  const nextStep = nextLines.join(' ').trim();

  if (points.length === 0 && !nextStep) return null;
  return { points, nextStep };
};

export default function RoleAssistantChat({ role = 'student', className = '', onClose }) {
  const { user, updateUser } = useAuthStore();
  const { getHistory, setHistory, appendMessage } = useAssistantStore();
  const cachedHistory = getHistory(role);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      message:
        role === 'recruiter'
          ? 'Hi! I am your Recruiter Copilot. Ask me about hiring, shortlisting, JDs, or interviews.'
          : 'Hi! I am your Student Career Copilot. Ask me about resume, applications, and interview prep.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [rateLimitedUntil, setRateLimitedUntil] = useState(0);
  const listRef = useRef(null);
  const fetchedHistoryRef = useRef(false);
  const sendTimeoutRef = useRef(null);
  const cooldownRef = useRef(0);
  const isCoolingDown = Date.now() < rateLimitedUntil;

  useEffect(() => {
    if (cachedHistory && cachedHistory.length > 0) {
      setMessages(cachedHistory);
      fetchedHistoryRef.current = true;
      return;
    }
    if (fetchedHistoryRef.current) return;
    fetchedHistoryRef.current = true;

    const fetchHistory = async () => {
      try {
        const res = await api.get('/ai/chat-assistant/history');
        const persisted = (res.data?.history || []).map((m) => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          message: String(m.message || ''),
        }));
        if (persisted.length > 0) {
          const normalized = persisted.slice(-20);
          setMessages(normalized);
          setHistory(role, normalized);
        }
      } catch {
        // Keep local starter state if history is unavailable.
      }
    };
    fetchHistory();
  }, [cachedHistory, role, setHistory]);

  useEffect(() => {
    return () => {
      if (sendTimeoutRef.current) {
        clearTimeout(sendTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const sendMessage = async (textOverride) => {
    const text = (textOverride || input).trim();
    if (!text || loading) return;
    if (Date.now() < cooldownRef.current) return;

    const nextMessages = [...messages, { role: 'user', message: text }];
    setMessages(nextMessages);
    appendMessage(role, { role: 'user', message: text });
    setInput('');
    setLoading(true);

    try {
      const history = nextMessages.slice(-8);
      const res = await api.post('/ai/chat-assistant', {
        message: text,
        history,
      });

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', message: res.data?.reply || 'I could not generate a response right now.' },
      ]);
      appendMessage(role, {
        role: 'assistant',
        message: res.data?.reply || 'I could not generate a response right now.',
      });
      // Sync credits
      if (typeof res.data?.credits === 'number') {
        updateUser({ aiCredits: res.data.credits });
      }
    } catch (error) {
      if (error?.response?.status === 429) {
        const retryAfterHeader = Number(error?.response?.headers?.['retry-after'] || 0);
        const waitMs = Number.isFinite(retryAfterHeader) && retryAfterHeader > 0 ? retryAfterHeader * 1000 : 5000;
        const until = Date.now() + waitMs;
        cooldownRef.current = until;
        setRateLimitedUntil(until);
        setTimeout(() => setRateLimitedUntil(0), waitMs);
      }
      const fallback =
        error?.response?.status === 429
          ? 'Please wait a few seconds before sending another message.'
          :
        error?.response?.data?.message ||
        'Assistant is temporarily unavailable. Please try again in a minute.';
      setMessages((prev) => [...prev, { role: 'assistant', message: fallback }]);
      appendMessage(role, { role: 'assistant', message: fallback });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (sendTimeoutRef.current) {
      clearTimeout(sendTimeoutRef.current);
    }
    // Small debounce to avoid accidental rapid submits.
    sendTimeoutRef.current = setTimeout(() => {
      sendMessage();
    }, 350);
  };

  return (
    <Card className={cn('p-0 overflow-hidden', className)}>
      <div className="p-4 border-b border-border bg-gray-50">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-primary flex items-center gap-2">
              <Sparkles size={18} className="text-accent" />
              {role === 'recruiter' ? 'Recruiter AI Assistant' : 'Student AI Assistant'}
            </h3>
            <p className="text-xs text-secondary mt-1">
              Ask role-specific queries and get quick, practical guidance.
            </p>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-md hover:bg-gray-200 text-secondary hover:text-primary transition"
              aria-label="Close assistant chat"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div ref={listRef} className="h-72 overflow-y-auto p-4 space-y-3 bg-white">
        {messages.map((m, idx) => (
          m.role === 'assistant' ? (
            (() => {
              const parsed = parseAssistantTemplate(m.message);
              if (!parsed) {
                return (
                  <div
                    key={`${m.role}-${idx}`}
                    className="max-w-[90%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap bg-gray-100 text-primary border border-border"
                  >
                    {m.message}
                  </div>
                );
              }

              return (
                <div
                  key={`${m.role}-${idx}`}
                  className="max-w-[90%] rounded-xl p-3 text-sm bg-gray-50 text-primary border border-border space-y-2"
                >
                  <p className="text-xs font-bold uppercase tracking-wide text-secondary">Quick Answer</p>
                  {parsed.points.length > 0 ? (
                    <ul className="space-y-1">
                      {parsed.points.map((point, pIdx) => (
                        <li key={`${idx}-point-${pIdx}`} className="text-sm leading-relaxed">
                          <span className="font-semibold text-accent mr-1">{pIdx + 1})</span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-secondary">No quick points available.</p>
                  )}
                  {parsed.nextStep && (
                    <div className="pt-1 border-t border-border/70">
                      <p className="text-xs font-bold uppercase tracking-wide text-secondary">Next Step</p>
                      <p className="text-sm mt-1 leading-relaxed">{parsed.nextStep}</p>
                    </div>
                  )}
                </div>
              );
            })()
          ) : (
            <div
              key={`${m.role}-${idx}`}
              className="max-w-[90%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ml-auto bg-accent text-white"
            >
              {m.message}
            </div>
          )
        ))}
        {loading && (
          <div className="inline-flex items-center gap-2 text-xs text-secondary bg-gray-100 border border-border rounded-lg px-3 py-2">
            <Loader2 size={14} className="animate-spin" />
            Thinking...
          </div>
        )}
      </div>

      <div className="px-4 pb-3 flex flex-wrap gap-2">
        {(starterPrompts[role] || starterPrompts.student).map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => sendMessage(prompt)}
            disabled={loading || isCoolingDown}
            className="text-xs border border-border rounded-full px-3 py-1 hover:bg-gray-50 text-secondary hover:text-primary transition"
          >
            {prompt}
          </button>
        ))}
      </div>

      <form onSubmit={onSubmit} className="p-3 border-t border-border flex gap-2 items-end">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onInput={(e) => {
            e.currentTarget.style.height = '40px';
            e.currentTarget.style.height = `${Math.min(e.currentTarget.scrollHeight, 112)}px`;
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder={
            role === 'recruiter'
              ? 'Ask about job posts, screening, interviews...'
              : 'Ask about resume, jobs, interview prep...'
          }
          rows={1}
          className="flex-1 min-h-10 max-h-28 rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none"
          disabled={loading || isCoolingDown}
        />
        <Button
          type="submit"
          variant="primary"
          className="gap-2 relative"
          disabled={loading || isCoolingDown || !input.trim() || (user?.aiCredits < 0.2)}
        >
          <span className="absolute -top-6 right-0 text-[10px] font-bold text-slate-400 opacity-50 whitespace-nowrap">
            Cost: 0.2 Credits
          </span>
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          {user?.aiCredits < 0.2 ? 'No Credits' : 'Send'}
        </Button>
      </form>
      {isCoolingDown && (
        <div className="px-3 pb-3 text-xs text-amber-700">
          Too many requests. Please wait...
        </div>
      )}
    </Card>
  );
}
