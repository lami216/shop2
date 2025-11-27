import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";

import { apiClient } from "../lib/apiClient";
import { getMyPayments, uploadReceipt } from "../services/paymentService";
import useTranslation from "../hooks/useTranslation";

const emptyProfileState = {
        college: "",
        major: "",
        level: "",
        currentSubjectsText: "",
        statusForPartners: "",
        statusForHelp: "",
        studyTimesText: "",
};

const StudentAdsPanel = () => {
        const [ads, setAds] = useState([]);
        const [loading, setLoading] = useState(true);
        const [creating, setCreating] = useState(false);
        const [editingAd, setEditingAd] = useState(null);
        const [partnerForm, setPartnerForm] = useState({ subjectId: "", modes: { reviewTogether: false, explainMe: false, IExplain: false }, description: "" });
        const [groupForm, setGroupForm] = useState({ subjectsText: "", maxMembers: "", mode: "online", joinExisting: false, description: "" });
        const [tutorForm, setTutorForm] = useState({ subjectId: "", period: "monthly", mode: "online", description: "" });
        const [helpForm, setHelpForm] = useState({ subjectId: "", needExplain: true, description: "" });
        const [editForm, setEditForm] = useState(null);

        const fetchAds = async () => {
                setLoading(true);
                try {
                        const data = await apiClient.get("/student/ads");
                        setAds(data || []);
                } catch (error) {
                        console.error(error);
                        toast.error("Failed to load ads");
                } finally {
                        setLoading(false);
                }
        };

        useEffect(() => {
                fetchAds();
        }, []);

        const resetForms = () => {
                setPartnerForm({ subjectId: "", modes: { reviewTogether: false, explainMe: false, IExplain: false }, description: "" });
                setGroupForm({ subjectsText: "", maxMembers: "", mode: "online", joinExisting: false, description: "" });
                setTutorForm({ subjectId: "", period: "monthly", mode: "online", description: "" });
                setHelpForm({ subjectId: "", needExplain: true, description: "" });
        };

        const handleCreateAd = async (payload) => {
                setCreating(true);
                try {
                        await apiClient.post("/student/ads", payload);
                        toast.success("Ad created");
                        resetForms();
                        fetchAds();
                } catch (error) {
                        console.error(error);
                        toast.error(error.response?.data?.message || "Could not create ad");
                } finally {
                        setCreating(false);
                }
        };

        const handleDelete = async (id) => {
                try {
                        await apiClient.delete(`/student/ads/${id}`);
                        toast.success("Ad deleted");
                        fetchAds();
                } catch (error) {
                        console.error(error);
                        toast.error(error.response?.data?.message || "Could not delete ad");
                }
        };

        const startEditing = (ad) => {
                setEditingAd(ad);
                if (ad.adType === "partner") {
                        const existingModes = Array.isArray(ad.options?.mode) ? ad.options.mode : [];
                        setEditForm({
                                adType: ad.adType,
                                id: ad._id,
                                subjectId: ad.subject || "",
                                description: ad.description || "",
                                status: ad.status || "active",
                                modes: {
                                        reviewTogether: existingModes.includes("reviewTogether"),
                                        explainMe: existingModes.includes("explainMe"),
                                        IExplain: existingModes.includes("IExplain"),
                                },
                        });
                }
                if (ad.adType === "group") {
                        setEditForm({
                                adType: ad.adType,
                                id: ad._id,
                                subjectsText: (ad.options?.subjectIds || []).join(","),
                                maxMembers: ad.options?.maxMembers || "",
                                mode: ad.options?.mode || "online",
                                joinExisting: Boolean(ad.options?.joinExisting),
                                description: ad.description || "",
                                status: ad.status || "active",
                        });
                }
                if (ad.adType === "tutor") {
                        setEditForm({
                                adType: ad.adType,
                                id: ad._id,
                                subjectId: ad.subject || "",
                                period: ad.options?.period || "monthly",
                                mode: ad.options?.mode || "online",
                                description: ad.description || "",
                                status: ad.status || "active",
                        });
                }
                if (ad.adType === "help") {
                        setEditForm({
                                adType: ad.adType,
                                id: ad._id,
                                subjectId: ad.subject || "",
                                needExplain: ad.options?.needExplain ?? true,
                                description: ad.description || "",
                                status: ad.status || "active",
                        });
                }
        };

        const handleEditSave = async () => {
                if (!editForm || !editingAd) return;

                const { adType, id } = editForm;
                const payload = { adType, status: editForm.status, description: editForm.description };

                if (adType === "partner") {
                        const modes = Object.entries(editForm.modes || {})
                                .filter(([, checked]) => checked)
                                .map(([key]) => key);
                        payload.subjectId = editForm.subjectId;
                        payload.partnershipMode = modes;
                }

                if (adType === "group") {
                        payload.subjectIds = (editForm.subjectsText || "")
                                .split(",")
                                .map((s) => s.trim())
                                .filter(Boolean);
                        payload.maxMembers = editForm.maxMembers;
                        payload.mode = editForm.mode;
                        payload.joinExisting = editForm.joinExisting;
                }

                if (adType === "tutor") {
                        payload.subjectId = editForm.subjectId;
                        payload.period = editForm.period;
                        payload.mode = editForm.mode;
                }

                if (adType === "help") {
                        payload.subjectId = editForm.subjectId;
                        payload.needExplain = editForm.needExplain;
                }

                try {
                        await apiClient.put(`/student/ads/${id}`, payload);
                        toast.success("Ad updated");
                        setEditingAd(null);
                        setEditForm(null);
                        fetchAds();
                } catch (error) {
                        console.error(error);
                        toast.error(error.response?.data?.message || "Could not update ad");
                }
        };

        const renderEditForm = () => {
                if (!editForm) return null;

                if (editForm.adType === "partner") {
                        return (
                                <div className='rounded-2xl border border-kingdom-gold/30 bg-black/50 p-4'>
                                        <h4 className='text-lg font-semibold text-kingdom-gold'>Edit partner ad</h4>
                                        <div className='mt-2 grid gap-3 sm:grid-cols-2'>
                                                <label className='flex flex-col gap-1 text-sm'>
                                                        <span>Subject</span>
                                                        <input
                                                                className='rounded-lg border border-kingdom-gold/30 bg-kingdom-charcoal/40 p-2 text-white'
                                                                value={editForm.subjectId}
                                                                onChange={(e) => setEditForm({ ...editForm, subjectId: e.target.value })}
                                                                placeholder='Subject ID or name'
                                                        />
                                                </label>
                                                <label className='flex flex-col gap-1 text-sm'>
                                                        <span>Status</span>
                                                        <select
                                                                className='rounded-lg border border-kingdom-gold/30 bg-kingdom-charcoal/40 p-2 text-white'
                                                                value={editForm.status}
                                                                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                                                        >
                                                                <option value='active'>Active</option>
                                                                <option value='archived'>Archived</option>
                                                        </select>
                                                </label>
                                                <div className='col-span-full grid gap-2 text-sm'>
                                                        <span>Modes</span>
                                                        {[
                                                                { key: "reviewTogether", label: "Review together" },
                                                                { key: "explainMe", label: "Explain to me" },
                                                                { key: "IExplain", label: "I explain to others" },
                                                        ].map((mode) => (
                                                                <label key={mode.key} className='flex items-center gap-2'>
                                                                        <input
                                                                                type='checkbox'
                                                                                checked={editForm.modes?.[mode.key] || false}
                                                                                onChange={(e) =>
                                                                                        setEditForm({
                                                                                                ...editForm,
                                                                                                modes: {
                                                                                                        ...editForm.modes,
                                                                                                        [mode.key]: e.target.checked,
                                                                                                },
                                                                                        })
                                                                                }
                                                                        />
                                                                        <span>{mode.label}</span>
                                                                </label>
                                                        ))}
                                                </div>
                                                <label className='col-span-full flex flex-col gap-1 text-sm'>
                                                        <span>Description</span>
                                                        <textarea
                                                                className='rounded-lg border border-kingdom-gold/30 bg-kingdom-charcoal/40 p-2 text-white'
                                                                rows={3}
                                                                value={editForm.description}
                                                                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                                                placeholder='Add notes for partners'
                                                        />
                                                </label>
                                                <div className='col-span-full flex justify-end gap-2'>
                                                        <button
                                                                className='rounded-lg border border-kingdom-gold/50 px-4 py-2 text-sm text-kingdom-gold'
                                                                onClick={() => {
                                                                        setEditingAd(null);
                                                                        setEditForm(null);
                                                                }}
                                                        >
                                                                Cancel
                                                        </button>
                                                        <button
                                                                className='rounded-lg bg-kingdom-gold px-4 py-2 text-sm font-semibold text-kingdom-charcoal'
                                                                onClick={handleEditSave}
                                                        >
                                                                Save changes
                                                        </button>
                                                </div>
                                        </div>
                                </div>
                        );
                }

                if (editForm.adType === "group") {
                        return (
                                <div className='rounded-2xl border border-kingdom-gold/30 bg-black/50 p-4'>
                                        <h4 className='text-lg font-semibold text-kingdom-gold'>Edit group ad</h4>
                                        <div className='mt-2 grid gap-3 sm:grid-cols-2'>
                                                <label className='flex flex-col gap-1 text-sm'>
                                                        <span>Subjects (comma separated, up to 4)</span>
                                                        <input
                                                                className='rounded-lg border border-kingdom-gold/30 bg-kingdom-charcoal/40 p-2 text-white'
                                                                value={editForm.subjectsText}
                                                                onChange={(e) => setEditForm({ ...editForm, subjectsText: e.target.value })}
                                                                placeholder='math101, phys201'
                                                        />
                                                </label>
                                                <label className='flex flex-col gap-1 text-sm'>
                                                        <span>Status</span>
                                                        <select
                                                                className='rounded-lg border border-kingdom-gold/30 bg-kingdom-charcoal/40 p-2 text-white'
                                                                value={editForm.status}
                                                                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                                                        >
                                                                <option value='active'>Active</option>
                                                                <option value='archived'>Archived</option>
                                                        </select>
                                                </label>
                                                <label className='flex flex-col gap-1 text-sm'>
                                                        <span>Group size</span>
                                                        <select
                                                                className='rounded-lg border border-kingdom-gold/30 bg-kingdom-charcoal/40 p-2 text-white'
                                                                value={editForm.maxMembers}
                                                                onChange={(e) => setEditForm({ ...editForm, maxMembers: e.target.value })}
                                                        >
                                                                <option value=''>Select</option>
                                                                <option value='4'>Small (2-4)</option>
                                                                <option value='6'>Large (5+)</option>
                                                        </select>
                                                </label>
                                                <label className='flex flex-col gap-1 text-sm'>
                                                        <span>Mode</span>
                                                        <select
                                                                className='rounded-lg border border-kingdom-gold/30 bg-kingdom-charcoal/40 p-2 text-white'
                                                                value={editForm.mode}
                                                                onChange={(e) => setEditForm({ ...editForm, mode: e.target.value })}
                                                        >
                                                                <option value='online'>Online</option>
                                                                <option value='offline'>Offline</option>
                                                                <option value='both'>Both</option>
                                                        </select>
                                                </label>
                                                <label className='flex items-center gap-2 text-sm'>
                                                        <input
                                                                type='checkbox'
                                                                checked={editForm.joinExisting}
                                                                onChange={(e) => setEditForm({ ...editForm, joinExisting: e.target.checked })}
                                                        />
                                                        <span>I want to join an existing group</span>
                                                </label>
                                                <label className='col-span-full flex flex-col gap-1 text-sm'>
                                                        <span>Description</span>
                                                        <textarea
                                                                className='rounded-lg border border-kingdom-gold/30 bg-kingdom-charcoal/40 p-2 text-white'
                                                                rows={3}
                                                                value={editForm.description}
                                                                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                                                placeholder='Share the collaboration style or timing'
                                                        />
                                                </label>
                                                <div className='col-span-full flex justify-end gap-2'>
                                                        <button
                                                                className='rounded-lg border border-kingdom-gold/50 px-4 py-2 text-sm text-kingdom-gold'
                                                                onClick={() => {
                                                                        setEditingAd(null);
                                                                        setEditForm(null);
                                                                }}
                                                        >
                                                                Cancel
                                                        </button>
                                                        <button
                                                                className='rounded-lg bg-kingdom-gold px-4 py-2 text-sm font-semibold text-kingdom-charcoal'
                                                                onClick={handleEditSave}
                                                        >
                                                                Save changes
                                                        </button>
                                                </div>
                                        </div>
                                </div>
                        );
                }

                if (editForm.adType === "tutor") {
                        return (
                                <div className='rounded-2xl border border-kingdom-gold/30 bg-black/50 p-4'>
                                        <h4 className='text-lg font-semibold text-kingdom-gold'>Edit tutor request</h4>
                                        <div className='mt-2 grid gap-3 sm:grid-cols-2'>
                                                <label className='flex flex-col gap-1 text-sm'>
                                                        <span>Subject</span>
                                                        <input
                                                                className='rounded-lg border border-kingdom-gold/30 bg-kingdom-charcoal/40 p-2 text-white'
                                                                value={editForm.subjectId}
                                                                onChange={(e) => setEditForm({ ...editForm, subjectId: e.target.value })}
                                                                placeholder='Subject ID or name'
                                                        />
                                                </label>
                                                <label className='flex flex-col gap-1 text-sm'>
                                                        <span>Status</span>
                                                        <select
                                                                className='rounded-lg border border-kingdom-gold/30 bg-kingdom-charcoal/40 p-2 text-white'
                                                                value={editForm.status}
                                                                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                                                        >
                                                                <option value='active'>Active</option>
                                                                <option value='archived'>Archived</option>
                                                        </select>
                                                </label>
                                                <label className='flex flex-col gap-1 text-sm'>
                                                        <span>Period</span>
                                                        <select
                                                                className='rounded-lg border border-kingdom-gold/30 bg-kingdom-charcoal/40 p-2 text-white'
                                                                value={editForm.period}
                                                                onChange={(e) => setEditForm({ ...editForm, period: e.target.value })}
                                                        >
                                                                <option value='monthly'>Monthly</option>
                                                                <option value='semester'>Semester</option>
                                                        </select>
                                                </label>
                                                <label className='flex flex-col gap-1 text-sm'>
                                                        <span>Mode</span>
                                                        <select
                                                                className='rounded-lg border border-kingdom-gold/30 bg-kingdom-charcoal/40 p-2 text-white'
                                                                value={editForm.mode}
                                                                onChange={(e) => setEditForm({ ...editForm, mode: e.target.value })}
                                                        >
                                                                <option value='online'>Online</option>
                                                                <option value='offline'>Offline</option>
                                                                <option value='both'>Both</option>
                                                        </select>
                                                </label>
                                                <label className='col-span-full flex flex-col gap-1 text-sm'>
                                                        <span>Description</span>
                                                        <textarea
                                                                className='rounded-lg border border-kingdom-gold/30 bg-kingdom-charcoal/40 p-2 text-white'
                                                                rows={3}
                                                                value={editForm.description}
                                                                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                                                placeholder='Share timing preferences'
                                                        />
                                                </label>
                                                <div className='col-span-full flex justify-end gap-2'>
                                                        <button
                                                                className='rounded-lg border border-kingdom-gold/50 px-4 py-2 text-sm text-kingdom-gold'
                                                                onClick={() => {
                                                                        setEditingAd(null);
                                                                        setEditForm(null);
                                                                }}
                                                        >
                                                                Cancel
                                                        </button>
                                                        <button
                                                                className='rounded-lg bg-kingdom-gold px-4 py-2 text-sm font-semibold text-kingdom-charcoal'
                                                                onClick={handleEditSave}
                                                        >
                                                                Save changes
                                                        </button>
                                                </div>
                                        </div>
                                </div>
                        );
                }

                if (editForm.adType === "help") {
                        return (
                                <div className='rounded-2xl border border-kingdom-gold/30 bg-black/50 p-4'>
                                        <h4 className='text-lg font-semibold text-kingdom-gold'>Edit help ad</h4>
                                        <div className='mt-2 grid gap-3 sm:grid-cols-2'>
                                                <label className='flex flex-col gap-1 text-sm'>
                                                        <span>Subject</span>
                                                        <input
                                                                className='rounded-lg border border-kingdom-gold/30 bg-kingdom-charcoal/40 p-2 text-white'
                                                                value={editForm.subjectId}
                                                                onChange={(e) => setEditForm({ ...editForm, subjectId: e.target.value })}
                                                                placeholder='Subject ID or name'
                                                        />
                                                </label>
                                                <label className='flex flex-col gap-1 text-sm'>
                                                        <span>Status</span>
                                                        <select
                                                                className='rounded-lg border border-kingdom-gold/30 bg-kingdom-charcoal/40 p-2 text-white'
                                                                value={editForm.status}
                                                                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                                                        >
                                                                <option value='active'>Active</option>
                                                                <option value='archived'>Archived</option>
                                                        </select>
                                                </label>
                                                <label className='flex items-center gap-2 text-sm'>
                                                        <input
                                                                type='checkbox'
                                                                checked={editForm.needExplain}
                                                                onChange={(e) => setEditForm({ ...editForm, needExplain: e.target.checked })}
                                                        />
                                                        <span>I need someone to explain this subject</span>
                                                </label>
                                                <label className='col-span-full flex flex-col gap-1 text-sm'>
                                                        <span>Description</span>
                                                        <textarea
                                                                className='rounded-lg border border-kingdom-gold/30 bg-kingdom-charcoal/40 p-2 text-white'
                                                                rows={3}
                                                                value={editForm.description}
                                                                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                                                placeholder='Share what kind of help you need'
                                                        />
                                                </label>
                                                <div className='col-span-full flex justify-end gap-2'>
                                                        <button
                                                                className='rounded-lg border border-kingdom-gold/50 px-4 py-2 text-sm text-kingdom-gold'
                                                                onClick={() => {
                                                                        setEditingAd(null);
                                                                        setEditForm(null);
                                                                }}
                                                        >
                                                                Cancel
                                                        </button>
                                                        <button
                                                                className='rounded-lg bg-kingdom-gold px-4 py-2 text-sm font-semibold text-kingdom-charcoal'
                                                                onClick={handleEditSave}
                                                        >
                                                                Save changes
                                                        </button>
                                                </div>
                                        </div>
                                </div>
                        );
                }

                return null;
        };

        return (
                <div className='space-y-6'>
                        <div className='rounded-2xl border border-kingdom-gold/20 bg-black/40 p-4 shadow-royal-soft'>
                                <div className='flex items-center justify-between'>
                                        <h3 className='text-xl font-semibold text-kingdom-gold'>My ads</h3>
                                        <button
                                                className='text-sm text-kingdom-cream/70 underline'
                                                onClick={() => {
                                                        fetchAds();
                                                        toast.success("Refreshed");
                                                }}
                                        >
                                                Refresh
                                        </button>
                                </div>
                                {loading ? (
                                        <p className='mt-3 text-kingdom-cream/70'>Loading ads...</p>
                                ) : ads.length === 0 ? (
                                        <p className='mt-3 text-kingdom-cream/70'>No ads yet. Create your first one below.</p>
                                ) : (
                                        <div className='mt-4 space-y-3'>
                                                {ads.map((ad) => (
                                                        <div
                                                                key={ad._id}
                                                                className='flex flex-col gap-3 rounded-xl border border-kingdom-gold/20 bg-kingdom-charcoal/40 p-3 sm:flex-row sm:items-center sm:justify-between'
                                                        >
                                                                <div>
                                                                        <p className='text-sm uppercase tracking-wide text-kingdom-gold'>
                                                                                {ad.adType}
                                                                        </p>
                                                                        <p className='text-kingdom-cream'>Status: {ad.status || "active"}</p>
                                                                        {ad.subject && <p className='text-kingdom-cream/80'>Subject: {ad.subject}</p>}
                                                                        {ad.description && <p className='text-kingdom-cream/70'>Notes: {ad.description}</p>}
                                                                </div>
                                                                <div className='flex gap-2 text-sm'>
                                                                        <button
                                                                                className='rounded-lg border border-kingdom-gold/50 px-3 py-2 text-kingdom-gold'
                                                                                onClick={() => startEditing(ad)}
                                                                        >
                                                                                Edit
                                                                        </button>
                                                                        <button
                                                                                className='rounded-lg border border-red-400/70 px-3 py-2 text-red-200'
                                                                                onClick={() => handleDelete(ad._id)}
                                                                        >
                                                                                Delete
                                                                        </button>
                                                                </div>
                                                        </div>
                                                ))}
                                        </div>
                                )}
                        </div>

                        {renderEditForm()}

                        <div className='grid gap-4 lg:grid-cols-2'>
                                <div className='rounded-2xl border border-kingdom-gold/20 bg-black/40 p-4 shadow-royal-soft'>
                                        <h4 className='text-lg font-semibold text-kingdom-gold'>Partner ad</h4>
                                        <div className='mt-3 space-y-3 text-sm'>
                                                <label className='flex flex-col gap-1'>
                                                        <span>Subject</span>
                                                        <select
                                                                className='rounded-lg border border-kingdom-gold/30 bg-kingdom-charcoal/40 p-2 text-white'
                                                                value={partnerForm.subjectId}
                                                                onChange={(e) => setPartnerForm({ ...partnerForm, subjectId: e.target.value })}
                                                        >
                                                                <option value=''>Select a subject</option>
                                                                <option value='math101'>Math 101</option>
                                                                <option value='cs101'>CS 101</option>
                                                                <option value='eng201'>ENG 201</option>
                                                        </select>
                                                </label>
                                                <div className='grid gap-2'>
                                                        <span>Modes</span>
                                                        {[
                                                                { key: "reviewTogether", label: "Review together" },
                                                                { key: "explainMe", label: "Explain to me" },
                                                                { key: "IExplain", label: "I explain to others" },
                                                        ].map((mode) => (
                                                                <label key={mode.key} className='flex items-center gap-2'>
                                                                        <input
                                                                                type='checkbox'
                                                                                checked={partnerForm.modes[mode.key]}
                                                                                onChange={(e) =>
                                                                                        setPartnerForm({
                                                                                                ...partnerForm,
                                                                                                modes: {
                                                                                                        ...partnerForm.modes,
                                                                                                        [mode.key]: e.target.checked,
                                                                                                },
                                                                                        })
                                                                                }
                                                                        />
                                                                        <span>{mode.label}</span>
                                                                </label>
                                                        ))}
                                                </div>
                                                <label className='flex flex-col gap-1'>
                                                        <span>Notes</span>
                                                        <textarea
                                                                className='rounded-lg border border-kingdom-gold/30 bg-kingdom-charcoal/40 p-2 text-white'
                                                                rows={2}
                                                                value={partnerForm.description}
                                                                onChange={(e) => setPartnerForm({ ...partnerForm, description: e.target.value })}
                                                                placeholder='Add context for your partner search'
                                                        />
                                                </label>
                                                <button
                                                        className='w-full rounded-lg bg-kingdom-gold px-4 py-2 text-sm font-semibold text-kingdom-charcoal'
                                                        disabled={creating}
                                                        onClick={() => {
                                                                const modes = Object.entries(partnerForm.modes)
                                                                        .filter(([, checked]) => checked)
                                                                        .map(([key]) => key);
                                                                handleCreateAd({
                                                                        adType: "partner",
                                                                        subjectId: partnerForm.subjectId,
                                                                        partnershipMode: modes,
                                                                        description: partnerForm.description,
                                                                });
                                                        }}
                                                >
                                                        {creating ? "Saving..." : "Create partner ad"}
                                                </button>
                                        </div>
                                </div>

                                <div className='rounded-2xl border border-kingdom-gold/20 bg-black/40 p-4 shadow-royal-soft'>
                                        <h4 className='text-lg font-semibold text-kingdom-gold'>Group ad</h4>
                                        <div className='mt-3 space-y-3 text-sm'>
                                                <label className='flex flex-col gap-1'>
                                                        <span>Subjects (up to 4)</span>
                                                        <input
                                                                className='rounded-lg border border-kingdom-gold/30 bg-kingdom-charcoal/40 p-2 text-white'
                                                                value={groupForm.subjectsText}
                                                                onChange={(e) => setGroupForm({ ...groupForm, subjectsText: e.target.value })}
                                                                placeholder='math101, phys201'
                                                        />
                                                </label>
                                                <label className='flex flex-col gap-1'>
                                                        <span>Group size</span>
                                                        <select
                                                                className='rounded-lg border border-kingdom-gold/30 bg-kingdom-charcoal/40 p-2 text-white'
                                                                value={groupForm.maxMembers}
                                                                onChange={(e) => setGroupForm({ ...groupForm, maxMembers: e.target.value })}
                                                        >
                                                                <option value=''>Select</option>
                                                                <option value='4'>Small (2-4)</option>
                                                                <option value='6'>Large (5+)</option>
                                                        </select>
                                                </label>
                                                <label className='flex flex-col gap-1'>
                                                        <span>Mode</span>
                                                        <select
                                                                className='rounded-lg border border-kingdom-gold/30 bg-kingdom-charcoal/40 p-2 text-white'
                                                                value={groupForm.mode}
                                                                onChange={(e) => setGroupForm({ ...groupForm, mode: e.target.value })}
                                                        >
                                                                <option value='online'>Online</option>
                                                                <option value='offline'>Offline</option>
                                                                <option value='both'>Both</option>
                                                        </select>
                                                </label>
                                                <label className='flex items-center gap-2'>
                                                        <input
                                                                type='checkbox'
                                                                checked={groupForm.joinExisting}
                                                                onChange={(e) => setGroupForm({ ...groupForm, joinExisting: e.target.checked })}
                                                        />
                                                        <span>I want to join an existing group</span>
                                                </label>
                                                <label className='flex flex-col gap-1'>
                                                        <span>Notes</span>
                                                        <textarea
                                                                className='rounded-lg border border-kingdom-gold/30 bg-kingdom-charcoal/40 p-2 text-white'
                                                                rows={2}
                                                                value={groupForm.description}
                                                                onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })}
                                                                placeholder='Share timing or focus'
                                                        />
                                                </label>
                                                <button
                                                        className='w-full rounded-lg bg-kingdom-gold px-4 py-2 text-sm font-semibold text-kingdom-charcoal'
                                                        disabled={creating}
                                                        onClick={() => {
                                                                const subjects = groupForm.subjectsText
                                                                        .split(",")
                                                                        .map((s) => s.trim())
                                                                        .filter(Boolean)
                                                                        .slice(0, 4);
                                                                handleCreateAd({
                                                                        adType: "group",
                                                                        subjectIds: subjects,
                                                                        maxMembers: groupForm.maxMembers,
                                                                        mode: groupForm.mode,
                                                                        joinExisting: groupForm.joinExisting,
                                                                        description: groupForm.description,
                                                                });
                                                        }}
                                                >
                                                        {creating ? "Saving..." : "Create group ad"}
                                                </button>
                                        </div>
                                </div>

                                <div className='rounded-2xl border border-kingdom-gold/20 bg-black/40 p-4 shadow-royal-soft'>
                                        <h4 className='text-lg font-semibold text-kingdom-gold'>Tutor request</h4>
                                        <div className='mt-3 space-y-3 text-sm'>
                                                <label className='flex flex-col gap-1'>
                                                        <span>Subject</span>
                                                        <select
                                                                className='rounded-lg border border-kingdom-gold/30 bg-kingdom-charcoal/40 p-2 text-white'
                                                                value={tutorForm.subjectId}
                                                                onChange={(e) => setTutorForm({ ...tutorForm, subjectId: e.target.value })}
                                                        >
                                                                <option value=''>Select a subject</option>
                                                                <option value='math101'>Math 101</option>
                                                                <option value='cs101'>CS 101</option>
                                                                <option value='eng201'>ENG 201</option>
                                                        </select>
                                                </label>
                                                <label className='flex flex-col gap-1'>
                                                        <span>Period</span>
                                                        <select
                                                                className='rounded-lg border border-kingdom-gold/30 bg-kingdom-charcoal/40 p-2 text-white'
                                                                value={tutorForm.period}
                                                                onChange={(e) => setTutorForm({ ...tutorForm, period: e.target.value })}
                                                        >
                                                                <option value='monthly'>Monthly</option>
                                                                <option value='semester'>Semester</option>
                                                        </select>
                                                </label>
                                                <label className='flex flex-col gap-1'>
                                                        <span>Mode</span>
                                                        <select
                                                                className='rounded-lg border border-kingdom-gold/30 bg-kingdom-charcoal/40 p-2 text-white'
                                                                value={tutorForm.mode}
                                                                onChange={(e) => setTutorForm({ ...tutorForm, mode: e.target.value })}
                                                        >
                                                                <option value='online'>Online</option>
                                                                <option value='offline'>Offline</option>
                                                                <option value='both'>Both</option>
                                                        </select>
                                                </label>
                                                <label className='flex flex-col gap-1'>
                                                        <span>Notes</span>
                                                        <textarea
                                                                className='rounded-lg border border-kingdom-gold/30 bg-kingdom-charcoal/40 p-2 text-white'
                                                                rows={2}
                                                                value={tutorForm.description}
                                                                onChange={(e) => setTutorForm({ ...tutorForm, description: e.target.value })}
                                                                placeholder='Share timing or frequency'
                                                        />
                                                </label>
                                                <button
                                                        className='w-full rounded-lg bg-kingdom-gold px-4 py-2 text-sm font-semibold text-kingdom-charcoal'
                                                        disabled={creating}
                                                        onClick={() =>
                                                                handleCreateAd({
                                                                        adType: "tutor",
                                                                        subjectId: tutorForm.subjectId,
                                                                        period: tutorForm.period,
                                                                        mode: tutorForm.mode,
                                                                        description: tutorForm.description,
                                                                })
                                                        }
                                                >
                                                        {creating ? "Saving..." : "Create tutor request"}
                                                </button>
                                        </div>
                                </div>

                                <div className='rounded-2xl border border-kingdom-gold/20 bg-black/40 p-4 shadow-royal-soft'>
                                        <h4 className='text-lg font-semibold text-kingdom-gold'>Help ad</h4>
                                        <div className='mt-3 space-y-3 text-sm'>
                                                <label className='flex flex-col gap-1'>
                                                        <span>Subject</span>
                                                        <select
                                                                className='rounded-lg border border-kingdom-gold/30 bg-kingdom-charcoal/40 p-2 text-white'
                                                                value={helpForm.subjectId}
                                                                onChange={(e) => setHelpForm({ ...helpForm, subjectId: e.target.value })}
                                                        >
                                                                <option value=''>Select a subject</option>
                                                                <option value='math101'>Math 101</option>
                                                                <option value='cs101'>CS 101</option>
                                                                <option value='eng201'>ENG 201</option>
                                                        </select>
                                                </label>
                                                <label className='flex items-center gap-2'>
                                                        <input
                                                                type='checkbox'
                                                                checked={helpForm.needExplain}
                                                                onChange={(e) => setHelpForm({ ...helpForm, needExplain: e.target.checked })}
                                                        />
                                                        <span>I need someone to explain this subject</span>
                                                </label>
                                                <label className='flex flex-col gap-1'>
                                                        <span>Notes</span>
                                                        <textarea
                                                                className='rounded-lg border border-kingdom-gold/30 bg-kingdom-charcoal/40 p-2 text-white'
                                                                rows={2}
                                                                value={helpForm.description}
                                                                onChange={(e) => setHelpForm({ ...helpForm, description: e.target.value })}
                                                                placeholder='Add context for helpers'
                                                        />
                                                </label>
                                                <button
                                                        className='w-full rounded-lg bg-kingdom-gold px-4 py-2 text-sm font-semibold text-kingdom-charcoal'
                                                        disabled={creating}
                                                        onClick={() =>
                                                                handleCreateAd({
                                                                        adType: "help",
                                                                        subjectId: helpForm.subjectId,
                                                                        needExplain: helpForm.needExplain,
                                                                        description: helpForm.description,
                                                                })
                                                        }
                                                >
                                                        {creating ? "Saving..." : "Create help ad"}
                                                </button>
                                        </div>
                                </div>
                        </div>
                </div>
        );
};

