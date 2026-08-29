import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Chip,
  EmptyState,
  Field,
  IconButton,
  Input,
  LoadingState,
  Modal,
  Panel,
  SearchInput,
  StatCard,
  Textarea,
  Toast,
  Toolbar,
  useConfirm,
} from "../ui";
import {
  HiAcademicCap,
  HiArrowDown,
  HiArrowUp,
  HiBookOpen,
  HiCheckCircle,
  HiChevronDown,
  HiClock,
  HiDocumentText,
  HiExclamationTriangle,
  HiPencilSquare,
  HiPlus,
  HiSquares2X2,
  HiTrash,
} from "react-icons/hi2";
import {
  getSyllabus,
  addSyllabus,
  updateSyllabus,
  deleteSyllabus,
} from "../../../services/firestore";

/* ============================================================
   SYLLABUS MANAGER

   Rebuilt around what this screen is actually for. The old layout
   put a permanent narrow form beside a list that is empty most of
   the time, then hid the subject builder — the one part that needs
   room — inside its own 360px scroller, nested in a sticky column,
   nested in the page. Three scrollbars to add one subject.

   Now: the page is the list, full width. Creating and editing
   happen in a dialog that scrolls exactly once, and the subject
   builder gets the whole width. The marks tally is live, because
   "do these four subjects add up to 100?" is the question this
   form exists to answer and it used to be the admin's job to
   check by hand.
   ============================================================ */

const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

/** 25 -> "২৫" */
const toBn = (value) =>
  String(value ?? "").replace(/[0-9]/g, (d) => BN_DIGITS[Number(d)]);

/** The reverse: "২৫" -> "25". Anything that is not a Bengali digit is left
    as it is, so mixed input ("৮ম শ্রেণি") survives intact. Looks the digit
    up in the table above rather than matching a character range, which
    keeps the logic readable and free of escape-sequence guesswork. */
const toEn = (value) =>
  String(value ?? "")
    .split("")
    .map((ch) => {
      const i = BN_DIGITS.indexOf(ch);
      return i === -1 ? ch : String(i);
    })
    .join("");

/** Reads a marks field written in either numeral system. */
const parseMarks = (value) => {
  const n = parseInt(toEn(value).replace(/[^0-9]/g, ""), 10);
  return Number.isFinite(n) ? n : 0;
};

const countTopics = (topicsText) =>
  (topicsText || "")
    .split("\n")
    .map((t) => t.trim())
    .filter(Boolean).length;

const DEFAULT_SUBJECTS_TEMPLATE = [
  {
    name: "বাংলা",
    marks: "২৫",
    topicsText:
      "পদ্য ও গদ্য এর নির্ধারিত অধ্যায়সমূহ\nব্যাকরণঃ বাক্যের অংশ, শ্রেণিবিভাগ, বাগধারা ও কারক-সমাস",
  },
  {
    name: "English",
    marks: "২৫",
    topicsText:
      "Textbook selected Units\nGrammar: Tag Question, Narration, Sentence Connectors, Right Form of Verbs",
  },
  {
    name: "গণিত",
    marks: "২৫",
    topicsText:
      "১. বীজগণিতীয় রাশি ও বাস্তব সংখ্যা\n২. জ্যামিতি ও ক্ষেত্রফল\n৩. পরিসংখ্যান ও অনুপাত",
  },
  {
    name: "সাধারণ জ্ঞান ও অন্বেষণ",
    marks: "২৫",
    topicsText:
      "সমসাময়িক বিষয়াবলি, জাতীয় ও আন্তর্জাতিক এবং মাসিক কিশোরকণ্ঠ ও বিশেষ সংখ্যা 'অন্বেষণ'।",
  },
];

const emptyForm = (orderIndex) => ({
  className: "",
  subTitle: "স্কুল ও মাদ্রাসা উভয় মাধ্যম",
  color: "emerald",
  totalMarks: "১০০",
  duration: "২ ঘণ্টা",
  orderIndex: String(orderIndex),
  subjects: DEFAULT_SUBJECTS_TEMPLATE.map((s) => ({ ...s })),
});

