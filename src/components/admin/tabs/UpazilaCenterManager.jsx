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
  Toast,
  Toolbar,
  useConfirm,
} from "../ui";
import {
  HiArrowDown,
  HiArrowUp,
  HiBookOpen,
  HiBuildingStorefront,
  HiCheckCircle,
  HiChevronDown,
  HiMapPin,
  HiPencilSquare,
  HiPhone,
  HiPlus,
  HiTrash,
  HiUserGroup,
} from "react-icons/hi2";
import {
  getUpazilaCenters,
  addUpazilaCenter,
  updateUpazilaCenter,
  deleteUpazilaCenter,
} from "../../../services/firestore";

/* ============================================================
   UPAZILA & FORM CENTRE MANAGER

   Same rebuild as the syllabus tab, for the same reason: a narrow
   permanent form beside a list that is empty most of the time, and
   the two repeaters that actually need room — collection points and
   representatives — squeezed into 200px inner scrollers stacked
   inside a sticky column.

   Now the page is the list at full width, and adding or editing a
   upazila happens in a dialog that scrolls once. Both repeaters get
   the full width, can be reordered, and the card tells you at a
   glance how many centres and representatives a upazila has — which
   is the thing you come to this screen to check.
   ============================================================ */

const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

/** 12 -> "১২". Counts read in the same numerals as the rest of the panel. */
const toBn = (value) =>
  String(value ?? "").replace(/[0-9]/g, (d) => BN_DIGITS[Number(d)]);

/** The reverse, for reading an order index typed in either numeral system. */
const toEn = (value) =>
  String(value ?? "")
    .split("")
    .map((ch) => {
      const i = BN_DIGITS.indexOf(ch);
      return i === -1 ? ch : String(i);
    })
    .join("");

const DEFAULT_LOCATIONS_TEMPLATE = [
  { name: "পপি লাইব্রেরী", address: "থানা রোড, ফেঞ্চুগঞ্জ বাজার, সিলেট" },
  { name: "মেসার্স জসীম এন্ড ব্রাদার্স", address: "বিআইডিসি বাজার, ফেঞ্চুগঞ্জ, সিলেট" },
];

const DEFAULT_CONTACTS_TEMPLATE = [
  { name: "আশরাফুল ইসলাম তোহা", phone: "০১৬৩০-০১৭২৪৮" },
  { name: "জাকির হোসেন সামি", phone: "০১৮৭৫-৪৫২৫১৫" },
];

const emptyForm = (orderIndex) => ({
  upazila: "",
  color: "blue",
  orderIndex: String(orderIndex),
  locations: DEFAULT_LOCATIONS_TEMPLATE.map((l) => ({ ...l })),
  contacts: DEFAULT_CONTACTS_TEMPLATE.map((c) => ({ ...c })),
});

/* ---------------------------------------------------------- REPEATER */
/**
 * The two builders differ only in their field labels, so they share one
 * component. Rows are numbered, reorderable and removable down to the
 * last one — which is kept because a upazila with no centre at all is
 * not a record worth saving.
 */
const Repeater = ({
  title,
  icon,
  items,
  fields,
  addLabel,
  onAdd,
  onChange,
  onMove,
  onRemove,
}) => {
  const Icon = icon;
  return (
  <section className="space-y-3">
    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-line-soft">
      <h4 className="inline-flex items-center gap-2 text-sm font-semibold text-ink-strong">
        <Icon className="text-base text-primary" />
        {title}
        <span className="text-[13px] font-normal text-ink-muted">({toBn(items.length)} টি)</span>
      </h4>
      <Button type="button" tone="outline" size="sm" icon={HiPlus} onClick={onAdd}>
        {addLabel}
      </Button>
    </div>

    <ul className="space-y-2.5">
      {items.map((item, index) => (
        <li
          key={index}
          className="flex flex-col gap-2 p-3 border rounded sm:flex-row sm:items-center border-line-soft bg-surface"
        >
          <span
            className="w-8 h-8 shrink-0 rounded bg-surface-overlay/60 text-ink-muted
              font-mono text-[13px] font-semibold flex items-center justify-center"
            aria-hidden="true"
          >
            {toBn(index + 1)}
          </span>

          <div className="grid flex-1 min-w-0 grid-cols-1 gap-2 sm:grid-cols-2">
            {fields.map((field) => (
              <Input
                key={field.key}
                value={item[field.key] ?? ""}
                onChange={(e) => onChange(index, field.key, e.target.value)}
                placeholder={field.placeholder}
                aria-label={`${title} ${index + 1} — ${field.placeholder}`}
                className={field.className}
              />
            ))}
          </div>

          <div className="flex items-center justify-end shrink-0">
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
              disabled={index === items.length - 1}
            />
            <IconButton
              icon={HiTrash}
              label="মুছুন"
              size="sm"
              tone="danger"
              onClick={() => onRemove(index)}
              disabled={items.length <= 1}
            />
          </div>
        </li>
      ))}
    </ul>
  </section>
  );
};