const StudentPaymentsPanel = () => {
        const [payments, setPayments] = useState([]);
        const [loading, setLoading] = useState(false);
        const [submittingId, setSubmittingId] = useState(null);
        const [receiptInputs, setReceiptInputs] = useState({});

        const fetchPayments = async () => {
                setLoading(true);
                try {
                        const data = await getMyPayments();
                        setPayments(data || []);
                } catch (error) {
                        console.error(error);
                        toast.error(error.response?.data?.message || "Could not load payments");
                } finally {
                        setLoading(false);
                }
        };

        useEffect(() => {
                fetchPayments();
        }, []);

        const handleReceiptSubmit = async (paymentId) => {
                const receiptImage = receiptInputs[paymentId];

                if (!receiptImage) {
                        toast.error("أدخل مرجع الإيصال أولًا");
                        return;
                }

                setSubmittingId(paymentId);
                try {
                        await uploadReceipt(paymentId, { receiptImage });
                        toast.success("تم إرسال الإيصال للمعلم");
                        fetchPayments();
                } catch (error) {
                        console.error(error);
                        toast.error(error.response?.data?.message || "تعذر إرسال الإيصال");
                } finally {
                        setSubmittingId(null);
                }
        };

        return (
                <div className='rounded-2xl border border-kingdom-gold/20 bg-black/40 p-6 shadow-royal-soft'>
                        <div className='flex items-center justify-between gap-3'>
                                <div>
                                        <h2 className='text-2xl font-semibold text-kingdom-gold'>دفعاتي</h2>
                                        <p className='text-kingdom-cream/70'>سجل مبسط للدفعات التي تتابعها مع المعلم.</p>
                                </div>
                        </div>

                        {loading ? (
                                <p className='mt-4 text-sm text-kingdom-cream/70'>جاري تحميل الدفعات...</p>
                        ) : payments.length === 0 ? (
                                <p className='mt-4 text-sm text-kingdom-cream/70'>لا توجد دفعات حالية.</p>
                        ) : (
                                <div className='mt-4 space-y-3'>
                                        {payments.map((payment) => (
                                                <div
                                                        key={payment._id}
                                                        className='rounded-xl border border-kingdom-gold/30 bg-kingdom-charcoal/40 p-4'
                                                >
                                                        <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
                                                                <div className='space-y-1'>
                                                                        <p className='text-sm text-kingdom-cream/80'>
                                                                                المادة: {payment.subject?.name || payment.subject || "-"}
                                                                        </p>
                                                                        <p className='text-sm text-kingdom-cream/80'>الدفع: {payment.amount} / {payment.period}</p>
                                                                        <p className='text-xs text-kingdom-cream/60'>الحالة: {payment.status}</p>
                                                                        {payment.receiptImage && (
                                                                                <p className='text-xs text-kingdom-cream/60'>مرجع الإيصال: {payment.receiptImage}</p>
                                                                        )}
                                                                </div>

                                                                {payment.status === "awaiting_receipt" && (
                                                                        <div className='flex w-full flex-col gap-2 sm:w-72'>
                                                                                <input
                                                                                        className='rounded-lg border border-kingdom-gold/30 bg-black/40 p-2 text-sm text-white'
                                                                                        placeholder='رابط أو اسم ملف الإيصال'
                                                                                        value={receiptInputs[payment._id] || ""}
                                                                                        onChange={(e) =>
                                                                                                setReceiptInputs({
                                                                                                        ...receiptInputs,
                                                                                                        [payment._id]: e.target.value,
                                                                                                })
                                                                                        }
                                                                                />
                                                                                <button
                                                                                        onClick={() => handleReceiptSubmit(payment._id)}
                                                                                        disabled={submittingId === payment._id}
                                                                                        className='rounded-lg bg-kingdom-gold px-3 py-2 text-sm font-semibold text-kingdom-charcoal disabled:opacity-60'
                                                                                >
                                                                                        {submittingId === payment._id ? "يتم الإرسال..." : "إرسال الإيصال"}
                                                                                </button>
                                                                                <p className='text-[11px] text-kingdom-cream/60'>TODO: ربط الرفع مع نظام تخزين ملفات فعلي.</p>
                                                                        </div>
                                                                )}

                                                                {payment.status !== "awaiting_receipt" && (
                                                                        <div className='text-right text-xs text-kingdom-cream/60'>
                                                                                آخر تحديث: {new Date(payment.updatedAt).toLocaleString()}
                                                                        </div>
                                                                )}
                                                        </div>
                                                </div>
                                        ))}
                                </div>
                        )}
                </div>
        );
};

