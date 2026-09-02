import React, { useEffect, useMemo, useState } from "react";
import {
  HiBuildingLibrary,
  HiCheckCircle,
  HiPencilSquare,
  HiPlus,
  HiTrash,
} from "react-icons/hi2";
import {
  Button,
  Chip,
  EmptyState,
  Field,
  Input,
  LoadingState,
  Modal,
  Panel,
  PanelHeader,
  SearchInput,
  Toast,
  Toggle,
  useConfirm,
} from "../ui";
import {
  getExamCenters,
  addExamCenter,
  updateExamCenter,
  deleteExamCenter,
  seedDefaultExamCenters,
} from "../../../services/firestore";

/* ============================================================
   EXAM CENTRE MANAGER

   The centre a student sits the exam at used to be free text on the
   approval modal, retyped for every applicant. That put four spellings
   of one centre in the database and made "how many at each centre?"
   unanswerable. This tab owns the list; the registration screen picks
   from it.

   Not to be confused with the উপজেলা ও ফরম সেন্টার tab, which is about
   where paper forms are collected.
   ============================================================ */

/* A centre is just its name: that string is what the registration dropdown
   offers and what the admit card prints. Address, upazila and room notes were
   captured here for a while and never read anywhere, so they are gone. */
const BLANK_CENTER = {
  name: "",
  isActive: true,
  orderIndex: 1,
};