/* ---------------------------------------------------------- LIST CARD */
const UpazilaCard = ({ item, expanded, onToggle, onEdit, onDelete }) => {
  const locations = Array.isArray(item.locations) ? item.locations : [];
  const contacts = Array.isArray(item.contacts) ? item.contacts : [];

  return (
    <Panel padded={false} className="overflow-hidden">
      <div className="p-4 space-y-3 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <span className="w-10 h-10 rounded shrink-0 bg-primary/12 text-primary flex items-center justify-center text-xl">
              <HiMapPin />
            </span>
            <div className="min-w-0">
              <h4 className="text-base font-semibold truncate text-ink-strong">
                {item.upazila}
              </h4>
              <p className="text-[13px] text-ink-muted mt-0.5">
                ক্রমিক {toBn(item.orderIndex || 1)}
              </p>
            </div>
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
          <Chip icon={HiBuildingStorefront} tone={locations.length ? "neutral" : "error"}>
            {toBn(locations.length)} টি কেন্দ্র
          </Chip>
          <Chip icon={HiPhone} tone={contacts.length ? "neutral" : "error"}>
            {toBn(contacts.length)} জন প্রতিনিধি
          </Chip>
        </div>

        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          className="flex items-center justify-between w-full min-h-[44px] px-3 rounded
            bg-surface border border-line-soft text-[13px] font-semibold text-ink-body
            hover:text-ink-strong hover:border-line-strong/50 cursor-pointer press"
        >
          <span>কেন্দ্র ও প্রতিনিধির তালিকা</span>
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
          <div className="px-4 pb-4 space-y-4 sm:px-5 sm:pb-5">
            <div className="space-y-2">
              <span className="text-[13px] font-semibold text-ink-muted">
                ফরম বিতরণ কেন্দ্র
              </span>
              <ul className="space-y-1.5">
                {locations.map((loc, lIdx) => (
                  <li
                    key={lIdx}
                    className="flex items-start gap-2 p-2.5 rounded bg-surface border border-line-soft"
                  >
                    <HiBookOpen className="text-primary text-base shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-ink-strong">{loc.name}</p>
                      {loc.address && (
                        <p className="text-[13px] text-ink-muted leading-snug">{loc.address}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {contacts.length > 0 && (
              <div className="space-y-2">
                <span className="text-[13px] font-semibold text-ink-muted">
                  দায়িত্বশীল প্রতিনিধি
                </span>
                <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                  {contacts.map((con, cIdx) => (
                    <li
                      key={cIdx}
                      className="flex items-center justify-between gap-2 p-2.5 rounded bg-surface border border-line-soft"
                    >
                      <span className="text-[13px] text-ink-body truncate">{con.name}</span>
                      <span className="text-[13px] font-mono font-semibold text-primary shrink-0">
                        {con.phone}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </Panel>
  );
};

/* ---------------------------------------------------------- MANAGER */
const UpazilaCenterManager = () => {
  const [upazilaList, setUpazilaList] = useState([]);
  const [confirm, confirmUI] = useConfirm();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(() => emptyForm(1));

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getUpazilaCenters();
      setUpazilaList(data || []);
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: "error", text: "উপজেলা তালিকা লোড করা যায়নি।" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /* ---------------- derived ---------------- */

  const filteredList = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return upazilaList;
    return upazilaList.filter((item) => {
      const locations = Array.isArray(item.locations) ? item.locations : [];
      const contacts = Array.isArray(item.contacts) ? item.contacts : [];
      const haystack = [
        item.upazila,
        ...locations.flatMap((l) => [l.name, l.address]),
        ...contacts.flatMap((c) => [c.name, c.phone]),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [upazilaList, search]);

  const stats = useMemo(() => {
    const centres = upazilaList.reduce(
      (acc, item) => acc + (Array.isArray(item.locations) ? item.locations.length : 0),
      0
    );
    const reps = upazilaList.reduce(
      (acc, item) => acc + (Array.isArray(item.contacts) ? item.contacts.length : 0),
      0
    );
    return { upazilas: upazilaList.length, centres, reps };
  }, [upazilaList]);

  /* ---------------- editor ---------------- */

  const openCreate = () => {
    setEditingId(null);
    setFormData(emptyForm(upazilaList.length + 1));
    setEditorOpen(true);
  };

  const openEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      upazila: item.upazila || "",
      color: item.color || "blue",
      orderIndex: String(item.orderIndex || 1),
      locations:
        Array.isArray(item.locations) && item.locations.length > 0
          ? item.locations.map((l) => ({ name: l.name || "", address: l.address || "" }))
          : [{ name: "", address: "" }],
      contacts:
        Array.isArray(item.contacts) && item.contacts.length > 0
          ? item.contacts.map((c) => ({ name: c.name || "", phone: c.phone || "" }))
          : [{ name: "", phone: "" }],
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

  /* One set of repeater handlers, parameterised by which list to touch. */
  const rowChange = (key) => (index, field, value) =>
    setFormData((prev) => ({
      ...prev,
      [key]: prev[key].map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    }));

  const rowAdd = (key, blank) => () =>
    setFormData((prev) => ({ ...prev, [key]: [...prev[key], { ...blank }] }));

  const rowRemove = (key) => (index) =>
    setFormData((prev) =>
      prev[key].length <= 1
        ? prev
        : { ...prev, [key]: prev[key].filter((_, i) => i !== index) }
    );

  const rowMove = (key) => (index, delta) =>
    setFormData((prev) => {
      const next = [...prev[key]];
      const target = index + delta;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return { ...prev, [key]: next };
    });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.upazila.trim()) {
      setStatusMessage({ type: "error", text: "দয়া করে উপজেলা বা থানার নাম প্রদান করুন!" });
      return;
    }

    const locations = formData.locations
      .filter((l) => l.name.trim())
      .map((l) => ({ name: l.name.trim(), address: (l.address || "").trim() }));

    if (locations.length === 0) {
      setStatusMessage({
        type: "error",
        text: "কমপক্ষে একটি ফরম সংগ্রহ কেন্দ্রের নাম দিন!",
      });
      return;
    }

    setSubmitting(true);
    setStatusMessage(null);

    try {
      const payload = {
        upazila: formData.upazila.trim(),
        color: formData.color || "blue",
        locations,
        contacts: formData.contacts
          .filter((c) => c.name.trim())
          .map((c) => ({ name: c.name.trim(), phone: (c.phone || "").trim() })),
        orderIndex: Number(toEn(formData.orderIndex)) || upazilaList.length + 1,
      };

      if (editingId) {
        await updateUpazilaCenter(editingId, payload);
        setStatusMessage({
          type: "success",
          text: `"${payload.upazila}"-এর তথ্য আপডেট করা হয়েছে।`,
        });
      } else {
        await addUpazilaCenter(payload);
        setStatusMessage({
          type: "success",
          text: `"${payload.upazila}" যুক্ত হয়েছে।`,
        });
      }

      closeEditor();
      await loadData();
    } catch (err) {
      console.error(err);
      setStatusMessage({
        type: "error",
        text: err.message || "তথ্য সংরক্ষণ করতে ব্যর্থ হয়েছে!",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (item) => {
    const ok = await confirm({
      title: "উপজেলার তথ্য মুছে ফেলবেন?",
      body: "এই উপজেলার সব ফরম সেন্টার ও দায়িত্বশীলদের যোগাযোগ তালিকা মুছে যাবে।",
      detail: item.upazila,
    });
    if (!ok) return;

    try {
      await deleteUpazilaCenter(item.id);
      setUpazilaList((prev) => prev.filter((u) => u.id !== item.id));
      setStatusMessage({ type: "success", text: "উপজেলা তালিকা থেকে মুছে ফেলা হয়েছে।" });
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
          icon={HiMapPin}
          value={toBn(stats.upazilas)}
          label="উপজেলা / থানা"
          loading={loading}
        />
        <StatCard
          icon={HiBuildingStorefront}
          value={toBn(stats.centres)}
          label="ফরম বিতরণ কেন্দ্র"
          tone="tertiary"
          loading={loading}
        />
        <StatCard
          icon={HiUserGroup}
          value={toBn(stats.reps)}
          label="দায়িত্বশীল প্রতিনিধি"
          tone="secondary"
          loading={loading}
        />
      </div>

      <Toolbar
        actions={
          <Button tone="primary" icon={HiPlus} onClick={openCreate}>
            নতুন উপজেলা
          </Button>
        }
      >
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="উপজেলা, কেন্দ্র বা প্রতিনিধির নাম দিয়ে খুঁজুন..."
          className="w-full sm:max-w-sm"
        />
        <span className="text-[13px] text-ink-muted whitespace-nowrap">
          {toBn(filteredList.length)} টি দেখানো হচ্ছে
        </span>
      </Toolbar>

      {loading ? (
        <LoadingState label="উপজেলা তালিকা লোড হচ্ছে..." />
      ) : upazilaList.length === 0 ? (
        <EmptyState
          icon={HiMapPin}
          title="কোনো উপজেলা সেন্টার যুক্ত করা হয়নি"
          description="উপজেলাভিত্তিক ফরম সংগ্রহের কেন্দ্র ও দায়িত্বশীলদের তালিকা যোগ করে শুরু করুন।"
          action={
            <Button tone="primary" icon={HiPlus} onClick={openCreate}>
              প্রথম উপজেলা যোগ করুন
            </Button>
          }
        />
      ) : filteredList.length === 0 ? (
        <EmptyState
          icon={HiMapPin}
          title="কোনো ফলাফল পাওয়া যায়নি"
          description="অন্য কোনো উপজেলা, কেন্দ্র বা প্রতিনিধির নাম দিয়ে খুঁজে দেখুন।"
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
              <UpazilaCard
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
        icon={HiMapPin}
        title={editingId ? "উপজেলা ও ফরম সেন্টার সম্পাদনা" : "নতুন উপজেলা ও ফরম সেন্টার"}
        description="ফরম সংগ্রহের কেন্দ্র ও দায়িত্বশীল প্রতিনিধিদের তালিকা নির্ধারণ করুন।"
        footer={
          <>
            <Button type="button" tone="neutral" onClick={closeEditor}>
              বাতিল
            </Button>
            <Button
              type="submit"
              form="upazila-editor"
              tone="primary"
              icon={HiCheckCircle}
              loading={submitting}
            >
              {editingId ? "আপডেট করুন" : "সংরক্ষণ করুন"}
            </Button>
          </>
        }
      >
        <form id="upazila-editor" onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field
              label="উপজেলা / থানার নাম"
              required
              htmlFor="upz-name"
              className="sm:col-span-2"
            >
              <Input
                id="upz-name"
                name="upazila"
                value={formData.upazila}
                onChange={handleInputChange}
                placeholder="যেমন: ফেঞ্চুগঞ্জ উপজেলা / বিশ্বনাথ উপজেলা"
                required
              />
            </Field>

            <Field
              label="ক্রমিক নম্বর"
              hint="তালিকায় আগে-পরে দেখানোর ক্রম।"
              htmlFor="upz-order"
            >
              <Input
                id="upz-order"
                name="orderIndex"
                value={formData.orderIndex}
                onChange={handleInputChange}
                placeholder="1"
                inputMode="numeric"
                className="font-mono text-center"
              />
            </Field>
          </div>

          <Repeater
            title="ফরম বিতরণ কেন্দ্র"
            icon={HiBuildingStorefront}
            items={formData.locations}
            addLabel="কেন্দ্র যোগ"
            fields={[
              { key: "name", placeholder: "লাইব্রেরী / দোকানের নাম", className: "font-semibold" },
              { key: "address", placeholder: "ঠিকানা (বাজার, উপজেলা, জেলা)" },
            ]}
            onAdd={rowAdd("locations", { name: "", address: "" })}
            onChange={rowChange("locations")}
            onMove={rowMove("locations")}
            onRemove={rowRemove("locations")}
          />

          <Repeater
            title="দায়িত্বশীল প্রতিনিধি"
            icon={HiPhone}
            items={formData.contacts}
            addLabel="প্রতিনিধি যোগ"
            fields={[
              { key: "name", placeholder: "প্রতিনিধির নাম", className: "font-semibold" },
              { key: "phone", placeholder: "মোবাইল নম্বর", className: "font-mono" },
            ]}
            onAdd={rowAdd("contacts", { name: "", phone: "" })}
            onChange={rowChange("contacts")}
            onMove={rowMove("contacts")}
            onRemove={rowRemove("contacts")}
          />
        </form>
      </Modal>

      {confirmUI}
    </div>
  );
};

export default UpazilaCenterManager;
