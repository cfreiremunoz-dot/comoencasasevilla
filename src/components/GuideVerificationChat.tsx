import { useId, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Send } from "lucide-react";
import { apiRequest } from "@/lib/guide-api";
import type {
  GuideVerificationMessage,
  GuideVerificationThreadResponse,
} from "@/lib/guide-verification-messages";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Message, MessageContent, MessageFooter, MessageHeader } from "@/components/ui/message";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";

const dateFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

type GuideVerificationChatProps = {
  endpoint: string;
  heading: string;
  counterpartLabel: string;
  emptyDescription: string;
  placeholder: string;
};

export function GuideVerificationChat({
  endpoint,
  heading,
  counterpartLabel,
  emptyDescription,
  placeholder,
}: GuideVerificationChatProps) {
  const queryClient = useQueryClient();
  const inputId = useId();
  const headingId = useId();
  const [draft, setDraft] = useState("");
  const queryKey = ["guide-verification-messages", endpoint];
  const messagesQuery = useQuery({
    queryKey,
    queryFn: () => apiRequest<GuideVerificationThreadResponse>(endpoint),
    refetchInterval: 15_000,
    refetchOnWindowFocus: true,
  });
  const sendMutation = useMutation({
    mutationFn: (body: string) =>
      apiRequest<{ message: GuideVerificationMessage }>(endpoint, {
        method: "POST",
        body: JSON.stringify({ body }),
      }),
    onSuccess: ({ message }, submittedBody) => {
      setDraft((current) => (current.trim() === submittedBody ? "" : current));
      queryClient.setQueryData<GuideVerificationThreadResponse>(queryKey, (current) =>
        current ? { ...current, messages: [...current.messages, message] } : current,
      );
      void queryClient.invalidateQueries({ queryKey });
    },
  });

  const messages = messagesQuery.data?.messages ?? [];
  const viewerId = messagesQuery.data?.viewerId;

  function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = draft.trim();
    if (!body || body.length > 2000 || sendMutation.isPending) return;
    sendMutation.mutate(body);
  }

  return (
    <section aria-labelledby={headingId} className="mt-5 border-t border-crema-200 pt-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 id={headingId} className="font-serif text-lg font-semibold text-tinta-800">
            {heading}
          </h3>
          <p className="mt-1 text-sm text-tinta-500">
            Conversación privada con {counterpartLabel} para completar la verificación.
          </p>
        </div>
        <span className="rounded-full bg-crema-100 px-3 py-1 text-xs font-medium text-tinta-600">
          Privado
        </span>
      </div>

      {messagesQuery.isPending ? (
        <p className="mt-4 rounded-xl bg-crema-50 p-4 text-sm text-tinta-500" role="status">
          Cargando mensajes…
        </p>
      ) : messagesQuery.isError ? (
        <p className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-800" role="alert">
          {messagesQuery.error.message}
        </p>
      ) : (
        <MessageScrollerProvider autoScroll>
          <MessageScroller className="mt-4 h-72 rounded-2xl border border-crema-200 bg-crema-50">
            <MessageScrollerViewport
              aria-label={`Conversación con ${counterpartLabel}`}
              role="log"
              aria-live="polite"
              aria-relevant="additions"
            >
              <MessageScrollerContent className="gap-4 px-4 py-4">
                {messages.length === 0 ? (
                  <MessageScrollerItem messageId="empty-thread">
                    <Empty className="min-h-48 border-0 p-4 md:p-4">
                      <EmptyHeader>
                        <EmptyTitle className="text-base">Aún no hay mensajes</EmptyTitle>
                        <EmptyDescription>{emptyDescription}</EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  </MessageScrollerItem>
                ) : (
                  messages.map((message) => {
                    const isMine = message.senderUserId === viewerId;
                    return (
                      <MessageScrollerItem
                        key={message.id}
                        messageId={message.id}
                        scrollAnchor={isMine}
                      >
                        <Message align={isMine ? "end" : "start"}>
                          <MessageContent className="gap-1.5">
                            <MessageHeader className="px-1">
                              {isMine ? "Tú" : counterpartLabel}
                            </MessageHeader>
                            <Bubble
                              align={isMine ? "end" : "start"}
                              variant={isMine ? "tinted" : "muted"}
                            >
                              <BubbleContent className="whitespace-pre-wrap">
                                {message.body}
                              </BubbleContent>
                            </Bubble>
                            <MessageFooter className="px-1">
                              <time dateTime={message.createdAt}>
                                {dateFormatter.format(new Date(message.createdAt))}
                              </time>
                            </MessageFooter>
                          </MessageContent>
                        </Message>
                      </MessageScrollerItem>
                    );
                  })
                )}
              </MessageScrollerContent>
            </MessageScrollerViewport>
            <MessageScrollerButton variant="outline" size="icon" />
          </MessageScroller>
        </MessageScrollerProvider>
      )}

      <form onSubmit={submitMessage} className="mt-4" aria-busy={sendMutation.isPending}>
        <label htmlFor={inputId} className="sr-only">
          Escribe un mensaje para {counterpartLabel}
        </label>
        <InputGroup className="overflow-hidden rounded-xl border-crema-300 bg-white shadow-none">
          <InputGroupTextarea
            id={inputId}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            maxLength={2000}
            rows={2}
            placeholder={placeholder}
            aria-describedby={`${inputId}-hint ${inputId}-count`}
            className="min-h-20 max-h-40 resize-y px-3 py-3 text-sm text-tinta-700"
          />
          <InputGroupAddon
            align="block-end"
            className="w-full justify-between border-t border-crema-200 bg-crema-50 px-3 py-2"
          >
            <span id={`${inputId}-count`} className="text-xs font-medium text-tinta-400">
              {draft.length}/2000
            </span>
            <InputGroupButton
              type="submit"
              variant="default"
              size="sm"
              disabled={!draft.trim() || sendMutation.isPending}
              className="ml-auto rounded-full bg-terracota-600 px-4 text-white hover:bg-terracota-700"
            >
              <Send aria-hidden="true" data-icon="inline-start" />
              {sendMutation.isPending ? "Enviando…" : "Enviar"}
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        <p id={`${inputId}-hint`} className="sr-only">
          El mensaje se guardará en la conversación privada de verificación.
        </p>
        {sendMutation.isError && (
          <p className="mt-2 text-sm text-red-800" role="alert">
            {sendMutation.error.message}
          </p>
        )}
      </form>
    </section>
  );
}
