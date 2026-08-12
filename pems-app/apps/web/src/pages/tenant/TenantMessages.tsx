import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Send } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import TenantLayout from "../../layouts/tenant/TenantLayout";
import { useAuth } from "../../context/AuthContext";
import {
  createConversation,
  createMessage,
  getConversationsByTenant,
  getMessagesByConversation,
} from "../../../../../packages/firebase";
import type { Conversation, Message } from "../../../../../packages/models";
import { useTenantPortal } from "../tenants/hooks/useTenantPortal";

export default function TenantMessages() {
  const { firebaseUser, userProfile } = useAuth();
  const { tenant } = useTenantPortal(firebaseUser?.uid);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [subject, setSubject] = useState("");
  const [draft, setDraft] = useState("");
  const [notice, setNotice] = useState("");

  async function loadConversations() {
    if (!tenant) return;

    const conversationRecords = await getConversationsByTenant(tenant.id);
    setConversations(conversationRecords);
    setSelectedConversationId(
      (currentId) => currentId || conversationRecords[0]?.id || ""
    );
  }

  useEffect(() => {
    loadConversations();
  }, [tenant]);

  const selectedConversation = useMemo(
    () =>
      conversations.find(
        (conversation) => conversation.id === selectedConversationId
      ),
    [conversations, selectedConversationId]
  );

  useEffect(() => {
    async function loadMessages() {
      if (!selectedConversationId) {
        setMessages([]);
        return;
      }

      const messageRecords = await getMessagesByConversation(selectedConversationId);
      setMessages(messageRecords);
    }

    loadMessages();
  }, [selectedConversationId]);

  async function handleStartConversation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!firebaseUser || !userProfile || !tenant || !subject.trim() || !draft.trim()) {
      setNotice("Enter a subject and message.");
      return;
    }

    const conversationId = await createConversation({
      ownerId: tenant.ownerId,
      tenantId: tenant.id,
      subject: subject.trim(),
      firstMessage: draft.trim(),
      senderId: firebaseUser.uid,
      recipientId: tenant.ownerId,
      participants: [
        {
          userId: tenant.ownerId,
          role: "landlord",
          displayName: "Landlord",
        },
        {
          userId: firebaseUser.uid,
          role: "tenant",
          displayName: userProfile.fullName || tenant.fullName,
        },
      ],
    });

    setSubject("");
    setDraft("");
    setNotice("Conversation started.");
    await loadConversations();
    setSelectedConversationId(conversationId);
  }

  async function handleSendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!firebaseUser || !tenant || !selectedConversation || !draft.trim()) return;

    await createMessage({
      conversationId: selectedConversation.id,
      senderId: firebaseUser.uid,
      recipientId: tenant.ownerId,
      body: draft.trim(),
    });

    setDraft("");
    const messageRecords = await getMessagesByConversation(selectedConversation.id);
    setMessages(messageRecords);
    await loadConversations();
  }

  const formHandler = selectedConversation
    ? handleSendMessage
    : handleStartConversation;

  return (
    <TenantLayout>
      <PageHeader
        title="Messages"
        subtitle="Exchange secure in-app messages with your landlord."
      />

      <section className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.4fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950">Conversations</h2>
          <div className="mt-5 space-y-3">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => setSelectedConversationId(conversation.id)}
                className={`block w-full rounded-lg border border-slate-200 p-4 text-left transition hover:border-blue-200 hover:bg-blue-50 ${
                  selectedConversationId === conversation.id ? "bg-blue-50" : ""
                }`}
              >
                <p className="font-bold text-slate-950">{conversation.subject}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {conversation.lastMessagePreview || "Open conversation with landlord"}
                </p>
              </button>
            ))}

            {conversations.length === 0 && (
              <p className="text-sm text-slate-500">
                No conversations yet. Start one from the message panel.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5">
            <h2 className="text-lg font-bold text-slate-950">
              {selectedConversation?.subject || "New Conversation"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Direct exchange with your landlord.
            </p>
          </div>

          <div className="min-h-80 space-y-4 p-5">
            {messages.map((message) => {
              const isTenant = message.senderId === firebaseUser?.uid;

              return (
                <article
                  key={message.id}
                  className={`flex flex-col ${isTenant ? "items-end" : "items-start"}`}
                >
                  <p className="mb-1 text-xs font-bold text-slate-500">
                    {isTenant ? "You" : "Landlord"}
                  </p>
                  <div
                    className={`max-w-xl rounded-lg px-4 py-3 text-sm ${
                      isTenant
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-900"
                    }`}
                  >
                    {message.body}
                  </div>
                </article>
              );
            })}
          </div>

          <form onSubmit={formHandler} className="border-t border-slate-100 p-5">
            {notice && (
              <p className="mb-3 rounded-lg bg-blue-50 p-3 text-sm font-semibold text-blue-700">
                {notice}
              </p>
            )}

            {!selectedConversation && (
              <input
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                className="mb-3 w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
                placeholder="Subject"
              />
            )}

            <label className="text-sm font-bold text-slate-700" htmlFor="tenant-message">
              Message
            </label>
            <div className="mt-2 flex flex-col gap-3 md:flex-row">
              <input
                id="tenant-message"
                className="min-h-12 flex-1 rounded-lg border border-slate-200 px-4 outline-none focus:border-blue-600"
                placeholder="Type a message to your landlord"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
              />
              <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700">
                <Send size={18} />
                Send
              </button>
            </div>
          </form>
        </div>
      </section>
    </TenantLayout>
  );
}
