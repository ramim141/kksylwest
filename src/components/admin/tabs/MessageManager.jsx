import React, { useState, useEffect, useMemo } from "react";
import {
  HiEnvelope,
  HiTrash,
  HiPhone,
  HiEnvelopeOpen,
  HiMagnifyingGlass,
  HiInbox,
  HiArrowPath,
} from "react-icons/hi2";
import { FaWhatsapp, FaRobot } from "react-icons/fa";
import { Button, useConfirm } from "../ui";
import {
  getMessages,
  markMessageRead,
  deleteMessage,
} from "../../../services/firestore";

const formatMsgDate = (val) => {
  if (!val) return "সম্প্রতি";
  if (val.toDate) {
    try {
      return val.toDate().toLocaleString("bn-BD");
    } catch {
      return "সম্প্রতি";
    }
  }
  if (typeof val === "string" || val instanceof Date) {
    try {
      return new Date(val).toLocaleString("bn-BD");
    } catch {
      return "সম্প্রতি";
    }
  }
  return "সম্প্রতি";
};

const MessageManager = () => {
  const [messages, setMessages] = useState([]);
  const [confirm, confirmUI] = useConfirm();
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRead, setFilterRead] = useState("all");

  const loadMessagesList = async () => {
    try {
      setLoading(true);
      const data = await getMessages();
      setMessages(data || []);
      if (data && data.length > 0) {
        setSelectedMessage(data[0]);
      } else {
        setSelectedMessage(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessagesList();
  }, []);

  const handleSelectMessage = async (msg) => {
    setSelectedMessage(msg);
    if (!msg.isRead) {
      try {
        await markMessageRead(msg.id, true);
        setMessages((prev) =>
          prev.map((m) => (m.id === msg.id ? { ...m, isRead: true } : m))
        );
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleToggleRead = async (msg) => {
    try {
      const newStatus = !msg.isRead;
      await markMessageRead(msg.id, newStatus);
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, isRead: newStatus } : m))
      );
      if (selectedMessage?.id === msg.id) {
        setSelectedMessage((prev) => ({ ...prev, isRead: newStatus }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    const ok = await confirm({
        title: "বার্তাটি মুছে ফেলবেন?",
        body: "ইনবক্স থেকে এই বার্তাটি স্থায়ীভাবে মুছে যাবে। প্রেরকের যোগাযোগের তথ্যও আর পাওয়া যাবে না।",
        confirmLabel: "মুছে ফেলুন",
        tone: "danger",
      });
      if (!ok) return;
    try {
      await deleteMessage(id);
      const updated = messages.filter((m) => m.id !== id);
      setMessages(updated);
      if (selectedMessage?.id === id) {
        setSelectedMessage(updated[0] || null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredMessages = useMemo(() => {
    return messages.filter((msg) => {
      const matchSearch =
        searchTerm === "" ||
        msg.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.message?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchRead =
        filterRead === "all" ||
        (filterRead === "unread" ? !msg.isRead : msg.isRead);

      return matchSearch && matchRead;
    });
  }, [messages, searchTerm, filterRead]);

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex justify-end">
        <Button tone="neutral" icon={HiArrowPath} onClick={loadMessagesList} loading={loading}>
          রিফ্রেশ করুন
        </Button>
      </div>

      {/* Two-Pane Inbox Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start min-h-[560px]">
        {/* Left Pane: Message List (5 cols) */}
        <div className="lg:col-span-5 p-4 sm:p-5 bg-surface-card border border-line-soft rounded-lg flex flex-col space-y-4">
          {/* Search & Filter */}
          <div className="space-y-2">
            <div className="relative">
              <HiMagnifyingGlass className="absolute left-3 top-2.5 text-ink-muted text-[13px]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="মেসেজ বা নাম খুঁজুন..."
                className="w-full pl-8 pr-3 py-2 bg-surface-lowest border border-line-soft rounded text-ink-strong text-[13px] focus:outline-none focus:border-secondary/40"
              />
            </div>

            <div className="flex items-center gap-1.5 pt-1">
              {[
                { id: "all", label: "সকল বার্তা" },
                { id: "unread", label: "অপঠিত" },
                { id: "read", label: "পড়া হয়েছে" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilterRead(f.id)}
                  className={`px-3 py-1 rounded text-[13px] font-semibold transition cursor-pointer ${
                    filterRead === f.id
                      ? "bg-secondary-container text-ink-strong font-bold"
                      : "text-ink-muted hover:text-ink-strong hover:bg-surface-card"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* List items */}
          <div className="flex-1 space-y-2 overflow-y-auto pr-1 scrollbar-slim max-h-[460px]">
            {loading ? (
              <div className="p-8 text-center text-ink-muted text-[13px]">লোড হচ্ছে...</div>
            ) : filteredMessages.length === 0 ? (
              <div className="p-8 text-center text-ink-muted border border-dashed border-line-soft rounded-lg text-[13px]">
                কোনো মেসেজ পাওয়া যায়নি।
              </div>
            ) : (
              filteredMessages.map((msg) => {
                const isSelected = selectedMessage?.id === msg.id;
                return (
                  <div
                    key={msg.id}
                    onClick={() => handleSelectMessage(msg)}
                    className={`p-3.5 rounded-lg border transition cursor-pointer space-y-1 ${
                      isSelected
                        ? "bg-secondary-container/15 border-secondary/50"
                        : msg.isRead
                        ? "bg-surface-lowest/60 border-line-soft hover:border-line-soft"
                        : "bg-surface-card/80 border-secondary/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {!msg.isRead && (
                          <span className="w-2 h-2 rounded-full bg-secondary"></span>
                        )}
                        <h4 className="text-[13px] font-bold text-ink-strong truncate max-w-[140px]">
                          {msg.name}
                        </h4>
                      </div>
                      <span className="text-[12px] text-ink-muted">
                        {formatMsgDate(msg.createdAt)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {msg.source === "chatbot" ? (
                        <span className="px-1.5 py-0.5 rounded bg-tertiary-container/20 text-tertiary text-[9px] font-bold">
                          বট
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded bg-primary-container/20 text-primary-300 text-[9px] font-bold">
                          ফর্ম
                        </span>
                      )}
                      <p className="text-[13px] font-semibold text-secondary truncate">
                        {msg.subject || "সাধারণ বার্তা"}
                      </p>
                    </div>

                    <p className="text-[13px] text-ink-muted truncate">
                      {msg.message}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Message Viewer & Reply Tools (7 cols) */}
        <div className="lg:col-span-7 p-6 bg-surface-card border border-line-soft rounded-lg flex flex-col justify-between">
          {selectedMessage ? (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line-soft">
                <div>
                  <h3 className="text-base font-bold text-ink-strong">
                    {selectedMessage.subject || "সাধারণ বার্তা"}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[13px] font-semibold text-ink-body">
                      {selectedMessage.name}
                    </span>
                    <span className="text-[13px] text-ink-muted">
                      • {formatMsgDate(selectedMessage.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleRead(selectedMessage)}
                    className="p-2 hover:bg-surface-card text-ink-body hover:text-ink-strong rounded transition text-[13px] flex items-center gap-1 border border-line-soft"
                    title="পড়া/অপঠিত টগল করুন"
                  >
                    <HiEnvelopeOpen className="text-sm" />
                    <span className="hidden sm:inline">
                      {selectedMessage.isRead ? "অপঠিত মার্ক করুন" : "পড়া হয়েছে"}
                    </span>
                  </button>
                  <button
                    onClick={() => handleDelete(selectedMessage.id)}
                    className="w-10 h-10 inline-flex items-center justify-center shrink-0 bg-tertiary-container/10 hover:bg-tertiary-container/20 text-tertiary border border-tertiary/30 rounded transition text-[13px] cursor-pointer"
                    title="মুছে ফেলুন"
                  >
                    <HiTrash className="text-base" />
                  </button>
                </div>
              </div>

              {/* Sender Details Pills */}
              <div className="flex flex-wrap items-center gap-3 text-[13px]">
                {selectedMessage.source === "chatbot" ? (
                  <span className="px-3 py-1.5 rounded bg-tertiary-container/15 border border-tertiary/30 text-tertiary font-bold flex items-center gap-1.5">
                    <FaRobot /> চ্যাটবট বার্তা
                  </span>
                ) : (
                  <span className="px-3 py-1.5 rounded bg-primary-container/15 border border-primary/30 text-primary-300 font-bold flex items-center gap-1.5">
                    <HiEnvelope /> কন্টাক্ট ফর্ম বার্তা
                  </span>
                )}

                {selectedMessage.phone && (
                  <a
                    href={`tel:${selectedMessage.phone}`}
                    className="px-3 py-1.5 rounded bg-surface-card hover:bg-surface-overlay text-ink-body border border-line-soft transition flex items-center gap-1.5"
                  >
                    <HiPhone className="text-primary" />
                    <span>{selectedMessage.phone}</span>
                  </a>
                )}

                {selectedMessage.email && (
                  <a
                    href={`mailto:${selectedMessage.email}`}
                    className="px-3 py-1.5 rounded bg-surface-card hover:bg-surface-overlay text-ink-body border border-line-soft transition flex items-center gap-1.5 truncate max-w-[200px]"
                  >
                    <HiEnvelope className="text-tertiary" />
                    <span className="truncate">{selectedMessage.email}</span>
                  </a>
                )}
              </div>

              {/* Message Body Content */}
              <div className="p-5 bg-surface-lowest/70 border border-line-soft rounded-lg">
                <p className="text-[13px] sm:text-sm text-ink-body leading-relaxed whitespace-pre-wrap">
                  {selectedMessage.message}
                </p>
              </div>

              {/* Quick WhatsApp Reply Action */}
              {selectedMessage.phone && (
                <div className="p-4 rounded-lg bg-primary-container/10 border border-primary/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[13px] font-bold text-ink-strong block">
                      তাৎক্ষণিক WhatsApp এ উত্তর দিতে চান?
                    </span>
                    <span className="text-[13px] text-ink-muted block">
                      ক্লিক করলে সরাসরি প্রেরকের WhatsApp নাম্বারে চ্যাট ওপেন হবে।
                    </span>
                  </div>

                  <a
                    href={`https://wa.me/${selectedMessage.phone.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded bg-primary-container hover:bg-primary-container text-ink-strong font-bold text-[13px] flex items-center justify-center gap-2 transition whitespace-nowrap"
                  >
                    <FaWhatsapp className="text-base" />
                    <span>WhatsApp এ উত্তর দিন</span>
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center text-ink-muted space-y-2">
              <HiInbox className="text-5xl text-ink-muted mb-2" />
              <p className="text-sm font-semibold text-ink-muted">
                বাম পাশের তালিকা থেকে একটি বার্তা নির্বাচন করুন
              </p>
              <p className="text-[13px] text-ink-muted">
                যেকোনো মেসেজে ক্লিক করে পূর্ণাঙ্গ বিবরণ ও যোগাযোগের তথ্য দেখুন।
              </p>
            </div>
          )}
        </div>
      </div>

      {confirmUI}
    </div>
  );
};

export default MessageManager;
