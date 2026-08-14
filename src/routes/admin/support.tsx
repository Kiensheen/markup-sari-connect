import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { MessageCircle, Send, Inbox, ChevronLeft, User as UserIcon } from "lucide-react";
import { useMock } from "@/contexts/MockContext";
import { formatDate, type SupportThread } from "@/lib/mockData";

export const Route = createFileRoute("/admin/support")({
  component: AdminSupport,
});

function lastActivity(thread: SupportThread): string {
  const last = thread.messages[thread.messages.length - 1];
  return last ? last.created_at : thread.created_at;
}

function AdminSupport() {
  const { supportThreads, replySupportMessage, users } = useMock();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const sortedThreads = useMemo(() => {
    return [...supportThreads].sort(
      (a, b) => new Date(lastActivity(b)).getTime() - new Date(lastActivity(a)).getTime(),
    );
  }, [supportThreads]);

  const selected = sortedThreads.find((t) => t.id === selectedId) ?? null;
  const selectedUser = selected ? users.find((u) => u.id === selected.consumer_id) : undefined;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Support inbox</h2>
        <p className="text-sm text-slate-500">
          {supportThreads.length} conversation{supportThreads.length === 1 ? "" : "s"} from consumers
        </p>
      </div>

      {sortedThreads.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white py-16 text-center shadow-sm">
          <div className="rounded-full bg-slate-100 p-5">
            <Inbox className="h-10 w-10 text-slate-300" />
          </div>
          <p className="mt-4 font-semibold text-slate-700">No support messages yet</p>
          <p className="mt-1 text-sm text-slate-500">
            When a consumer contacts you from the Support page, their thread appears here.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
          {/* Thread list */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Threads
            </div>
            <div className="max-h-[70vh] divide-y divide-slate-100 overflow-y-auto">
              {sortedThreads.map((t) => {
                const last = t.messages[t.messages.length - 1];
                const active = t.id === selectedId;
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedId(t.id)}
                    className={`block w-full px-4 py-3 text-left transition-colors ${
                      active ? "bg-blue-50" : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-500 text-sm font-bold text-white">
                        {(t.consumer_name || "?").charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="truncate text-sm font-semibold text-slate-800">
                            {t.consumer_name}
                          </span>
                          <span className="shrink-0 text-[10px] text-slate-400">
                            {formatDate(lastActivity(t))}
                          </span>
                        </div>
                        <div className="mt-0.5 flex items-center justify-between gap-2">
                          <span className="truncate text-xs text-slate-500">
                            {last ? last.text : "No messages yet"}
                          </span>
                          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                            <MessageCircle className="h-3 w-3" />
                            {t.messages.length}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Conversation */}
          <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            {selected ? (
              <>
                <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3">
                  <button
                    onClick={() => setSelectedId(null)}
                    className="rounded-lg p-1 text-slate-500 transition-colors hover:bg-slate-200 lg:hidden"
                    aria-label="Back to thread list"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-500 text-sm font-bold text-white">
                    {(selected.consumer_name || "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {selected.consumer_name}
                      {selectedUser?.email && (
                        <span className="ml-2 hidden text-xs font-normal text-slate-400 sm:inline">
                          {selectedUser.email}
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-slate-500">Started {formatDate(selected.created_at)}</p>
                  </div>
                  <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                    <MessageCircle className="h-3 w-3" />
                    {selected.messages.length} message{selected.messages.length === 1 ? "" : "s"}
                  </span>
                </div>

                <ConversationBodies
                  thread={selected}
                  onReply={(text) => replySupportMessage(selected.id, text)}
                />
              </>
            ) : (
              <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                <div className="rounded-full bg-slate-100 p-5">
                  <MessageCircle className="h-10 w-10 text-slate-300" />
                </div>
                <p className="mt-4 font-semibold text-slate-700">Select a conversation</p>
                <p className="mt-1 text-sm text-slate-500">
                  Choose a thread on the left to read and reply to a consumer.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ConversationBodies({
  thread,
  onReply,
}: {
  thread: SupportThread;
  onReply: (text: string) => void;
}) {
  const [input, setInput] = useState("");

  const send = () => {
    const text = input.trim();
    if (!text) return;
    onReply(text);
    setInput("");
  };

  return (
    <>
      <div className="max-h-[55vh] flex-1 space-y-4 overflow-y-auto px-5 py-4">
        {thread.messages.length === 0 ? (
          <div className="py-10 text-center">
            <UserIcon className="mx-auto h-10 w-10 text-slate-200" />
            <p className="mt-3 text-sm text-slate-500">No messages in this thread yet.</p>
          </div>
        ) : (
          thread.messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.sender === "consumer" ? "justify-start" : "justify-end"}`}>
              {msg.sender === "consumer" && (
                <div className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                  <UserIcon className="h-4 w-4" />
                </div>
              )}
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                  msg.sender === "consumer"
                    ? "bg-slate-100 text-slate-800 rounded-bl-sm"
                    : "bg-blue-600 text-white rounded-br-sm"
                }`}
              >
                <p className="text-sm">{msg.text}</p>
                <p className={`mt-1 text-[10px] ${msg.sender === "consumer" ? "text-slate-400" : "text-blue-200/70"}`}>
                  {formatDate(msg.created_at)}
                  {msg.sender === "admin" && <span className="ml-1 font-semibold">· You</span>}
                </p>
              </div>
              {msg.sender === "admin" && (
                <div className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white">
                  <MessageCircle className="h-4 w-4" />
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="border-t border-slate-100 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Reply to this consumer..."
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/30"
          />
          <button
            onClick={send}
            disabled={!input.trim()}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">Reply</span>
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-400 text-center">
          Replies appear instantly in the consumer's chat.
        </p>
      </div>
    </>
  );
}