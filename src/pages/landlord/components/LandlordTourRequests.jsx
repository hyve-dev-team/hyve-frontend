import React, { useState, useEffect } from "react";
import {
    Calendar,
    Clock,
    User,
    Phone,
    CheckCircle2,
    RotateCcw,
    XCircle,
    ExternalLink,
    Building2,
    RefreshCw,
    MessageSquare,
} from "lucide-react";
import { getLandlordInspections, respondToLandlordInspection } from "../../../utils/inspectionApi";
import { hyveSuccess, hyveError } from "../../../utils/hyveToast";

const LandlordTourRequests = () => {
    const [inspections, setInspections] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoadingId, setActionLoadingId] = useState(null);

    // Reschedule Modal state
    const [rescheduleTarget, setRescheduleTarget] = useState(null);
    const [proposedDate, setProposedDate] = useState("");
    const [proposedTime, setProposedTime] = useState("");
    const [notes, setNotes] = useState("");

    const fetchInspections = async () => {
        setIsLoading(true);
        try {
            const data = await getLandlordInspections();
            setInspections(data || []);
        } catch (err) {
            console.error("Failed to load inspections:", err);
            setInspections([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchInspections();
    }, []);

    const handleAccept = async (id, tenantName) => {
        setActionLoadingId(id);
        try {
            await respondToLandlordInspection(id, { action: "ACCEPT" });
            hyveSuccess("Tour Confirmed!", `Inspection confirmed for ${tenantName}.`);
            fetchInspections();
        } catch (err) {
            hyveError("Error", err.message || "Failed to accept inspection.");
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleDecline = async (id, tenantName) => {
        if (!window.confirm(`Decline viewing request for ${tenantName}?`)) return;
        setActionLoadingId(id);
        try {
            await respondToLandlordInspection(id, { action: "DECLINE" });
            hyveSuccess("Tour Declined", `Viewing request for ${tenantName} was declined.`);
            fetchInspections();
        } catch (err) {
            hyveError("Error", err.message || "Failed to decline inspection.");
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleRescheduleSubmit = async (e) => {
        e.preventDefault();
        if (!rescheduleTarget || !proposedDate || !proposedTime) return;

        setActionLoadingId(rescheduleTarget.id);
        try {
            await respondToLandlordInspection(rescheduleTarget.id, {
                action: "PROPOSE_TIME",
                proposedDate,
                proposedTime,
                notes,
            });
            hyveSuccess(
                "Reschedule Proposed!",
                `Proposed ${proposedDate} at ${proposedTime} to ${rescheduleTarget.tenantFullName}.`
            );
            setRescheduleTarget(null);
            setProposedDate("");
            setProposedTime("");
            setNotes("");
            fetchInspections();
        } catch (err) {
            hyveError("Error", err.message || "Failed to propose new time.");
        } finally {
            setActionLoadingId(null);
        }
    };

    const pendingCount = inspections.filter((i) => i.status === "PENDING").length;

    return (
        <div className="mt-8 bg-white rounded-2xl border border-[#E5E7EB] p-5 sm:p-6 shadow-xs">
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F3F4F6]">
                <div>
                    <div className="flex items-center gap-2">
                        <h3 className="font-poppins text-lg font-bold text-[#1F2937]">
                            Tenant Tour Inspection Requests
                        </h3>
                        {pendingCount > 0 && (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FEF6EE] text-[#F79009] border border-[#F79009]/30">
                                {pendingCount} Pending
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-[#6B7280] mt-0.5">
                        Accept, reschedule, or manage live in-person inspection appointments for your properties.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={fetchInspections}
                    disabled={isLoading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-semibold border border-gray-200 transition-colors self-start sm:self-auto cursor-pointer"
                >
                    <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
                    <span>Refresh</span>
                </button>
            </div>

            {/* List Content */}
            <div className="mt-4">
                {isLoading ? (
                    <div className="py-12 text-center text-xs text-gray-400">
                        Loading tour requests...
                    </div>
                ) : inspections.length === 0 ? (
                    <div className="py-10 text-center flex flex-col items-center justify-center gap-2 text-gray-400">
                        <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 mb-1">
                            <Calendar size={24} />
                        </div>
                        <p className="text-sm font-semibold text-gray-700">No Tour Requests Yet</p>
                        <p className="text-xs max-w-sm">
                            When prospective tenants schedule an in-person viewing of your properties, their requests will appear here for you to accept or reschedule.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {inspections.map((item) => {
                            const isActionLoading = actionLoadingId === item.id;

                            return (
                                <div
                                    key={item.id}
                                    className="p-4 rounded-xl border border-gray-100 bg-gray-50/60 hover:bg-gray-50 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                                >
                                    {/* Left: Tenant & Property Details */}
                                    <div className="space-y-2 flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                                                <User size={15} className="text-[#FA6400]" />
                                                <span>{item.tenantFullName || "Prospective Tenant"}</span>
                                            </span>
                                            {item.tenantPhoneNumber && (
                                                <a
                                                    href={`tel:${item.tenantPhoneNumber}`}
                                                    className="text-xs text-gray-500 hover:text-gray-900 font-mono flex items-center gap-1"
                                                >
                                                    <Phone size={12} />
                                                    <span>{item.tenantPhoneNumber}</span>
                                                </a>
                                            )}
                                        </div>

                                        <p className="text-xs font-medium text-gray-700 flex items-center gap-1.5">
                                            <Building2 size={14} className="text-gray-400 shrink-0" />
                                            <span className="truncate">{item.propertyTitle || "Apartment"}</span>
                                        </p>

                                        {/* Scheduled Time */}
                                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
                                            <span className="inline-flex items-center gap-1 font-semibold text-gray-800 bg-white px-2.5 py-1 rounded-lg border border-gray-200">
                                                <Calendar size={13} className="text-[#FA6400]" />
                                                <span>{item.tourDate}</span>
                                            </span>
                                            <span className="inline-flex items-center gap-1 font-semibold text-gray-800 bg-white px-2.5 py-1 rounded-lg border border-gray-200">
                                                <Clock size={13} className="text-[#FA6400]" />
                                                <span>{item.tourTime}</span>
                                            </span>

                                            {/* Proposed new time banner if active */}
                                            {item.proposedDate && (
                                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
                                                    Reschedule Sent: {item.proposedDate} at {item.proposedTime}
                                                </span>
                                            )}
                                        </div>

                                        {item.agentNotes && (
                                            <p className="text-xs text-gray-500 italic bg-white/80 p-2 rounded-lg border border-gray-100">
                                                Notes: "{item.agentNotes}"
                                            </p>
                                        )}
                                    </div>

                                    {/* Right: Status badge & Actions */}
                                    <div className="flex flex-wrap items-center gap-2 self-start lg:self-center shrink-0">
                                        {/* Status badge */}
                                        {item.status === "ACCEPTED" && (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#E6F8EF] text-[#12B76A] border border-emerald-200">
                                                <CheckCircle2 size={13} />
                                                <span>Confirmed</span>
                                            </span>
                                        )}
                                        {item.status === "PROPOSED_NEW_TIME" && (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                                                <RotateCcw size={13} />
                                                <span>Awaiting Tenant Approval</span>
                                            </span>
                                        )}
                                        {item.status === "DECLINED" && (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#FEECEB] text-[#F04438] border border-rose-200">
                                                <XCircle size={13} />
                                                <span>Declined</span>
                                            </span>
                                        )}

                                        {/* Interactive Buttons for PENDING */}
                                        {item.status === "PENDING" && (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => handleAccept(item.id, item.tenantFullName)}
                                                    disabled={isActionLoading}
                                                    className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
                                                >
                                                    <CheckCircle2 size={14} />
                                                    <span>Accept</span>
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setRescheduleTarget(item);
                                                        setProposedDate(item.tourDate || "");
                                                        setProposedTime(item.tourTime || "");
                                                    }}
                                                    disabled={isActionLoading}
                                                    className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-white hover:bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
                                                >
                                                    <RotateCcw size={14} />
                                                    <span>Reschedule</span>
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => handleDecline(item.id, item.tenantFullName)}
                                                    disabled={isActionLoading}
                                                    className="inline-flex items-center gap-1 px-2.5 py-2 rounded-xl bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                                                >
                                                    <XCircle size={14} />
                                                </button>
                                            </>
                                        )}

                                        {/* Direct viewing token link */}
                                        {item.viewingToken && (
                                            <a
                                                href={`/inspections/view/${item.viewingToken}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 text-xs font-semibold transition-all shadow-xs"
                                                title="Open Viewing Link"
                                            >
                                                <span>Viewing Link</span>
                                                <ExternalLink size={12} />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Reschedule Modal */}
            {rescheduleTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                            <div>
                                <span className="text-[11px] font-bold text-[#FA6400] uppercase tracking-wider block">
                                    Reschedule Tour Inspection
                                </span>
                                <h4 className="text-base font-bold text-gray-900 font-poppins">
                                    {rescheduleTarget.tenantFullName}
                                </h4>
                            </div>
                            <button
                                type="button"
                                onClick={() => setRescheduleTarget(null)}
                                className="text-gray-400 hover:text-gray-700 p-1"
                            >
                                <XCircle size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleRescheduleSubmit} className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-gray-700 block mb-1">
                                    Proposed New Date *
                                </label>
                                <input
                                    type="date"
                                    required
                                    min={new Date().toISOString().split("T")[0]}
                                    value={proposedDate}
                                    onChange={(e) => setProposedDate(e.target.value)}
                                    className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#FA6400] focus:bg-white"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-gray-700 block mb-1">
                                    Proposed New Time *
                                </label>
                                <input
                                    type="time"
                                    required
                                    value={proposedTime}
                                    onChange={(e) => setProposedTime(e.target.value)}
                                    className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#FA6400] focus:bg-white"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-gray-700 block mb-1">
                                    Note to Tenant (optional)
                                </label>
                                <textarea
                                    rows={2}
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="e.g. Caretaker will be on site starting 2:00 PM."
                                    className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#FA6400] focus:bg-white"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setRescheduleTarget(null)}
                                    className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={actionLoadingId != null || !proposedDate || !proposedTime}
                                    className="px-5 py-2 rounded-xl text-xs font-bold bg-[#FA6400] hover:bg-[#E05300] text-white shadow-xs disabled:opacity-50"
                                >
                                    Send Proposal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LandlordTourRequests;