const StudentProfilePage = () => {
        const { t, i18n } = useTranslation();
        const [profile, setProfile] = useState(null);
        const [formState, setFormState] = useState(emptyProfileState);
        const [loading, setLoading] = useState(true);
        const [saving, setSaving] = useState(false);

        const statusOptions = useMemo(
                () => [
                        { value: "", label: "Select" },
                        { value: "searchingPartner", label: "بحث عن شريك" },
                        { value: "notSearching", label: "لا أبحث الآن" },
                        { value: "needsHelp", label: "أحتاج مساعدة" },
                        { value: "readyToHelp", label: "جاهز للمساعدة" },
                ],
                []
        );

        const fetchProfile = async () => {
                setLoading(true);
                try {
                        const data = await apiClient.get("/student/profile");
                        setProfile(data);
                        if (data) {
                                setFormState({
                                        college: data.college || "",
                                        major: data.major || "",
                                        level: data.level || "",
                                        currentSubjectsText: (data.currentSubjects || []).join(","),
                                        statusForPartners: data.statusForPartners || "",
                                        statusForHelp: data.statusForHelp || "",
                                        studyTimesText: (data.studyTimes || []).join(","),
                                });
                        } else {
                                setFormState(emptyProfileState);
                        }
                } catch (error) {
                        console.error(error);
                        toast.error("Failed to load profile");
                } finally {
                        setLoading(false);
                }
        };

        useEffect(() => {
                fetchProfile();
        }, []);

        useEffect(() => {
                document.title = t("page.studentProfile.title") || "Moltaqa";
        }, [i18n.language, t]);

        const handleSubmit = async (e) => {
                e.preventDefault();
                setSaving(true);

                const payload = {
                        college: formState.college || undefined,
                        major: formState.major || undefined,
                        level: formState.level || undefined,
                        currentSubjects: formState.currentSubjectsText
                                .split(",")
                                .map((s) => s.trim())
                                .filter(Boolean),
                        statusForPartners: formState.statusForPartners || undefined,
                        statusForHelp: formState.statusForHelp || undefined,
                        studyTimes: formState.studyTimesText
                                .split(",")
                                .map((s) => s.trim())
                                .filter(Boolean),
                };

                try {
                        const method = profile ? apiClient.put : apiClient.post;
                        const saved = await method("/student/profile", payload);
                        setProfile(saved);
                        toast.success("Profile saved");
                } catch (error) {
                        console.error(error);
                        toast.error(error.response?.data?.message || "Could not save profile");
                } finally {
                        setSaving(false);
                }
        };

        return (
                <div className='relative min-h-screen bg-gradient-to-b from-[#0A050D] via-kingdom-plum/70 to-[#010104] text-kingdom-cream'>
                        <div className='relative z-10 mx-auto flex max-w-5xl flex-col gap-6 px-4 pb-24 pt-24 sm:px-6 lg:px-8'>
                                <h1 className='text-4xl font-bold text-kingdom-gold'>{t("page.studentProfile.heading")}</h1>
                                <p className='text-kingdom-cream/80'>{t("student.profile.subtitle")}</p>

                                <div className='rounded-2xl border border-kingdom-gold/20 bg-black/40 p-6 shadow-royal-soft'>
                                        <div className='flex flex-col gap-1'>
                                                <h2 className='text-2xl font-semibold text-kingdom-gold'>{t("page.studentProfile.heading")}</h2>
                                                <p className='text-kingdom-cream/70'>
                                                        Share your academic context. These basics help us match you later.
                                                </p>
                                        </div>

                                        {loading ? (
                                                <p className='mt-4 text-kingdom-cream/70'>{t("common.loading")}</p>
                                        ) : (
                                                <form className='mt-4 grid gap-4 sm:grid-cols-2' onSubmit={handleSubmit}>
                                                        <label className='flex flex-col gap-1 text-sm'>
                                                                <span>{t("student.college") || "College"}</span>
                                                                <input
                                                                        className='rounded-lg border border-kingdom-gold/30 bg-kingdom-charcoal/40 p-2 text-white'
                                                                        value={formState.college}
                                                                        onChange={(e) => setFormState({ ...formState, college: e.target.value })}
                                                                        placeholder='College ID or name'
                                                                />
                                                        </label>
                                                        <label className='flex flex-col gap-1 text-sm'>
                                                                <span>{t("student.major") || "Major"}</span>
                                                                <input
                                                                        className='rounded-lg border border-kingdom-gold/30 bg-kingdom-charcoal/40 p-2 text-white'
                                                                        value={formState.major}
                                                                        onChange={(e) => setFormState({ ...formState, major: e.target.value })}
                                                                        placeholder='Major ID or name'
                                                                />
                                                        </label>
                                                        <label className='flex flex-col gap-1 text-sm'>
                                                                <span>{t("common.level")}</span>
                                                                <input
                                                                        className='rounded-lg border border-kingdom-gold/30 bg-kingdom-charcoal/40 p-2 text-white'
                                                                        value={formState.level}
                                                                        onChange={(e) => setFormState({ ...formState, level: e.target.value })}
                                                                        placeholder='e.g. Freshman / Level 3'
                                                                />
                                                        </label>
                                                        <label className='flex flex-col gap-1 text-sm'>
                                                                <span>{t("common.subject")}</span>
                                                                <input
                                                                        className='rounded-lg border border-kingdom-gold/30 bg-kingdom-charcoal/40 p-2 text-white'
                                                                        value={formState.currentSubjectsText}
                                                                        onChange={(e) =>
                                                                                setFormState({ ...formState, currentSubjectsText: e.target.value })
                                                                        }
                                                                        placeholder='Comma separated subject IDs'
                                                                />
                                                                <span className='text-xs text-kingdom-cream/60'>TODO: replace with validated subject picker.</span>
                                                        </label>
                                                        <label className='flex flex-col gap-1 text-sm'>
                                                                <span>Status for partners</span>
                                                                <select
                                                                        className='rounded-lg border border-kingdom-gold/30 bg-kingdom-charcoal/40 p-2 text-white'
                                                                        value={formState.statusForPartners}
                                                                        onChange={(e) => setFormState({ ...formState, statusForPartners: e.target.value })}
                                                                >
                                                                        {statusOptions.map((opt) => (
                                                                                <option key={opt.value} value={opt.value}>
                                                                                        {opt.label}
                                                                                </option>
                                                                        ))}
                                                                </select>
                                                        </label>
                                                        <label className='flex flex-col gap-1 text-sm'>
                                                                <span>Status for help</span>
                                                                <select
                                                                        className='rounded-lg border border-kingdom-gold/30 bg-kingdom-charcoal/40 p-2 text-white'
                                                                        value={formState.statusForHelp}
                                                                        onChange={(e) => setFormState({ ...formState, statusForHelp: e.target.value })}
                                                                >
                                                                        {statusOptions.map((opt) => (
                                                                                <option key={opt.value} value={opt.value}>
                                                                                        {opt.label}
                                                                                </option>
                                                                        ))}
                                                                </select>
                                                        </label>
                                                        <label className='flex flex-col gap-1 text-sm sm:col-span-2'>
                                                                <span>{t("student.studyTimes") || "Preferred study times"}</span>
                                                                <input
                                                                        className='rounded-lg border border-kingdom-gold/30 bg-kingdom-charcoal/40 p-2 text-white'
                                                                        value={formState.studyTimesText}
                                                                        onChange={(e) => setFormState({ ...formState, studyTimesText: e.target.value })}
                                                                        placeholder='e.g. weekends, evenings'
                                                                />
                                                        </label>
                                                        <div className='sm:col-span-2'>
                                                                <button
                                                                        type='submit'
                                                                        className='w-full rounded-lg bg-kingdom-gold px-4 py-2 text-sm font-semibold text-kingdom-charcoal'
                                                                        disabled={saving}
                                                                >
                                                                        {saving ? t("common.loading") : t("common.save")}
                                                                </button>
                                                        </div>
                                                </form>
                                        )}
                                </div>

                                <StudentAdsPanel />
                                <StudentPaymentsPanel />
                        </div>
                </div>
        );
};

export default StudentProfilePage;