/* ---------------------------------------------------------- MARKS TALLY */
/**
 * The form's whole reason for existing: subject marks must add up to the
 * paper total. Shown as a bar so a mismatch is visible at a glance, with
 * a one-click fix rather than an error the admin has to resolve by hand.
 */
const MarksTally = ({ total, sum, onUseSum }) => {
  const matched = total === sum;
  const over = sum > total;
  const pct = total > 0 ? Math.min((sum / total) * 100, 100) : 0;

  const tone = matched
    ? { bar: "bg-primary", text: "text-primary", ring: "border-primary/30 bg-primary/8" }
    : over
      ? { bar: "bg-error", text: "text-error", ring: "border-error/35 bg-error/8" }
      : { bar: "bg-secondary", text: "text-secondary", ring: "border-secondary/35 bg-secondary/8" };

  return (
    <div className={`rounded border p-3.5 space-y-2.5 ${tone.ring}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-2 text-[13px] font-semibold text-ink-body">
          {matched ? (
            <HiCheckCircle className={`text-base ${tone.text}`} />
          ) : (
            <HiExclamationTriangle className={`text-base ${tone.text}`} />
          )}
          বিষয়ের যোগফল
          <span className={`font-mono font-bold ${tone.text}`}>{toBn(sum)}</span>
          <span className="text-ink-muted">/ পূর্ণমান</span>
          <span className="font-mono font-bold text-ink-strong">{toBn(total)}</span>
        </span>

        {!matched && (
          <Button type="button" tone="outline" size="sm" onClick={onUseSum}>
            পূর্ণমান {toBn(sum)} করুন
          </Button>
        )}
      </div>

      <div className="h-1.5 w-full rounded-full bg-surface-overlay/70 overflow-hidden">
        <div
          className={`h-full rounded-full transition-[width] duration-300 ease-standard ${tone.bar}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {!matched && (
        <p className="text-[13px] text-ink-muted leading-snug">
          {over
            ? `বিষয়গুলোর যোগফল পূর্ণমানের চেয়ে ${toBn(sum - total)} বেশি হয়েছে।`
            : `আরও ${toBn(total - sum)} নম্বর বণ্টন করা বাকি আছে।`}
        </p>
      )}
    </div>
  );
};

/* ---------------------------------------------------------- SUBJECT ROW */
const SubjectRow = ({
  subject,
  index,
  total,
  onChange,
  onMove,
  onRemove,
  canRemove,
}) => (
  <li className="rounded border border-line-soft bg-surface p-3.5 space-y-3">
    <div className="flex items-center gap-2">
      <span
        className="w-8 h-8 shrink-0 rounded bg-surface-overlay/60 text-ink-muted
          font-mono text-[13px] font-semibold flex items-center justify-center"
        aria-hidden="true"
      >
        {toBn(index + 1)}
      </span>

      <Input
        value={subject.name}
        onChange={(e) => onChange(index, "name", e.target.value)}
        placeholder="বিষয়ের নাম (যেমন: বাংলা)"
        aria-label={`বিষয় ${index + 1} এর নাম`}
        className="flex-1 min-w-0 font-semibold"
      />

      <div
        className="flex items-center gap-1.5 shrink-0 min-h-[44px] px-3
          bg-surface-card border border-line-soft rounded"
      >
        <span className="text-[13px] text-ink-muted">মান</span>
        <input
          value={subject.marks ?? ""}
          onChange={(e) => onChange(index, "marks", e.target.value)}
          placeholder="২৫"
          inputMode="numeric"
          aria-label={`বিষয় ${index + 1} এর মান`}
          className="w-11 bg-transparent text-sm font-mono font-bold text-primary
            text-center focus:outline-none"
        />
      </div>

      <div className="flex items-center shrink-0">
        <IconButton
          icon={HiArrowUp}
          label="উপরে সরান"
          size="sm"
          onClick={() => onMove(index, -1)}
          disabled={index === 0}
        />
        <IconButton
          icon={HiArrowDown}
          label="নিচে সরান"
          size="sm"
          onClick={() => onMove(index, 1)}
          disabled={index === total - 1}
        />
        <IconButton
          icon={HiTrash}
          label="বিষয় মুছুন"
          size="sm"
          tone="danger"
          onClick={() => onRemove(index)}
          disabled={!canRemove}
        />
      </div>
    </div>

    <div className="space-y-1.5">
      <Textarea
        rows={3}
        value={subject.topicsText}
        onChange={(e) => onChange(index, "topicsText", e.target.value)}
        placeholder="টপিক বা অধ্যায়সমূহ — প্রতি লাইনে একটি করে লিখুন..."
        aria-label={`বিষয় ${index + 1} এর টপিক`}
      />
      <p className="text-[13px] text-ink-muted">
        {countTopics(subject.topicsText) > 0
          ? `${toBn(countTopics(subject.topicsText))} টি টপিক`
          : "প্রতিটি নতুন লাইন আলাদা টপিক হিসেবে সংরক্ষিত হবে।"}
      </p>
    </div>
  </li>
);

/* ---------------------------------------------------------- LIST CARD */
const SyllabusCard = ({ item, expanded, onToggle, onEdit, onDelete }) => {
  const subjects = Array.isArray(item.subjects) ? item.subjects : [];
  const sum = subjects.reduce((acc, s) => acc + parseMarks(s.marks), 0);
  const total = parseMarks(item.totalMarks) || 100;
  const balanced = sum === total;

  return (
    <Panel padded={false} className="overflow-hidden">
      <div className="p-4 space-y-3 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Chip tone="primary">{item.class}</Chip>
              {!balanced && (
                <Chip tone="error" icon={HiExclamationTriangle}>
                  মান মিলছে না
                </Chip>
              )}
            </div>
            <p className="text-[13px] text-ink-muted leading-snug">
              {item.subTitle || "স্কুল ও মাদ্রাসা উভয় মাধ্যম"}
            </p>
          </div>

          <div className="flex items-center shrink-0">
            <IconButton
              icon={HiPencilSquare}
              label="সম্পাদনা করুন"
              size="sm"
              onClick={() => onEdit(item)}
            />
            <IconButton
              icon={HiTrash}
              label="মুছে ফেলুন"
              size="sm"
              tone="danger"
              onClick={() => onDelete(item)}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Chip icon={HiSquares2X2}>{toBn(subjects.length)} টি বিষয়</Chip>
          <Chip icon={HiDocumentText} tone={balanced ? "neutral" : "secondary"}>
            পূর্ণমান {toBn(total)}
          </Chip>
          {item.duration && <Chip icon={HiClock}>{item.duration}</Chip>}
        </div>

        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          className="flex items-center justify-between w-full min-h-[44px] px-3 rounded
            bg-surface border border-line-soft text-[13px] font-semibold text-ink-body
            hover:text-ink-strong hover:border-line-strong/50 cursor-pointer press"
        >
          <span>বিষয়ভিত্তিক মান বণ্টন ও টপিক</span>
          <HiChevronDown
            className={`text-base transition-transform duration-300 ease-standard ${
              expanded ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* Kept mounted so the panel animates its real height. */}
      <div className={`grid-collapse ${expanded ? "is-open" : ""}`}>
        <div>
          <div className="px-4 pb-4 sm:px-5 sm:pb-5">
            <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {subjects.map((sub, sIdx) => (
                <li
                  key={sIdx}
                  className="p-3 space-y-2 border rounded border-line-soft bg-surface"
                >
                  <div className="flex items-center justify-between gap-2 pb-2 border-b border-line-soft">
                    <span className="text-[13px] font-semibold text-ink-strong truncate">
                      {sub.name}
                    </span>
                    <span className="px-2 py-0.5 shrink-0 rounded bg-primary/12 text-primary font-mono text-[13px] font-semibold">
                      {toBn(parseMarks(sub.marks))}
                    </span>
                  </div>
                  <ul className="space-y-1 text-[13px] text-ink-body">
                    {(Array.isArray(sub.topics) ? sub.topics : []).map((topic, tIdx) => (
                      <li key={tIdx} className="flex items-start gap-1.5">
                        <span className="text-primary mt-0.5" aria-hidden="true">
                          •
                        </span>
                        <span className="leading-relaxed">{topic}</span>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Panel>
  );
};

/* ---------------------------------------------------------- MANAGER */
const SyllabusManager = () => {
  const [syllabusList, setSyllabusList] = useState([]);
  const [confirm, confirmUI] = useConfirm();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(() => emptyForm(1));

  const loadSyllabus = async () => {
    try {
      setLoading(true);
      const data = await getSyllabus();
      setSyllabusList(data && data.length > 0 ? data : []);
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: "error", text: "সিলেবাস তালিকা লোড করা যায়নি।" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSyllabus();
  }, []);

  /* ---------------- derived ---------------- */

  const filteredList = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return syllabusList;
    return syllabusList.filter((item) => {
      const subjects = Array.isArray(item.subjects) ? item.subjects : [];
      const haystack = [
        item.class,
        item.subTitle,
        ...subjects.map((s) => s.name),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [syllabusList, search]);

  const stats = useMemo(() => {
    const subjectCount = syllabusList.reduce(
      (acc, item) => acc + (Array.isArray(item.subjects) ? item.subjects.length : 0),
      0
    );
    const unbalanced = syllabusList.filter((item) => {
      const subjects = Array.isArray(item.subjects) ? item.subjects : [];
      const sum = subjects.reduce((a, s) => a + parseMarks(s.marks), 0);
      return sum !== (parseMarks(item.totalMarks) || 100);
    }).length;
    return { classes: syllabusList.length, subjectCount, unbalanced };
  }, [syllabusList]);

  const marksSum = useMemo(
    () => formData.subjects.reduce((acc, s) => acc + parseMarks(s.marks), 0),
    [formData.subjects]
  );
  const marksTotal = parseMarks(formData.totalMarks);

  /* ---------------- editor ---------------- */

  const openCreate = () => {
    setEditingId(null);
    setFormData(emptyForm(syllabusList.length + 1));
    setEditorOpen(true);
  };

  const openEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      className: item.class || "",
      subTitle: item.subTitle || "স্কুল ও মাদ্রাসা উভয় মাধ্যম",
      color: item.color || "emerald",
      totalMarks: item.totalMarks || "১০০",
      duration: item.duration || "২ ঘণ্টা",
      orderIndex: String(item.orderIndex || 1),
      subjects: Array.isArray(item.subjects) && item.subjects.length
        ? item.subjects.map((s) => ({
            name: s.name || "",
            marks: s.marks || "২৫",
            topicsText: Array.isArray(s.topics) ? s.topics.join("\n") : "",
          }))
        : DEFAULT_SUBJECTS_TEMPLATE.map((s) => ({ ...s })),
    });
    setEditorOpen(true);
  };

  const closeEditor = () => {
    setEditorOpen(false);
    setEditingId(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubjectChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      subjects: prev.subjects.map((s, i) =>
        i === index ? { ...s, [field]: value } : s
      ),
    }));
  };

  const handleAddSubject = () => {
    setFormData((prev) => ({
      ...prev,
      subjects: [...prev.subjects, { name: "", marks: "২৫", topicsText: "" }],
    }));
  };

  const handleRemoveSubject = (index) => {
    setFormData((prev) =>
      prev.subjects.length <= 1
        ? prev
        : { ...prev, subjects: prev.subjects.filter((_, i) => i !== index) }
    );
  };

  const handleMoveSubject = (index, delta) => {
    setFormData((prev) => {
      const next = [...prev.subjects];
      const target = index + delta;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return { ...prev, subjects: next };
    });
  };

  const handleUseSum = () =>
    setFormData((prev) => ({ ...prev, totalMarks: toBn(marksSum) }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.className.trim()) {
      setStatusMessage({
        type: "error",
        text: "দয়া করে শ্রেণির নাম (যেমন: দশম শ্রেণি) প্রদান করুন!",
      });
      return;
    }

    const named = formData.subjects.filter((s) => s.name.trim());
    if (named.length === 0) {
      setStatusMessage({ type: "error", text: "কমপক্ষে একটি বিষয়ের নাম দিন!" });
      return;
    }

    setSubmitting(true);
    setStatusMessage(null);

    try {
      const payload = {
        class: formData.className.trim(),
        subTitle: formData.subTitle.trim() || "স্কুল ও মাদ্রাসা উভয় মাধ্যম",
        color: formData.color || "emerald",
        // Marks are stored in Bengali numerals whichever way they were typed.
        totalMarks: toBn(marksTotal || 100),
        duration: formData.duration.trim() || "২ ঘণ্টা",
        orderIndex: Number(toEn(formData.orderIndex)) || syllabusList.length + 1,
        subjects: named.map((s) => ({
          name: s.name.trim(),
          marks: toBn(parseMarks(s.marks) || 25),
          topics: (s.topicsText || "")
            .split("\n")
            .map((t) => t.trim())
            .filter(Boolean),
        })),
      };

      if (editingId) {
        await updateSyllabus(editingId, payload);
        setStatusMessage({
          type: "success",
          text: `"${payload.class}"-এর সিলেবাস আপডেট করা হয়েছে।`,
        });
      } else {
        await addSyllabus(payload);
        setStatusMessage({
          type: "success",
          text: `"${payload.class}"-এর সিলেবাস যুক্ত হয়েছে।`,
        });
      }

      closeEditor();
      await loadSyllabus();
    } catch (err) {
      console.error(err);
      setStatusMessage({
        type: "error",
        text: err.message || "সিলেবাস সংরক্ষণ করতে ব্যর্থ হয়েছে!",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (item) => {
    const ok = await confirm({
      title: "সিলেবাসটি মুছে ফেলবেন?",
      body: "এই শ্রেণির সব বিষয়, অধ্যায় ও মান বণ্টন একসাথে মুছে যাবে।",
      detail: item.class,
    });
    if (!ok) return;

    try {
      await deleteSyllabus(item.id);
      setSyllabusList((prev) => prev.filter((s) => s.id !== item.id));
      setStatusMessage({ type: "success", text: "সিলেবাস মুছে ফেলা হয়েছে।" });
    } catch {
      setStatusMessage({ type: "error", text: "মুছে ফেলতে ব্যর্থ হয়েছে!" });
    }
  };

  /* ---------------- render ---------------- */

  return (
    <div className="space-y-5 content-swap text-ink-strong">
      <Toast message={statusMessage} onDismiss={() => setStatusMessage(null)} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={HiAcademicCap}
          value={toBn(stats.classes)}
          label="শ্রেণিভিত্তিক সিলেবাস"
          loading={loading}
        />
        <StatCard
          icon={HiSquares2X2}
          value={toBn(stats.subjectCount)}
          label="সর্বমোট বিষয়"
          tone="tertiary"
          loading={loading}
        />
        <StatCard
          icon={HiExclamationTriangle}
          value={toBn(stats.unbalanced)}
          label="মান বণ্টন মিলছে না"
          tone={stats.unbalanced > 0 ? "error" : "primary"}
          loading={loading}
        />
      </div>

      <Toolbar
        actions={
          <Button tone="primary" icon={HiPlus} onClick={openCreate}>
            নতুন সিলেবাস
          </Button>
        }
      >
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="শ্রেণি বা বিষয়ের নাম দিয়ে খুঁজুন..."
          className="w-full sm:max-w-sm"
        />
        <span className="text-[13px] text-ink-muted whitespace-nowrap">
          {toBn(filteredList.length)} টি দেখানো হচ্ছে
        </span>
      </Toolbar>

      {loading ? (
        <LoadingState label="সিলেবাস তালিকা লোড হচ্ছে..." />
      ) : syllabusList.length === 0 ? (
        <EmptyState
          icon={HiBookOpen}
          title="কোনো সিলেবাস যুক্ত করা হয়নি"
          description="প্রতিটি শ্রেণির বিষয়, টপিক ও মান বণ্টন যোগ করে শুরু করুন।"
          action={
            <Button tone="primary" icon={HiPlus} onClick={openCreate}>
              প্রথম সিলেবাস তৈরি করুন
            </Button>
          }
        />
      ) : filteredList.length === 0 ? (
        <EmptyState
          icon={HiBookOpen}
          title="কোনো ফলাফল পাওয়া যায়নি"
          description="অন্য কোনো শ্রেণি বা বিষয়ের নাম দিয়ে খুঁজে দেখুন।"
          action={
            <Button tone="neutral" onClick={() => setSearch("")}>
              অনুসন্ধান বাতিল
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 stagger-in">
          {filteredList.map((item, index) => {
            const itemId = item.id || index;
            return (
              <SyllabusCard
                key={itemId}
                item={item}
                expanded={expandedId === itemId}
                onToggle={() => setExpandedId(expandedId === itemId ? null : itemId)}
                onEdit={openEdit}
                onDelete={handleDelete}
              />
            );
          })}
        </div>
      )}

      {/* ---------------- editor ---------------- */}
      <Modal
        open={editorOpen}
        onClose={closeEditor}
        size="xl"
        icon={HiBookOpen}
        title={editingId ? "সিলেবাস সম্পাদনা" : "নতুন শ্রেণির সিলেবাস"}
        description="শ্রেণির তথ্য, বিষয়ভিত্তিক মান বণ্টন ও টপিক নির্ধারণ করুন।"
        footer={
          <>
            <Button type="button" tone="neutral" onClick={closeEditor}>
              বাতিল
            </Button>
            <Button
              type="submit"
              form="syllabus-editor"
              tone="primary"
              icon={HiCheckCircle}
              loading={submitting}
            >
              {editingId ? "আপডেট করুন" : "সংরক্ষণ করুন"}
            </Button>
          </>
        }
      >
        <form id="syllabus-editor" onSubmit={handleSubmit} className="space-y-6">
          {/* Class meta */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="শ্রেণির নাম" required htmlFor="syl-class">
              <Input
                id="syl-class"
                name="className"
                value={formData.className}
                onChange={handleInputChange}
                placeholder="যেমন: ১০ম শ্রেণি / ৮ম শ্রেণি"
                required
              />
            </Field>

            <Field label="উপ-শিরোনাম / মাধ্যম" htmlFor="syl-sub">
              <Input
                id="syl-sub"
                name="subTitle"
                value={formData.subTitle}
                onChange={handleInputChange}
                placeholder="স্কুল ও মাদ্রাসা উভয় মাধ্যম"
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field
              label="মোট পূর্ণমান"
              hint="বাংলা বা ইংরেজি — যেকোনো সংখ্যায় লিখতে পারেন।"
              htmlFor="syl-total"
            >
              <Input
                id="syl-total"
                name="totalMarks"
                value={formData.totalMarks}
                onChange={handleInputChange}
                placeholder="১০০"
                inputMode="numeric"
                className="font-mono font-bold text-center"
              />
            </Field>

            <Field label="পরীক্ষার সময়" htmlFor="syl-duration">
              <Input
                id="syl-duration"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                placeholder="২ ঘণ্টা"
                className="text-center"
              />
            </Field>

            <Field
              label="ক্রমিক নম্বর"
              hint="তালিকায় কোন শ্রেণি আগে দেখাবে।"
              htmlFor="syl-order"
            >
              <Input
                id="syl-order"
                name="orderIndex"
                value={formData.orderIndex}
                onChange={handleInputChange}
                placeholder="1"
                inputMode="numeric"
                className="font-mono text-center"
              />
            </Field>
          </div>

          <MarksTally total={marksTotal} sum={marksSum} onUseSum={handleUseSum} />

          {/* Subject builder — full width, no inner scroller. */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-line-soft">
              <h4 className="inline-flex items-center gap-2 text-sm font-semibold text-ink-strong">
                <HiDocumentText className="text-base text-secondary" />
                বিষয় ও মান বণ্টন
                <span className="text-[13px] font-normal text-ink-muted">
                  ({toBn(formData.subjects.length)} টি)
                </span>
              </h4>

              <Button type="button" tone="outline" size="sm" icon={HiPlus} onClick={handleAddSubject}>
                বিষয় যোগ করুন
              </Button>
            </div>

            <ul className="space-y-3">
              {formData.subjects.map((subject, index) => (
                <SubjectRow
                  key={index}
                  subject={subject}
                  index={index}
                  total={formData.subjects.length}
                  onChange={handleSubjectChange}
                  onMove={handleMoveSubject}
                  onRemove={handleRemoveSubject}
                  canRemove={formData.subjects.length > 1}
                />
              ))}
            </ul>
          </div>
        </form>
      </Modal>

      {confirmUI}
    </div>
  );
};

export default SyllabusManager;
