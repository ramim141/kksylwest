import React, { useState, useEffect, useMemo } from "react";
import {
  HiEnvelope,
  HiTrash,
  HiPhone,
  HiEnvelopeOpen,
  HiMagnifyingGlass,
  HiInbox,
  HiArrowPath,
  HiCheckCircle,
  HiXMark,
  HiClock,
  HiUser,
  HiSparkles,
} from "react-icons/hi2";
import { FaWhatsapp, FaRobot } from "react-icons/fa";
import { Button, IconButton, Chip, Panel, PanelHeader, useConfirm, EmptyState, LoadingState } from "../ui";
import {
  getMessages,
  markMessageRead,
  deleteMessage,
} from "../../../services/firestore";

const toBengaliDigits = (num) => {
  if (num === null || num === undefined) return "০";
  const enToBn = {
    "0": "০", "1": "১", "2": "২", "3": "৩", "4": "৪",
    "5": "৫", "6": "৬", "7": "৭", "8": "৮", "9": "৯"
  };
  return num.toString().replace(/[0-9]/g, (d) => enToBn[d] || d);
};

const formatMsgDate = (val) => {
  if (!val) return "সম্প্রতি";
  try {
    let d;
    if (val.toDate) d = val.toDate();
    else if (typeof val === "string" || val instanceof Date) d = new Date(val);
    else return "সম্প্রতি";

    const dateStr = d.toLocaleDateString("bn-BD", { day: "numeric", month: "short", year: "numeric" });
    const timeStr = d.toLocaleTimeString("bn-BD", { hour: "numeric", minute: "2-digit", hour12: true });
    return `${dateStr}, ${timeStr}`;
  } catch {
    return "সম্প্রতি";
  }
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
      const list = data || [];
      setMessages(list);
      if (list.length > 0) {
        setSelectedMessage((prev) => (prev ? list.find((m) => m.id === prev.id) || list[0] : list[0]));
      } else {
        setSelectedMessage(null);
      }
    } catch (err) {
      console.error("Failed to load messages:", err);
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
      body: "ইনবক্স থেকে এই বার্তাটি স্থায়ীভাবে মুছে যাবে। প্রেরকের যোগাযোগের তথ্য আর পাওয়া যাবে না।",
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
        (filterRead === "unread" && !msg.isRead) ||
        (filterRead === "read" && msg.isRead) ||
        (filterRead === "chatbot" && msg.source === "chatbot") ||
        (filterRead === "form" && msg.source !== "chatbot");

      return matchSearch && matchRead;
    });
  }, [messages, searchTerm, filterRead]);

  // Statistics calculation
  const totalCount = messages.length;
  const unreadCount = messages.filter((m) => !m.isRead).length;
  const chatbotCount = messages.filter((m) => m.source === "chatbot").length;
  const formCount = totalCount - chatbotCount;

  return (
    <div className="space-y-6 text-ink-body font-sans animate-fade-in">
      {/* ========================================================
          1. HEADER & METRICS SUMMARY
          ======================================================== */}
      <div className="p-5 sm:p-7 rounded-2xl bg-surface-card/90 backdrop-blur-md border border-line-soft/80 shadow-md relative overflow-hidden">
        {/* Luminous top gradient accent */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary via-tertiary to-secondary opacity-80" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/[0.05] rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-line-soft/70">
          <div className="space-y-1.5 min-w-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 border border-primary/30 text-primary text-xs font-bold shadow-sm">
              <HiEnvelope className="text-sm" />
              <span>যোগাযোগ ও মেসেজ ইনবক্স হাব</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-ink-strong tracking-tight flex items-center gap-2">
              মেসেজ ও অভিযোগ ব্যবস্থাপনা
            </h2>
            <p className="text-xs sm:text-sm text-ink-muted leading-relaxed max-w-2xl font-normal">
              ওয়েবসাইট কন্টাক্ট ফর্ম এবং এআই চ্যাটবটের মাধ্যমে আসা সকল বার্তা ও অনুসন্ধানের রিয়েল-টাইম ইনবক্স।
            </p>
          </div>

          {/* Quick Action Refresh */}
          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              tone="neutral"
              size="md"
              icon={HiArrowPath}
              onClick={loadMessagesList}
              loading={loading}
            >
              ইনবক্স রিফ্রেশ
            </Button>
          </div>
        </div>

        {/* 4 Stat Summary Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-5 relative z-10">
          <div className="p-4 rounded-xl bg-surface-low/80 border border-line-soft/80 shadow-sm flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 text-primary flex items-center justify-center text-xl shrink-0 shadow-sm">
              <HiInbox />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider block">মোট বার্তা</span>
              <strong className="text-base sm:text-lg font-bold text-ink-strong font-bangla-number">{toBengaliDigits(totalCount)}টি</strong>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-surface-low/80 border border-line-soft/80 shadow-sm flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-secondary/15 border border-secondary/30 text-secondary flex items-center justify-center text-xl shrink-0 shadow-sm">
              <HiSparkles />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider block">অপঠিত বার্তা</span>
              <strong className="text-base sm:text-lg font-bold text-secondary font-bangla-number">{toBengaliDigits(unreadCount)}টি</strong>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-surface-low/80 border border-line-soft/80 shadow-sm flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-tertiary/15 border border-tertiary/30 text-tertiary flex items-center justify-center text-xl shrink-0 shadow-sm">
              <HiEnvelope />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider block">কন্টাক্ট ফর্ম</span>
              <strong className="text-base sm:text-lg font-bold text-tertiary font-bangla-number">{toBengaliDigits(formCount)}টি</strong>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-surface-low/80 border border-line-soft/80 shadow-sm flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/35 text-primary flex items-center justify-center text-xl shrink-0 shadow-sm">
              <FaRobot />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider block">এআই চ্যাটবট</span>
              <strong className="text-base sm:text-lg font-bold text-primary font-bangla-number">{toBengaliDigits(chatbotCount)}টি</strong>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          2. TWO-PANE INBOX WORKSPACE
          ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* ----------------------------------------------------
            LEFT PANE: MESSAGE LIST & FILTERS (5 Cols)
            ---------------------------------------------------- */}
        <div className="lg:col-span-5 space-y-4">
          <Panel>
            <PanelHeader
              icon={HiInbox}
              title="ইনবক্স তালিকা"
              hint={`${toBengaliDigits(filteredMessages.length)}টি বার্তা প্রদর্শিত`}
              actions={
                unreadCount > 0 && (
                  <span className="text-[11px] font-bold text-secondary bg-secondary/15 px-2.5 py-0.5 rounded-full border border-secondary/30 font-bangla-number">
                    {toBengaliDigits(unreadCount)}টি নতুন
                  </span>
                )
              }
            />

            {/* Search Bar */}
            <div className="relative mb-3">
              <HiMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted text-sm" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="প্রেরকের নাম, বিষয় বা মোবাইল দিয়ে খুঁজুন..."
                className="w-full min-h-[42px] pl-9 pr-8 bg-surface-low border border-line-soft/80 rounded-xl text-ink-strong text-xs font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25 transition-all placeholder:text-ink-muted/60"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink-strong cursor-pointer"
                >
                  <HiXMark className="text-sm" />
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-1.5 pb-2 border-b border-line-soft/70">
              {[
                { id: "all", label: "সকল বার্তা", count: totalCount },
                { id: "unread", label: "অপঠিত", count: unreadCount },
                { id: "read", label: "পঠিত", count: totalCount - unreadCount },
                { id: "chatbot", label: "বট বার্তা", count: chatbotCount },
              ].map((f) => {
                const active = filterRead === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setFilterRead(f.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer select-none ${
                      active
                        ? "bg-primary text-primary-on shadow-sm"
                        : "bg-surface-low text-ink-muted hover:text-ink-strong hover:bg-surface-overlay border border-line-soft/60"
                    }`}
                  >
                    <span>{f.label}</span>
                    <span className={`text-[10.5px] font-mono px-1.5 py-0.2 rounded-full font-bangla-number ${
                      active ? "bg-black/20 text-white" : "bg-surface-overlay text-ink-muted"
                    }`}>
                      {toBengaliDigits(f.count)}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Message Item List */}
            <div className="space-y-2 overflow-y-auto max-h-[580px] pr-1 pt-1 scrollbar-slim">
              {loading ? (
                <LoadingState message="বার্তা লোড হচ্ছে..." />
              ) : filteredMessages.length === 0 ? (
                <EmptyState
                  icon={HiInbox}
                  title="কোনো বার্তা পাওয়া যায়নি"
                  description="আপনার নির্বাচিত ফিল্টার বা সার্চ কোয়েরির সাথে মেলানো কোনো বার্তা নেই।"
                  action={
                    searchTerm || filterRead !== "all" ? (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchTerm("");
                          setFilterRead("all");
                        }}
                        className="text-primary hover:underline text-xs font-bold cursor-pointer"
                      >
                        ফিল্টার রিসেট করুন
                      </button>
                    ) : null
                  }
                />
              ) : (
                filteredMessages.map((msg) => {
                  const isSelected = selectedMessage?.id === msg.id;
                  const isUnread = !msg.isRead;
                  const isBot = msg.source === "chatbot";

                  return (
                    <div
                      key={msg.id}
                      onClick={() => handleSelectMessage(msg)}
                      className={`p-3.5 rounded-xl border transition-all duration-200 cursor-pointer select-none space-y-2 relative ${
                        isSelected
                          ? "bg-primary/15 border-primary/60 shadow-md ring-1 ring-primary/20"
                          : isUnread
                          ? "bg-surface-card border-secondary/40 shadow-sm hover:border-secondary/60 hover:bg-surface-overlay/50"
                          : "bg-surface-low/80 border-line-soft/70 hover:border-line-strong hover:bg-surface-overlay/30"
                      }`}
                    >
                      {/* Unread indicator glow line */}
                      {isUnread && (
                        <div className="absolute left-0 top-3 bottom-3 w-1 bg-secondary rounded-r-full" />
                      )}

                      {/* Header: Name + Time */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          {/* Avatar initial */}
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                            isBot
                              ? "bg-tertiary/15 text-tertiary border border-tertiary/30"
                              : isUnread
                              ? "bg-secondary/20 text-secondary border border-secondary/30"
                              : "bg-surface-overlay text-ink-muted border border-line-soft"
                          }`}>
                            {isBot ? <FaRobot className="text-xs" /> : (msg.name?.charAt(0) || "U")}
                          </div>

                          <h4 className="text-xs sm:text-[13px] font-bold text-ink-strong truncate">
                            {msg.name || "নামবিহীন প্রেরক"}
                          </h4>
                        </div>

                        <span className="text-[11px] text-ink-muted font-mono shrink-0 font-bangla-number">
                          {formatMsgDate(msg.createdAt)}
                        </span>
                      </div>

                      {/* Subject + Source Pill */}
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                          isBot 
                            ? "bg-tertiary/15 text-tertiary border border-tertiary/30" 
                            : "bg-primary/15 text-primary border border-primary/30"
                        }`}>
                          {isBot ? "বট" : "ফর্ম"}
                        </span>
                        <p className={`text-xs font-bold truncate ${
                          isSelected ? "text-primary" : isUnread ? "text-secondary" : "text-ink-strong"
                        }`}>
                          {msg.subject || "সাধারণ বার্তা"}
                        </p>
                      </div>

                      {/* Message Snippet */}
                      <p className="text-[11.5px] text-ink-muted line-clamp-2 leading-relaxed">
                        {msg.message}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </Panel>
        </div>

        {/* ----------------------------------------------------
            RIGHT PANE: MESSAGE VIEWER & DIRECT ACTIONS (7 Cols)
            ---------------------------------------------------- */}
        <div className="lg:col-span-7 space-y-4">
          <Panel>
            {selectedMessage ? (
              <div className="space-y-6">
                {/* Header: Subject + Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-line-soft/80">
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                        selectedMessage.source === "chatbot"
                          ? "bg-tertiary/15 text-tertiary border-tertiary/30"
                          : "bg-primary/15 text-primary border-primary/30"
                      }`}>
                        {selectedMessage.source === "chatbot" ? "🤖 এআই চ্যাটবট বার্তা" : "📩 কন্টাক্ট ফর্ম বার্তা"}
                      </span>
                      <span className="text-xs text-ink-muted font-medium flex items-center gap-1 font-bangla-number">
                        <HiClock className="text-sm" />
                        {formatMsgDate(selectedMessage.createdAt)}
                      </span>
                    </div>

                    <h3 className="text-lg sm:text-xl font-bold text-ink-strong tracking-tight">
                      {selectedMessage.subject || "সাধারণ বার্তা"}
                    </h3>
                  </div>

                  {/* Header Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      type="button"
                      tone="neutral"
                      size="sm"
                      icon={HiEnvelopeOpen}
                      onClick={() => handleToggleRead(selectedMessage)}
                      title="পঠিত বা অপঠিত হিসেবে চিহ্নিত করুন"
                    >
                      {selectedMessage.isRead ? "অপঠিত মার্ক করুন" : "পড়া হয়েছে"}
                    </Button>

                    <IconButton
                      icon={HiTrash}
                      label="বার্তা মুছে ফেলুন"
                      tone="danger"
                      size="sm"
                      onClick={() => handleDelete(selectedMessage.id)}
                    />
                  </div>
                </div>

                {/* Sender Identity Card */}
                <div className="p-4 rounded-xl bg-surface-low border border-line-soft/80 space-y-3 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 text-primary flex items-center justify-center text-lg font-bold shrink-0">
                      {selectedMessage.source === "chatbot" ? <FaRobot /> : <HiUser />}
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-ink-strong">
                        {selectedMessage.name || "নাম দেওয়া হয়নি"}
                      </h4>
                      <p className="text-xs text-ink-muted">
                        ইনবক্স ট্র্যাকিং আইডি: <span className="font-mono text-ink-strong">{selectedMessage.id?.slice(0, 8)}</span>
                      </p>
                    </div>
                  </div>

                  {/* Contact Badges Row */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-line-soft/60">
                    {selectedMessage.phone ? (
                      <a
                        href={`tel:${selectedMessage.phone}`}
                        className="px-3 py-1.5 rounded-lg bg-surface-card hover:bg-surface-overlay text-ink-strong border border-line-soft/80 text-xs font-medium transition flex items-center gap-2"
                      >
                        <HiPhone className="text-primary text-sm" />
                        <span className="font-mono font-bold">{selectedMessage.phone}</span>
                      </a>
                    ) : (
                      <span className="px-3 py-1.5 rounded-lg bg-surface-card text-ink-muted border border-line-soft/60 text-xs">
                        ফোন নম্বর নেই
                      </span>
                    )}

                    {selectedMessage.email ? (
                      <a
                        href={`mailto:${selectedMessage.email}`}
                        className="px-3 py-1.5 rounded-lg bg-surface-card hover:bg-surface-overlay text-ink-strong border border-line-soft/80 text-xs font-medium transition flex items-center gap-2 truncate max-w-[260px]"
                      >
                        <HiEnvelope className="text-tertiary text-sm shrink-0" />
                        <span className="truncate">{selectedMessage.email}</span>
                      </a>
                    ) : (
                      <span className="px-3 py-1.5 rounded-lg bg-surface-card text-ink-muted border border-line-soft/60 text-xs">
                        ইমেইল নেই
                      </span>
                    )}
                  </div>
                </div>

                {/* Message Body Content Box */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider">
                    বার্তার মূল বিষয়বস্তু:
                  </label>
                  <div className="p-5 rounded-2xl bg-surface-low/90 border border-line-soft/90 shadow-inner">
                    <p className="text-xs sm:text-sm text-ink-strong leading-relaxed whitespace-pre-wrap font-normal">
                      {selectedMessage.message}
                    </p>
                  </div>
                </div>

                {/* Quick WhatsApp Reply CTA Box */}
                {selectedMessage.phone && (
                  <div className="p-4.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-primary/10 to-teal-500/10 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                    <div className="space-y-0.5">
                      <h5 className="text-xs sm:text-sm font-bold text-ink-strong flex items-center gap-2">
                        <FaWhatsapp className="text-primary text-base" />
                        <span>তাৎক্ষণিক WhatsApp এ উত্তর দিন</span>
                      </h5>
                      <p className="text-xs text-ink-muted">
                        ক্লিক করলে প্রেরকের নম্বরে সরাসরি WhatsApp চ্যাট ওপেন হবে।
                      </p>
                    </div>

                    <a
                      href={`https://wa.me/${selectedMessage.phone.replace(/[^0-9]/g, "").startsWith("0") ? "880" + selectedMessage.phone.replace(/[^0-9]/g, "").slice(1) : selectedMessage.phone.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-primary to-emerald-600 hover:brightness-110 text-primary-on font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
                    >
                      <FaWhatsapp className="text-base" />
                      <span>WhatsApp চ্যাট খুলুন ↗</span>
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-20 text-center space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center text-3xl mx-auto shadow-sm">
                  <HiInbox />
                </div>
                <h4 className="text-base font-bold text-ink-strong">
                  বাম পাশের তালিকা থেকে একটি বার্তা নির্বাচন করুন
                </h4>
                <p className="text-xs text-ink-muted max-w-sm mx-auto">
                  যেকোনো মেসেজে ক্লিক করে প্রেরকের সম্পূর্ণ বার্তা ও যোগাযোগের তথ্য দেখুন।
                </p>
              </div>
            )}
          </Panel>
        </div>

      </div>

      {confirmUI}
    </div>
  );
};

export default MessageManager;
