import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    Calendar,
    Clock,
    MapPin,
    Phone,
    User,
    CheckCircle2,
    XCircle,
    RotateCcw,
    Building2,
    ShieldCheck,
    AlertCircle,
    ExternalLink
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { getPublicInspection, respondToPublicInspection, formatWhatsAppPhone } from '../../utils/inspectionApi';
import placeholderImage from '../../assets/images/apartments/apartment-image-1.png';
import hyveLogo from '../../assets/svg/logo/hyve-logo.svg';

const ViewingLinkPage = () => {
    const { token } = useParams();

    const [inspection, setInspection] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Response form states
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showProposeModal, setShowProposeModal] = useState(false);
    const [showDeclineModal, setShowDeclineModal] = useState(false);
    const [proposedDate, setProposedDate] = useState('');
    const [proposedTime, setProposedTime] = useState('');
    const [notes, setNotes] = useState('');
    const [successFeedback, setSuccessFeedback] = useState(null);

    const loadInspection = async () => {
        if (!token) {
            setError("No viewing token found in the URL.");
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const data = await getPublicInspection(token);
            setInspection(data);
        } catch (err) {
            console.error("Failed to load inspection:", err);
            setError(err?.message || "This viewing link is invalid, expired, or has been removed.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadInspection();
    }, [token]);

    const handleAccept = async () => {
        if (!window.confirm(`Confirm tour inspection on ${inspection.tourDate} at ${inspection.tourTime}?`)) return;

        setIsSubmitting(true);
        try {
            const updated = await respondToPublicInspection(token, { action: "ACCEPT" });
            setInspection(updated);
            setSuccessFeedback("Inspection Confirmed! The tenant has been notified that you will be available for this viewing.");
        } catch (err) {
            alert(err?.message || "Failed to confirm inspection.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleProposeTime = async (e) => {
        e.preventDefault();
        if (!proposedDate || !proposedTime) {
            alert("Please provide both a new date and time.");
            return;
        }

        setIsSubmitting(true);
        try {
            const updated = await respondToPublicInspection(token, {
                action: "PROPOSE_TIME",
                proposedDate,
                proposedTime,
                notes: notes.trim(),
            });
            setInspection(updated);
            setShowProposeModal(false);
            setSuccessFeedback(`New time proposed (${proposedDate} at ${proposedTime}). The tenant has been notified to accept your suggested time.`);
        } catch (err) {
            alert(err?.message || "Failed to propose new time.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDecline = async () => {
        setIsSubmitting(true);
        try {
            const updated = await respondToPublicInspection(token, {
                action: "DECLINE",
                notes: notes.trim(),
            });
            setInspection(updated);
            setShowDeclineModal(false);
            setSuccessFeedback("Tour declined. Hyve Operations and the tenant have been notified.");
        } catch (err) {
            alert(err?.message || "Failed to decline tour.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-4">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
                <p className="text-sm font-medium text-[#4B5563]">Loading inspection details...</p>
                <p className="text-xs text-[#9CA3AF] mt-1">Connecting to Hyve Verification Ledger</p>
            </div>
        );
    }

    if (error || !inspection) {
        return (
            <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-4">
                <div className="bg-white rounded-3xl border border-[#FECACA] p-8 max-w-md w-full text-center shadow-sm">
                    <AlertCircle className="w-12 h-12 text-[#DC2626] mx-auto mb-3" />
                    <h2 className="text-lg font-bold text-[#1F2937]">Invalid Viewing Link</h2>
                    <p className="text-xs sm:text-sm text-[#6B7280] mt-2 mb-6">
                        {error || "The viewing link is invalid or has expired."}
                    </p>
                    <Link
                        to="/"
                        className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-primary hover:bg-primary-hover smooth-transition inline-block"
                    >
                        Go to Hyve Homepage
                    </Link>
                </div>
            </div>
        );
    }

    const cleanTenantPhone = formatWhatsAppPhone(inspection.tenantPhoneNumber);

    return (
        <div className="min-h-screen bg-[#F9FAFB] py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-xl mx-auto">
                {/* BRAND HEADER */}
                <div className="text-center mb-6">
                    <img src={hyveLogo} alt="Hyve" className="h-8 mx-auto mb-2" />
                    <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Verified Inspection Request
                    </span>
                </div>

                {/* SUCCESS TOAST MESSAGE */}
                {successFeedback && (
                    <div className="mb-6 p-4 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] text-xs sm:text-sm flex items-start gap-3 shadow-sm animate-fadeIn">
                        <CheckCircle2 className="w-5 h-5 text-[#059669] shrink-0 mt-0.5" />
                        <p className="leading-relaxed font-medium">{successFeedback}</p>
                    </div>
                )}

                {/* MAIN INSPECTION CARD */}
                <div className="bg-white rounded-3xl border border-[#EAEAEA] shadow-sm overflow-hidden mb-6">
                    {/* APARTMENT PHOTO & TITLE */}
                    <div className="relative h-44 sm:h-52 bg-black/5">
                        <img
                            src={inspection.propertyImage || placeholderImage}
                            alt={inspection.propertyTitle}
                            onError={(e) => { e.target.onerror = null; e.target.src = placeholderImage; }}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                        <div className="absolute bottom-4 left-4 right-4 text-white">
                            <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-primary text-white shadow-sm inline-block mb-1.5">
                                {inspection.propertyPrice || "Available for Rent"}
                            </span>
                            <h1 className="text-lg sm:text-xl font-bold font-poppins leading-tight truncate">
                                {inspection.propertyTitle}
                            </h1>
                            <p className="text-xs text-white/90 flex items-center gap-1 mt-1 truncate">
                                <MapPin className="w-3.5 h-3.5 shrink-0" />
                                {inspection.propertyAddress}
                            </p>
                        </div>
                    </div>

                    <div className="p-5 sm:p-7 space-y-5">
                        {/* INSPECTION STATUS BADGE */}
                        <div className="flex items-center justify-between pb-4 border-b border-[#F3F4F6]">
                            <span className="text-xs font-medium text-[#6B7280]">Inspection Status:</span>
                            {inspection.status === 'ACCEPTED' ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed
                                </span>
                            ) : inspection.status === 'PROPOSED_NEW_TIME' ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]">
                                    <RotateCcw className="w-3.5 h-3.5" /> New Time Proposed
                                </span>
                            ) : inspection.status === 'DECLINED' ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]">
                                    <XCircle className="w-3.5 h-3.5" /> Tour Declined
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                                    <Clock className="w-3.5 h-3.5" /> Awaiting Your Response
                                </span>
                            )}
                        </div>

                        {/* SCHEDULED DATE & TIME */}
                        <div className="p-4 rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB]">
                            <p className="text-xs text-[#6B7280] font-medium mb-2">Requested Viewing Date & Time:</p>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                        <Calendar className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-[#9CA3AF] uppercase font-bold">Date</p>
                                        <p className="text-xs sm:text-sm font-bold text-[#1F2937]">{inspection.tourDate}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                        <Clock className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-[#9CA3AF] uppercase font-bold">Time</p>
                                        <p className="text-xs sm:text-sm font-bold text-[#1F2937]">{inspection.tourTime}</p>
                                    </div>
                                </div>
                            </div>

                            {inspection.proposedDate && (
                                <div className="mt-3 pt-3 border-t border-[#E5E7EB] text-xs text-[#D97706]">
                                    <span className="font-bold">Agent Proposed Time:</span> {inspection.proposedDate} at {inspection.proposedTime}
                                </div>
                            )}

                            {inspection.agentNotes && (
                                <div className="mt-2 text-xs text-[#4B5563] italic">
                                    Notes: "{inspection.agentNotes}"
                                </div>
                            )}
                        </div>

                        {/* TENANT CONTACT CARD */}
                        <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB]">
                            <p className="text-xs text-[#6B7280] font-medium mb-3">Prospective Tenant Information:</p>
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-[#F3F4F6] text-[#4B5563] flex items-center justify-center font-bold text-sm">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-[#1F2937]">{inspection.tenantFullName}</h4>
                                        <p className="text-xs text-[#6B7280] font-mono">{inspection.tenantPhoneNumber}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {cleanTenantPhone && (
                                        <a
                                            href={`https://wa.me/${cleanTenantPhone}?text=${encodeURIComponent(`Hello ${inspection.tenantFullName}, regarding your tour request for ${inspection.propertyTitle}...`)}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="p-2.5 rounded-xl bg-[#ECFDF5] text-[#059669] hover:bg-[#D1FAE5] smooth-transition"
                                            title="Chat with tenant on WhatsApp"
                                        >
                                            <FaWhatsapp className="w-4 h-4" />
                                        </a>
                                    )}

                                    {inspection.tenantPhoneNumber && (
                                        <a
                                            href={`tel:${inspection.tenantPhoneNumber}`}
                                            className="p-2.5 rounded-xl bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB] smooth-transition"
                                            title="Call tenant"
                                        >
                                            <Phone className="w-4 h-4" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* ASSIGNED AGENT INDICATOR */}
                        <div className="text-[11px] text-[#9CA3AF] text-center pt-2">
                            Assigned Contact: <span className="font-semibold text-[#4B5563]">{inspection.assignedContactName}</span> ({inspection.assignedContactType})
                        </div>

                        {/* ACTION BUTTONS (ACCEPT / PROPOSE / DECLINE) */}
                        {inspection.status === 'PENDING' && (
                            <div className="pt-3 border-t border-[#F3F4F6] space-y-2.5">
                                <button
                                    type="button"
                                    onClick={handleAccept}
                                    disabled={isSubmitting}
                                    className="w-full py-3.5 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-primary-hover shadow-md smooth-transition flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                    Accept Tour Inspection
                                </button>

                                <div className="grid grid-cols-2 gap-2.5">
                                    <button
                                        type="button"
                                        onClick={() => setShowProposeModal(true)}
                                        disabled={isSubmitting}
                                        className="w-full py-2.5 rounded-xl text-xs font-semibold text-[#374151] bg-[#F9FAFB] hover:bg-[#F3F4F6] border border-[#D1D5DB] smooth-transition flex items-center justify-center gap-1.5"
                                    >
                                        <RotateCcw className="w-3.5 h-3.5 text-[#6B7280]" />
                                        Propose New Time
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setShowDeclineModal(true)}
                                        disabled={isSubmitting}
                                        className="w-full py-2.5 rounded-xl text-xs font-semibold text-[#DC2626] bg-[#FEF2F2] hover:bg-[#FEE2E2] border border-[#FECACA] smooth-transition flex items-center justify-center gap-1.5"
                                    >
                                        <XCircle className="w-3.5 h-3.5 text-[#DC2626]" />
                                        Decline Tour
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ESCROW & SECURITY FOOTER */}
                <div className="text-center text-xs text-[#9CA3AF] flex items-center justify-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#059669]" />
                    Hyve Escrow Protected & Verified Inspection Portal
                </div>
            </div>

            {/* MODAL: PROPOSE NEW TIME */}
            {showProposeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
                    <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-xl border border-black/10">
                        <h3 className="text-base font-bold text-[#1F2937]">Propose a New Inspection Time</h3>
                        <p className="text-xs text-[#6B7280] mt-1 mb-4">
                            Suggest an alternative date and time for the tenant. They will be notified to accept your proposed schedule.
                        </p>

                        <form onSubmit={handleProposeTime} className="space-y-3.5">
                            <div>
                                <label className="block text-xs font-medium text-[#4B5563] mb-1">New Date *</label>
                                <input
                                    type="date"
                                    min={new Date().toISOString().split('T')[0]}
                                    value={proposedDate}
                                    onChange={(e) => setProposedDate(e.target.value)}
                                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#D1D5DB] rounded-xl outline-none focus:border-primary"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-[#4B5563] mb-1">New Time *</label>
                                <input
                                    type="time"
                                    value={proposedTime}
                                    onChange={(e) => setProposedTime(e.target.value)}
                                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#D1D5DB] rounded-xl outline-none focus:border-primary"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-[#4B5563] mb-1">Reason / Note for Tenant (Optional)</label>
                                <textarea
                                    rows="2"
                                    placeholder="e.g. I will be on site starting 2:00 PM..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="w-full px-3.5 py-2 text-xs bg-white border border-[#D1D5DB] rounded-xl outline-none focus:border-primary resize-none"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F3F4F6]">
                                <button
                                    type="button"
                                    onClick={() => setShowProposeModal(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-semibold text-[#4B5563] bg-white border border-[#D1D5DB]"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-primary hover:bg-primary-hover shadow-sm disabled:opacity-50"
                                >
                                    {isSubmitting ? "Sending..." : "Submit New Time"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: DECLINE TOUR */}
            {showDeclineModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
                    <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-xl border border-black/10">
                        <div className="w-10 h-10 rounded-full bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center mx-auto mb-3">
                            <XCircle className="w-6 h-6" />
                        </div>
                        <h3 className="text-base font-bold text-center text-[#1F2937]">Decline This Tour Request?</h3>
                        <p className="text-xs text-center text-[#6B7280] mt-1 mb-4">
                            If you are unavailable or the property cannot be inspected, Hyve Operations will be alerted to assist the tenant.
                        </p>

                        <div className="mb-4">
                            <label className="block text-xs font-medium text-[#4B5563] mb-1">Reason (Optional)</label>
                            <textarea
                                rows="2"
                                placeholder="e.g. Currently undergoing renovation..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="w-full px-3.5 py-2 text-xs bg-white border border-[#D1D5DB] rounded-xl outline-none focus:border-primary resize-none"
                            />
                        </div>

                        <div className="flex items-center justify-center gap-2">
                            <button
                                type="button"
                                onClick={() => setShowDeclineModal(false)}
                                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#4B5563] bg-white border border-[#D1D5DB]"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDecline}
                                disabled={isSubmitting}
                                className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-[#DC2626] hover:bg-[#B91C1C] shadow-sm disabled:opacity-50"
                            >
                                {isSubmitting ? "Declining..." : "Confirm Decline"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ViewingLinkPage;
