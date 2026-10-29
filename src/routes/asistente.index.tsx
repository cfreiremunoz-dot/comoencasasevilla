import { useEffect, useState } from 'react';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { MessageSquarePlus, Trash2 } from 'lucide-react';
import logo from '@/assets/asistente-logo.png';
import { deleteThread, loadThreads, newThreadId, type ChatThread } from '@/lib/chat-store';

export const Route = createFileRoute('/asistente/')({
  head: () => ({
    meta: [
      { title: 'Azahar, tu asistente en Sevilla · ComoEnCasa' },
      { name: 'description', content: 'Pregunta a Azahar qué ver, dónde comer o qué ruta hacer en Sevilla.' },
      { property: 'og:title', content: 'Azahar, tu asistente en Sevilla · ComoEnCasa' },
      { property: 'og:description', content: 'Pregunta a Azahar qué ver, dónde comer o qué ruta hacer en Sevilla.' },
    ],
  }),
  component: Page,
});

function Page() {
  const navigate = useNavigate();
  const [threads, setThreads] = useState<ChatThread[]>([]);
  useEffect(() => setThreads(loadThreads()), []);

  return (
    <div className="container-page max-w-3xl pb-20 pt-28 sm:pt-32">
      <div className="flex items-center gap-4">
        <img src={logo} alt="Azahar" width={64} height={64} className="h-16 w-16" />
        <div>
          <h1 className="font-serif text-4xl font-semibold text-tinta-800">Azahar</h1>
          <p className="text-tinta-600">Tu asistente para vivir Sevilla como en casa.</p>
        </div>
      </div>
      <button
        onClick={() => navigate({ to: '/asistente/$threadId', params: { threadId: newThreadId() } })}
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-terracota-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-terracota-600"
      >
        <MessageSquarePlus className="h-4 w-4" /> Nueva conversación
      </button>
      <h2 className="mt-10 font-serif text-xl font-semibold text-tinta-800">Tus conversaciones</h2>
      {threads.length ? (
        <ul className="mt-4 divide-y divide-crema-300 rounded-2xl bg-white ring-1 ring-crema-300">
          {threads.map((t) => (
            <li key={t.id} className="flex items-center gap-3 px-4 py-3">
              <Link to="/asistente/$threadId" params={{ threadId: t.id }} className="flex-1 truncate text-sm font-medium text-tinta-700 hover:text-terracota-600">
                {t.title}
              </Link>
              <button
                aria-label="Borrar conversación"
                onClick={() => { deleteThread(t.id); setThreads(loadThreads()); }}
                className="text-tinta-400 hover:text-terracota-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-tinta-500">Aún no has hablado con Azahar. Se guardan solo en este dispositivo.</p>
      )}
    </div>
  );
}