const ExamCenterManager = () => {
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [search, setSearch] = useState("");
  const [statusMessage, setStatusMessage] = useState(null);
  const [confirm, confirmUI] = useConfirm();

  const [editingId, setEditingId] = useState(null); // null = closed, "new" = add
  const [form, setForm] = useState(BLANK_CENTER);

  const showToast = (text, type = "success") => setStatusMessage({ type, text });

  const loadCenters = async () => {
    try {
      setLoading(true);
      setCenters((await getExamCenters()) || []);
    } catch (err) {
      console.error(err);
      showToast("কেন্দ্রের তালিকা লোড করতে সমস্যা হয়েছে!", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCenters();
  }, []);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return centers;
    return centers.filter((c) => (c.name || "").toLowerCase().includes(needle));
  }, [centers, search]);

  const activeCount = useMemo(
    () => centers.filter((c) => c.isActive !== false).length,
    [centers]
  );

  const openAdd = () => {
    setForm({
      ...BLANK_CENTER,
      /* New centres go to the end of the list rather than jostling the
         order the admin already arranged. */
      orderIndex: centers.length + 1,
    });
    setEditingId("new");
  };

  const openEdit = (center) => {
    setForm({ ...BLANK_CENTER, ...center });
    setEditingId(center.id);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const name = form.name.trim();
    if (!name) {
      showToast("কেন্দ্রের নাম লিখুন!", "error");
      return;
    }

    /* One centre, one name: the registrations store the name, so a duplicate
       here would split the same centre into two buckets in every report. */
    const clash = centers.some(
      (c) => c.id !== editingId && c.name.trim().toLowerCase() === name.toLowerCase()
    );
    if (clash) {
      showToast("এই নামে একটি কেন্দ্র ইতিমধ্যেই আছে!", "error");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name,
        isActive: form.isActive !== false,
        orderIndex: Number(form.orderIndex) || centers.length + 1,
      };

      if (editingId === "new") {
        await addExamCenter(payload);
        showToast(`"${name}" কেন্দ্রটি যুক্ত হয়েছে!`);
      } else {
        await updateExamCenter(editingId, payload);
        showToast(`"${name}" কেন্দ্রটি হালনাগাদ হয়েছে!`);
      }

      setEditingId(null);
      await loadCenters();
    } catch (err) {
      console.error(err);
      showToast(err.message || "সংরক্ষণ করতে সমস্যা হয়েছে!", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (center) => {
    const ok = await confirm({
      title: "কেন্দ্রটি মুছে ফেলবেন?",
      body:
        "কেন্দ্রটি আর ড্রপডাউনে দেখা যাবে না। যেসব শিক্ষার্থীকে আগে এই কেন্দ্র বরাদ্দ করা হয়েছে, তাদের প্রবেশপত্রে কেন্দ্রের নাম আগের মতোই থাকবে।",
      detail: center.name,
    });
    if (!ok) return;

    try {
      await deleteExamCenter(center.id);
      setCenters((prev) => prev.filter((c) => c.id !== center.id));
      showToast("কেন্দ্রটি মুছে ফেলা হয়েছে!");
    } catch (err) {
      console.error(err);
      showToast("মুছে ফেলতে সমস্যা হয়েছে!", "error");
    }
  };

  /* Turning a centre off keeps its name on the admit cards already issued
     while taking it out of the dropdown for new assignments. */
  const handleToggleActive = async (center) => {
    try {
      const next = center.isActive === false;
      await updateExamCenter(center.id, { ...center, isActive: next });
      setCenters((prev) =>
        prev.map((c) => (c.id === center.id ? { ...c, isActive: next } : c))
      );
    } catch (err) {
      console.error(err);
      showToast("পরিবর্তন সংরক্ষণ করা যায়নি!", "error");
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const added = await seedDefaultExamCenters();
      showToast(`${added} টি ডিফল্ট কেন্দ্র যুক্ত হয়েছে!`);
      await loadCenters();
    } catch (err) {
      console.error(err);
      showToast(err.message || "ডিফল্ট কেন্দ্র যুক্ত করা যায়নি!", "error");
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn text-ink-strong font-sans">
      <Toast message={statusMessage} onDismiss={() => setStatusMessage(null)} />

      <Panel>
        <PanelHeader
          icon={HiBuildingLibrary}
          title="পরীক্ষা কেন্দ্র"
          hint="এখানে যে কেন্দ্রগুলো যুক্ত করবেন, রেজিস্ট্রেশন অনুমোদনের সময় সেগুলোই ড্রপডাউনে আসবে।"
          actions={
            <>
              {centers.length === 0 && (
                <Button tone="neutral" onClick={handleSeed} loading={seeding}>
                  ডিফল্ট কেন্দ্র যুক্ত করুন
                </Button>
              )}
              <Button tone="primary" icon={HiPlus} onClick={openAdd}>
                নতুন কেন্দ্র
              </Button>
            </>
          }
        />

        <div className="flex flex-wrap items-center gap-3 mb-4">
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="কেন্দ্রের নাম দিয়ে খুঁজুন..."
            className="flex-1 min-w-[220px]"
          />
          <Chip tone="primary" icon={HiCheckCircle}>
            চালু: {activeCount} / {centers.length}
          </Chip>
        </div>

        {loading ? (
          <LoadingState label="কেন্দ্রের তালিকা লোড হচ্ছে..." />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={HiBuildingLibrary}
            title={
              centers.length === 0
                ? "এখনো কোনো পরীক্ষা কেন্দ্র যুক্ত করা হয়নি"
                : "এই খোঁজে কোনো কেন্দ্র মেলেনি"
            }
            description={
              centers.length === 0
                ? "কেন্দ্র যুক্ত করলে রেজিস্ট্রেশন অনুমোদনের সময় সেটি ড্রপডাউন থেকে বেছে নেওয়া যাবে।"
                : "অন্য নাম দিয়ে খুঁজে দেখুন।"
            }
            action={
              centers.length === 0 ? (
                <Button tone="primary" icon={HiPlus} onClick={openAdd}>
                  নতুন কেন্দ্র
                </Button>
              ) : null
            }
          />
        ) : (
          <ul className="space-y-2.5">
            {filtered.map((center) => (
              <li
                key={center.id}
                className="flex flex-wrap items-start justify-between gap-3 p-3.5 rounded-lg border border-line-soft bg-surface"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-ink-strong text-sm">{center.name}</span>
                    {center.isActive === false && (
                      <Chip tone="neutral">বন্ধ</Chip>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    tone={center.isActive === false ? "outline" : "neutral"}
                    onClick={() => handleToggleActive(center)}
                  >
                    {center.isActive === false ? "চালু করুন" : "বন্ধ করুন"}
                  </Button>
                  <Button
                    size="sm"
                    tone="neutral"
                    icon={HiPencilSquare}
                    onClick={() => openEdit(center)}
                  >
                    এডিট
                  </Button>
                  <Button
                    size="sm"
                    tone="danger"
                    icon={HiTrash}
                    onClick={() => handleDelete(center)}
                  >
                    মুছুন
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Modal
        open={editingId !== null}
        onClose={() => setEditingId(null)}
        icon={HiBuildingLibrary}
        title={editingId === "new" ? "নতুন পরীক্ষা কেন্দ্র" : "কেন্দ্রের তথ্য সম্পাদনা"}
        description="কেন্দ্রের নাম যেভাবে লিখবেন, প্রবেশপত্রেও ঠিক সেভাবেই ছাপা হবে।"
        footer={
          <>
            <Button type="button" tone="neutral" onClick={() => setEditingId(null)}>
              বাতিল
            </Button>
            <Button
              type="submit"
              form="exam-center-editor"
              tone="primary"
              icon={HiCheckCircle}
              loading={saving}
            >
              {editingId === "new" ? "সংরক্ষণ করুন" : "আপডেট করুন"}
            </Button>
          </>
        }
      >
        <form id="exam-center-editor" onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field
              label="কেন্দ্রের নাম"
              required
              htmlFor="center-name"
              hint="এই নামটিই প্রবেশপত্রে ও রেজিস্ট্রেশনের ড্রপডাউনে দেখা যাবে।"
              className="sm:col-span-2"
            >
              <Input
                id="center-name"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="যেমন: সিলেট সরকারি আলিয়া মাদরাসা কেন্দ্র, সিলেট"
                required
              />
            </Field>

            <Field label="তালিকায় ক্রম" hint="ছোট সংখ্যা আগে দেখাবে।" htmlFor="center-order">
              <Input
                id="center-order"
                type="number"
                min="1"
                value={form.orderIndex}
                onChange={(e) => setForm((p) => ({ ...p, orderIndex: e.target.value }))}
                className="font-mono text-center"
              />
            </Field>
          </div>

          <Toggle
            checked={form.isActive !== false}
            onChange={(checked) => setForm((p) => ({ ...p, isActive: checked }))}
            label="কেন্দ্রটি চালু আছে"
            hint="বন্ধ করলে নতুন বরাদ্দের ড্রপডাউনে আর আসবে না, তবে আগের বরাদ্দ অপরিবর্তিত থাকবে।"
          />
        </form>
      </Modal>

      {confirmUI}
    </div>
  );
};

export default ExamCenterManager;
