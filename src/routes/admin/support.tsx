import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { MessageCircle, Send, Users, Clock, ChevronLeft } from "lucide-react";
import { useMock } from "@/contexts/MockContext";
import { formatDate } from "@/lib/mockData";

export const Route = createFileRoute("/admin/support")({
  component: AdminSupportPage,
});

function AdminSupportPage() {
  const { supportThreads, replySupportMessage } = useMock();
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [replyInput, setReplyInput] = useState("");

  const selectedThread = supportThreads.find((t) => t.id === selectedThreadId);

  const handleReply = () => {
    if (!selectedThreadId || !replyInput.trim()) return;
    replySupportMessage(selectedThreadId, replyInput.trim());
    setReplyInput("");
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link to="/admin/dashboard" className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-500 hover:bg-slate-50 transition-colors border border-slate-200">
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Support Inbox</h1>
          <p className="text-sm text-slate-500">Consumer support threads</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-4">
        {/* Thread list */}
        <section className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden">
          <div className="border-b border-slate-200 px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Users className="h-4 w-4 text-blue-600" />
              Threads
              <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
                {supportThreads.length}
              </span>
            </div>
          </div>

          <div className="divide-y divide-slate-100 max-h-[60vh] overflow-y-auto">
            {supportThreads.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <MessageCircle className="h-10 w-10 text-slate-200" />
                <p className="mt-2 text-sm text-slate-500">No support threads yet.</p>
              </div>
            ) : (
              supportThreads.map((thread) => {
                const isSelected = selectedThreadId === thread.id;
                const lastMsg = thread.messages[thread.messages.length - 1];
                return (
                  <button
                    key={thread.id}
                    type="button"
                    onClick={() => setSelectedThreadId(thread.id)}
                    className={`w-full px-4 py-3 text-left transition ${
                      isSelected ? "bg-blue-50 border-l-2 border-blue-500" : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-800 truncate">
                        {thread.consumer_name}
                      </p>
                      <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                        {thread.messages.length} msg{thread.messages.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    {lastMsg && (
                      <p className="mt-0.5 text-xs text-slate-500 truncate">
                        {lastMsg.sender === "admin" ? "You: " : ""}{lastMsg.text}
                      </p>
                    )}
                    <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-400">
                      <Clock className="h-3 w-3" />
                      {formatDate(thread.created_at)}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </section>

        {/* Chat panel */}
        <section className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 flex flex-col overflow-hidden">
          {!selectedThread ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <MessageCircle className="h-12 w-12 text-slate-200" />
              <p className="mt-3 text-slate-500">Select a thread to view the conversation.</p>
            </div>
          ) : (
            <>
              {/* Thread header */}
              <div className="border-b border-slate-200 px-5 py-3">
                <p className="text-sm font-semibold text-slate-800">{selectedThread.consumer_name}</p>
                <p className="text-xs text-slate-500">
                  {selectedThread.messages.length} message{selectedThread.messages.length !== 1 ? "s" : ""} ·
                  Started {formatDate(selectedThread.created_at)}
                </p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 min-h-0">
                {selectedThread.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${msg.sender === "admin" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                        msg.sender === "admin"
                          ? "bg-blue-600 text-white rounded-br-sm"
                          : "bg-slate-100 text-slate-800 rounded-bl-sm"
                      }`}
                    >
                      <p className="text-sm">{msg.text}</p>
                      <p className={`mt-1 text-[10px] ${msg.sender === "admin" ? "text-blue-200" : "text-slate-400"}`}>
                        {msg.sender === "admin" ? "Admin" : selectedThread.consumer_name} · {new Date(msg.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reply box */}
              <div className="border-t border-slate-200 p-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={replyInput}
                    onChange={(e) => setReplyInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleReply()}
                    placeholder="Type a reply..."
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-slate-400"
                  />
                  <button
                    onClick={handleReply}
                    disabled={!replyInput.trim()}
                    className="flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
