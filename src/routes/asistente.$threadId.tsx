import { useEffect, useRef, useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import logo from '@/assets/asistente-logo.png';
import { Conversation, ConversationContent, ConversationEmptyState, ConversationScrollButton } from '@/components/ai-elements/conversation';
import { Message, MessageContent, MessageResponse } from '@/components/ai-elements/message';
import { PromptInput, PromptInputFooter, PromptInputSubmit, PromptInputTextarea } from '@/components/ai-elements/prompt-input';
import { Shimmer } from '@/components/ai-elements/shimmer';
import { getThread, newThreadId, textOf, upsertThread, type ChatMessage } from '@/lib/chat-store';

export const Route = createFileRoute('/asistente/$threadId')({
  ssr: false,
  head: () => ({
    meta: [
      { title: 'Conversación con Azahar · ComoEnCasa' },
      { name: 'description', content: 'Habla con Azahar, el asistente de ComoEnCasa para Sevilla.' },
      { property: 'og:title', content: 'Conversación con Azahar · ComoEnCasa' },
      { property: 'og:description', content: 'Habla con Azahar, el asistente de ComoEnCasa para Sevilla.' },
    ],
  }),
  component: ThreadPage,
});

const suggestions = ['¿Dónde puedo comer como un sevillano?', 'Propón una ruta de una tarde por Triana', '¿Qué hago un domingo en Sevilla?'];

function ThreadPage() {
  const { threadId } = Route.useParams();
  return <ChatWindow key={threadId} threadId={threadId} />;
}

function ChatWindow({ threadId }: { threadId: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => getThread(threadId)?.messages ?? []);
  const [status, setStatus] = useState<'ready' | 'submitted' | 'streaming' | 'error'>('ready');
  const [input, setInput] = useState('');
  const abortRef = useRef<AbortController | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (status === 'ready' || status === 'error') textareaRef.current?.focus();
  }, [status, threadId]);

  function persist(msgs: ChatMessage[]) {
    const firstUser = msgs.find((m) => m.role === 'user');
    upsertThread({ id: threadId, title: firstUser ? textOf(firstUser).slice(0, 60) : 'Nueva conversación', updatedAt: Date.now(), messages: msgs });
  }

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || status === 'submitted' || status === 'streaming') return;
    const userMsg: ChatMessage = { id: newThreadId(), role: 'user', parts: [{ type: 'text', text: trimmed }] };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput('');
    setStatus('submitted');
    persist(history);

    const ctrl = new AbortController();
    abortRef.current = ctrl;
    const assistantId = newThreadId();
    let acc = '';
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ messages: history.slice(-30).map((m) => ({ role: m.role, text: textOf(m) })) }),
        signal: ctrl.signal,
      });
      if (!res.ok || !res.body) throw new Error(await res.text().catch(() => '') || 'No he podido responder.');
      setStatus('streaming');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages([...history, { id: assistantId, role: 'assistant', parts: [{ type: 'text', text: acc }] }]);
      }
      const final = [...history, { id: assistantId, role: 'assistant' as const, parts: [{ type: 'text' as const, text: acc }] }];
      setMessages(final);
      persist(final);
      setStatus('ready');
    } catch (err) {
      const stopped = ctrl.signal.aborted;
      const msg = stopped ? acc || '_Respuesta detenida._' : `${acc}\n\n_${err instanceof Error ? err.message : 'No he podido responder.'}_`;
      const final = [...history, { id: assistantId, role: 'assistant' as const, parts: [{ type: 'text' as const, text: msg }] }];
      setMessages(final);
      persist(final);
      setStatus(stopped ? 'ready' : 'error');
    }
  }

  return (
    <div className="container-page flex h-[100svh] max-w-3xl flex-col pb-6 pt-24 sm:pt-28">
      <div className="mb-3 flex items-center gap-3">
        <Link to="/asistente" className="text-tinta-500 hover:text-terracota-600" aria-label="Volver a conversaciones">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <img src={logo} alt="" width={36} height={36} className="h-9 w-9" />
        <span className="font-serif text-lg font-semibold text-tinta-800">Azahar</span>
      </div>
      <Conversation className="min-h-0 flex-1 rounded-2xl bg-white ring-1 ring-crema-300">
        <ConversationContent>
          {messages.length === 0 ? (
            <ConversationEmptyState
              icon={<img src={logo} alt="" width={72} height={72} className="h-18 w-18" />}
              title="¡Hola! Soy Azahar"
              description="Pregúntame qué ver, dónde comer o qué ruta hacer en Sevilla."
            >
              <div className="mt-4 flex flex-col items-center gap-2">
                <img src={logo} alt="" width={72} height={72} className="h-18 w-18" />
                <p className="font-serif text-lg font-semibold text-tinta-800">¡Hola! Soy Azahar</p>
                <p className="text-sm text-tinta-500">Pregúntame qué ver, dónde comer o qué ruta hacer en Sevilla.</p>
                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  {suggestions.map((s) => (
                    <button key={s} onClick={() => send(s)} className="rounded-full bg-crema-200 px-3 py-1.5 text-xs text-tinta-700 hover:bg-crema-300">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </ConversationEmptyState>
          ) : (
            messages.map((m) => (
              <Message key={m.id} from={m.role}>
                <MessageContent className={m.role === 'user' ? 'group-[.is-user]:bg-primary group-[.is-user]:text-primary-foreground' : ''}>
                  {m.parts.map((p, i) => (m.role === 'assistant' ? <MessageResponse key={i}>{p.text}</MessageResponse> : <span key={i} className="whitespace-pre-wrap">{p.text}</span>))}
                </MessageContent>
              </Message>
            ))
          )}
          {status === 'submitted' && <Shimmer className="text-sm">Azahar está pensando…</Shimmer>}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
      <PromptInput className="mt-3" onSubmit={(msg) => send(msg.text)}>
        <PromptInputTextarea ref={textareaRef} value={input} onChange={(e) => setInput(e.target.value)} placeholder="Escribe tu pregunta…" />
        <PromptInputFooter className="justify-end">
          <PromptInputSubmit status={status} disabled={!input.trim() && status === 'ready'} onStop={() => abortRef.current?.abort()} />
        </PromptInputFooter>
      </PromptInput>
    </div>
  );
}
