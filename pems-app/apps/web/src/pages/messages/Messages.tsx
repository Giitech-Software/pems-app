import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Send } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import {
  createConversation,
  createMessage,
  getConversationsByOwner,
  getMessagesByConversation,
  getTenantsByOwner,
  getFriendlyDataError,
} from "../../../../../packages/firebase";
import {
  getTenantDisplayId,
  type Conversation,
  type Message,
  type Tenant,
} from "../../../../../packages/models";

export default function Messages() {
  const { firebaseUser, userProfile } = useAuth();
  const canManage = userProfile?.role === "landlord";
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [newTenantId, setNewTenantId] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [notice, setNotice] = useState("");

  async function loadInbox() {
    if (!firebaseUser) return;

    const [conversationRecords, tenantRecords] = await Promise.all([
      getConversationsByOwner(firebaseUser.uid),
      getTenantsByOwner(firebaseUser.uid),
    ]);

    setConversations(conversationRecords);
    setTenants(tenantRecords);
    setSelectedConversationId(
      (currentId) => currentId || conversationRecords[0]?.id || ""
    );
    setNewTenantId((currentId) => currentId || tenantRecords[0]?.id || "");
  }

  useEffect(() => {
    loadInbox();
  }, [firebaseUser]);

  const selectedConversation = useMemo(
    () =>
      conversations.find(
        (conversation) => conversation.id === selectedConversationId
      ),
    [conversations, selectedConversationId]
  );

  const selectedTenant = useMemo(
    () => tenants.find((tenant) => tenant.id === selectedConversation?.tenantId),
    [selectedConversation, tenants]
  );

  useEffect(() => {
    async function loadThread() {
      if (!selectedConversationId) {
        setMessages([]);
        return;
      }

      const messageRecords = await getMessagesByConversation(selectedConversationId);
      setMessages(messageRecords);
    }

    loadThread();
  }, [selectedConversationId]);

  async function handleCreateConversation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!firebaseUser || !userProfile) return;

    const tenant = tenants.find((item) => item.id === newTenantId);

    if (!tenant || !newSubject.trim() || !newMessage.trim()) {
      setNotice("Select a tenant and enter the subject and message.");
      return;
    }

    try {
    const conversationId = await createConversation({
      ownerId: firebaseUser.uid,
      tenantId: tenant.id,
      subject: newSubject.trim(),
      firstMessage: newMessage.trim(),
      senderId: firebaseUser.uid,
      recipientId: tenant.userId || tenant.id,
      participants: [
        {
          userId: firebaseUser.uid,
          role: "landlord",
          displayName: userProfile.fullName || "Landlord",
        },
        {
          userId: tenant.userId || tenant.id,
          role: "tenant",
          displayName: tenant.fullName,
        },
      ],
    });

    setNewSubject("");
    setNewMessage("");
    setNotice("Conversation created.");
    await loadInbox();
    setSelectedConversationId(conversationId);
    } catch (error) {
      setNotice(getFriendlyDataError(error, "Could not create this conversation."));
    }
  }

  async function handleSendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!firebaseUser || !selectedConversation || !draft.trim()) return;

    try {
    await createMessage({
      conversationId: selectedConversation.id,
      senderId: firebaseUser.uid,
      recipientId: selectedTenant?.userId || selectedTenant?.id || selectedConversation.tenantId,
      body: draft.trim(),
    });

    setDraft("");
    const messageRecords = await getMessagesByConversation(selectedConversation.id);
    setMessages(messageRecords);
    await loadInbox();
    } catch (error) {
      setNotice(getFriendlyDataError(error, "Could not send this message."));
    }
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Messages"
        subtitle="Exchange in-app messages with tenants and keep rent conversations attached to the tenant record."
      />

      <section className="mt-6 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-6">
          {canManage && <form
            onSubmit={handleCreateConversation}
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
          >
            <h2 className="text-lg font-bold text-slate-950">New Message</h2>
            {notice && (
              <p className="mt-3 rounded-lg bg-blue-50 p-3 text-sm font-semibold text-blue-700">
                {notice}
              </p>
            )}
            <div className="mt-4 space-y-3">
              <select
                value={newTenantId}
                onChange={(event) => setNewTenantId(event.target.value)}
                className="w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
              >
                {tenants.map((tenant) => (
                  <option key={tenant.id} value={tenant.id}>
                    {getTenantDisplayId(tenant)} - {tenant.fullName}
                  </option>
                ))}
              </select>
              <input
                value={newSubject}
                onChange={(event) => setNewSubject(event.target.value)}
                className="w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
                placeholder="Subject"
              />
              <textarea
                value={newMessage}
                onChange={(event) => setNewMessage(event.target.value)}
                className="min-h-28 w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
                placeholder="Message"
              />
              <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700">
                Start Conversation
              </button>
            </div>
          </form>}

          <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-5">
              <h2 className="text-lg font-bold text-slate-950">Tenant Inbox</h2>
            </div>

            <div className="divide-y divide-slate-100">
              {conversations.map((conversation) => {
                const tenant = tenants.find(
                  (item) => item.id === conversation.tenantId
                );

                return (
                  <button
                    key={conversation.id}
                    onClick={() => setSelectedConversationId(conversation.id)}
                    className={`block w-full p-5 text-left transition hover:bg-slate-50 ${
                      selectedConversationId === conversation.id ? "bg-blue-50" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-bold text-slate-950">
                          {tenant
                            ? `${getTenantDisplayId(tenant)} - ${tenant.fullName}`
                            : "Tenant"}
                        </p>
                        <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-amber-600">
                          {conversation.subject}
                        </p>
                      </div>
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                        {conversation.status}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-slate-500">
                      {conversation.lastMessagePreview || "No messages yet."}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5">
            <h2 className="text-lg font-bold text-slate-950">
              {selectedConversation?.subject || "Select a conversation"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {selectedTenant
                ? `${getTenantDisplayId(selectedTenant)} - ${selectedTenant.fullName}`
                : "No tenant selected"}
            </p>
          </div>

          <div className="min-h-80 space-y-4 p-5">
            {messages.map((message) => {
              const isLandlord = message.senderId === firebaseUser?.uid;

              return (
                <article
                  key={message.id}
                  className={`flex flex-col ${isLandlord ? "items-end" : "items-start"}`}
                >
                  <p className="mb-1 text-xs font-bold text-slate-500">
                    {isLandlord
                      ? "Landlord"
                      : selectedTenant
                        ? `${getTenantDisplayId(selectedTenant)} - ${selectedTenant.fullName}`
                        : "Tenant"}
                  </p>
                  <div
                    className={`max-w-xl rounded-lg px-4 py-3 text-sm ${
                      isLandlord
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-900"
                    }`}
                  >
                    {message.body}
                  </div>
                </article>
              );
            })}

            {messages.length === 0 && (
              <p className="text-sm text-slate-500">
                No messages in this conversation yet.
              </p>
            )}
          </div>

          {canManage && <form onSubmit={handleSendMessage} className="border-t border-slate-100 p-5">
            <label className="text-sm font-bold text-slate-700" htmlFor="landlord-message">
              Reply
            </label>
            <div className="mt-2 flex flex-col gap-3 md:flex-row">
              <input
                id="landlord-message"
                className="min-h-12 flex-1 rounded-lg border border-slate-200 px-4 outline-none focus:border-blue-600"
                placeholder="Type a message to the tenant"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                disabled={!selectedConversation}
              />
              <button
                disabled={!selectedConversation}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60"
              >
                <Send size={18} />
                Send
              </button>
            </div>
          </form>}
        </div>
      </section>
    </DashboardLayout>
  );
}
