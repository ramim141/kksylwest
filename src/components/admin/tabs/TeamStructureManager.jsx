import React, { useState, useEffect } from "react";
import { Toast, useConfirm } from "../ui";
import {
  HiUserGroup,
  HiTrash,
  HiPencilSquare,
} from "react-icons/hi2";
import {
  getTeamStructure,
  addTeamStructure,
  updateTeamStructure,
  deleteTeamStructure,
} from "../../../services/firestore";

const TeamStructureManager = () => {
  const [teams, setTeams] = useState([]);
  const [confirm, confirmUI] = useConfirm();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    members: "১০",
    description: "",
    responsibilitiesText: "",
    theme: "emerald",
    orderIndex: "1",
  });

  const loadTeamsList = async () => {
    try {
      setLoading(true);
      const data = await getTeamStructure();
      if (data) setTeams(data);
      else setTeams([]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeamsList();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.description) {
      setStatusMessage({
        type: "error",
        text: "দয়া করে টিমের নাম এবং বিবরণ প্রদান করুন!",
      });
      return;
    }

    setSubmitting(true);
    setStatusMessage(null);

    try {
      // Split responsibilities by newline or comma
      const responsibilities = formData.responsibilitiesText
        ? formData.responsibilitiesText
            .split("\n")
            .map((r) => r.trim())
            .filter((r) => r.length > 0)
        : [];

      const payload = {
        name: formData.name,
        members: formData.members || "১০",
        description: formData.description,
        responsibilities: responsibilities,
        theme: formData.theme || "emerald",
        orderIndex: Number(formData.orderIndex) || teams.length + 1,
      };

      if (editingId) {
        await updateTeamStructure(editingId, payload);
        setStatusMessage({
          type: "success",
          text: "টিম স্ট্রাকচার সফলভাবে আপডেট করা হয়েছে!",
        });
      } else {
        await addTeamStructure(payload);
        setStatusMessage({
          type: "success",
          text: "নতুন টিম সফলভাবে যুক্ত করা হয়েছে!",
        });
      }

      handleReset();
      await loadTeamsList();
    } catch (err) {
      console.error(err);
      setStatusMessage({
        type: "error",
        text: err.message || "টিম তথ্য সংরক্ষণ করতে ব্যর্থ হয়েছে!",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (team) => {
    setEditingId(team.id);
    setFormData({
      name: team.name || "",
      members: team.members || "১০",
      description: team.description || "",
      responsibilitiesText: Array.isArray(team.responsibilities)
        ? team.responsibilities.join("\n")
        : "",
      theme: team.theme || "emerald",
      orderIndex: `${team.orderIndex || 1}`,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleReset = () => {
    setEditingId(null);
    setFormData({
      name: "",
      members: "১০",
      description: "",
      responsibilitiesText: "",
      theme: "emerald",
      orderIndex: `${teams.length + 2}`,
    });
  };

  const handleDelete = async (id) => {
    const ok = await confirm({
        title: "টিমটি মুছে ফেলবেন?",
        body: "এবাউট পেজের টিম স্ট্রাকচার থেকে এই বিভাগ ও তার দায়িত্বের তালিকা সরে যাবে।",
        confirmLabel: "মুছে ফেলুন",
        tone: "danger",
      });
      if (!ok) return;
    try {
      await deleteTeamStructure(id);
      setTeams((prev) => prev.filter((t) => t.id !== id));
      setStatusMessage({ type: "success", text: "টিম মুছে ফেলা হয়েছে!" });
    } catch (err) {
      setStatusMessage({ type: "error", text: "মুছে ফেলতে ব্যর্থ হয়েছে!" });
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">

      <Toast message={statusMessage} onDismiss={() => setStatusMessage(null)} />

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
        {/* Form (5 cols) */}
        <div className="lg:col-span-5 lg:sticky lg:top-[5.5rem] p-5 sm:p-6 bg-surface-card border border-line-soft rounded-lg space-y-4">
          <h3 className="text-sm font-bold text-ink-strong uppercase tracking-wider flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-tertiary-container/20 text-tertiary flex items-center justify-center text-[13px]">
              +
            </span>
            {editingId ? "টিম তথ্য সম্পাদনা করুন" : "নতুন টিম যুক্ত করুন"}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[13px] font-semibold text-ink-body mb-1.5">
                টিমের নাম (Team Name) *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="যেমন: পরীক্ষা পরিচালনা টিম"
                required
                className="w-full px-4 py-2.5 bg-surface-lowest border border-line-soft rounded text-ink-strong text-[13px] focus:outline-none focus:border-tertiary/40"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[13px] font-semibold text-ink-body mb-1.5">
                  সদস্য সংখ্যা ব্যাজ
                </label>
                <input
                  type="text"
                  name="members"
                  value={formData.members}
                  onChange={handleInputChange}
                  placeholder="যেমন: ২৮"
                  className="w-full px-3 py-2 bg-surface-lowest border border-line-soft rounded text-ink-strong text-[13px] focus:outline-none focus:border-tertiary/40"
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-ink-body mb-1.5">
                  ক্রম (Order Index)
                </label>
                <input
                  type="number"
                  name="orderIndex"
                  value={formData.orderIndex}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-3 py-2 bg-surface-lowest border border-line-soft rounded text-ink-strong text-[13px] focus:outline-none focus:border-tertiary/40"
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-ink-body mb-1.5">
                কালার থিম
              </label>
              <select
                name="theme"
                value={formData.theme}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 bg-surface-lowest border border-line-soft rounded text-ink-strong text-[13px] focus:outline-none focus:border-tertiary/40"
              >
                <option value="emerald">সবুজ (Emerald / Teal)</option>
                <option value="teal">টিয়াল ও সায়ান (Teal / Cyan)</option>
                <option value="cyan">নীল (Cyan / Blue)</option>
                <option value="purple">বেগুনি (Purple / Pink)</option>
                <option value="amber">সোনালী (Amber / Orange)</option>
              </select>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-ink-body mb-1.5">
                টিমের ভূমিকা ও সংক্ষিপ্ত বিবরণ *
              </label>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                placeholder="এই টিমের মূল লক্ষ্য ও কর্মপরিধি..."
                required
                className="w-full px-4 py-2.5 bg-surface-lowest border border-line-soft rounded text-ink-strong text-[13px] focus:outline-none focus:border-tertiary/40 leading-relaxed"
              ></textarea>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-ink-body mb-1.5">
                মূল দায়িত্বসমূহ (প্রতি লাইনে একটি করে লিখুন)
              </label>
              <textarea
                name="responsibilitiesText"
                rows={4}
                value={formData.responsibilitiesText}
                onChange={handleInputChange}
                placeholder="প্রশ্নপত্র প্রণয়ন ও মডারেশন&#10;পরীক্ষা কেন্দ্র নির্বাচন ও তত্ত্বাবধান&#10;উত্তরপত্র মূল্যায়ন ও যাচাই&#10;রেজাল্ট ঘোষণা ও সংরক্ষণ"
                className="w-full px-4 py-2.5 bg-surface-lowest border border-line-soft rounded text-ink-strong text-[13px] focus:outline-none focus:border-tertiary/40 leading-relaxed font-mono"
              ></textarea>
              <p className="text-[12px] text-ink-muted mt-1">
                টিমের কার্ডে পয়েন্ট বুলেট আকারে দেখাবে।
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3.5 bg-gradient-to-r from-tertiary-container to-primary-container hover:from-tertiary-container hover:to-primary-container text-ink-strong font-bold rounded text-[13px] transition cursor-pointer disabled:opacity-50"
              >
                {submitting ? "সংরক্ষণ হচ্ছে..." : editingId ? "আপডেট করুন" : "টিম যুক্ত করুন"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-3.5 bg-surface-card hover:bg-surface-overlay text-ink-body text-[13px] rounded cursor-pointer"
                >
                  বাতিল
                </button>
              )}
            </div>
          </form>
        </div>

        {/* List (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-4 bg-surface-card border border-line-soft rounded flex items-center justify-between shadow-overlay">
            <h3 className="text-sm font-bold text-ink-strong flex items-center gap-2">
              <HiUserGroup className="text-tertiary" />
              বর্তমান টিম তালিকা ({teams.length > 0 ? `${teams.length} টি টিম` : "ডিফল্ট ৪টি টিম চালু"})
            </h3>
            <span className="text-[13px] text-tertiary font-semibold">
              এবাউট পেজের সাথে লাইভ
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-ink-muted bg-surface-card rounded">
              লোড হচ্ছে...
            </div>
          ) : teams.length === 0 ? (
            <div className="p-8 text-center text-ink-muted bg-surface-card border border-line-soft rounded space-y-3">
              <p className="text-[13px] text-ink-body">
                ফায়ারস্টোরে কাস্টম টিম নেই। বর্তমানে ওয়েবসাইটের <strong>৪টি ডিফল্ট টিম স্ট্রাকচার</strong> এবাউট পেজে প্রদর্শিত হচ্ছে।
              </p>
              <p className="text-[13px] text-tertiary">
                বাম পাশের ফর্ম দিয়ে টিম যোগ বা কাস্টমাইজ করলে তা তৎক্ষণাৎ ওয়েবসাইটে কার্যকর হবে!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {teams.map((t, index) => (
                <div
                  key={t.id}
                  className="p-5 rounded bg-surface-card border border-line-soft hover:border-tertiary/40 transition duration-200 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full bg-tertiary-container/20 text-tertiary border border-tertiary/30 text-[12px] font-bold font-mono">
                        #{t.orderIndex || index + 1}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-surface-card text-ink-body text-[12px] font-semibold">
                        সদস্য: {t.members} জন
                      </span>
                      <span className="text-[12px] text-tertiary uppercase font-semibold">
                        {t.theme} থিম
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(t)}
                        className="p-2 hover:bg-surface-card text-ink-body hover:text-ink-strong rounded transition cursor-pointer"
                        title="সম্পাদনা"
                      >
                        <HiPencilSquare className="text-base" />
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="p-2 hover:bg-tertiary-900/40 text-tertiary hover:text-tertiary rounded transition cursor-pointer"
                        title="মুছে ফেলুন"
                      >
                        <HiTrash className="text-base" />
                      </button>
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-ink-strong">{t.name}</h4>
                  <p className="text-[13px] text-ink-body leading-relaxed">
                    {t.description}
                  </p>

                  {Array.isArray(t.responsibilities) && t.responsibilities.length > 0 && (
                    <div className="pt-2 border-t border-line-soft">
                      <p className="text-[12px] font-bold text-tertiary uppercase tracking-wider mb-1.5">
                        দায়িত্বসমূহ:
                      </p>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[13px] text-ink-muted">
                        {t.responsibilities.map((r, i) => (
                          <li key={i} className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-tertiary flex-shrink-0"></span>
                            <span className="truncate">{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {confirmUI}
    </div>
  );
};

export default TeamStructureManager;
