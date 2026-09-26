import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Sidebar from "./components/layout/Sidebar/Sidebar";
import Header from "./components/layout/Dashboard/Header";
import MobileNavigationTab from "./components/layout/MobileNavigation/MobileNavigationTab";
import ConfirmPayment from "./components/layout/Reservation/ConfirmPayment";
import ReversePayment from "./components/layout/Reservation/ReversePayment";
import PostScheduleTour from "./components/layout/Reservation/PostScheduleTour";
import TourSchedule from "./components/layout/Reservation/TourSchedule";
import useFetchApartment from "../../hooks/useFetchApartment";
import PayInspectionModal from "../../components/queue/PayInspectionModal";
import {
  bookTourInspection,
  getPropertyInspection,
  acceptProposedInspectionTime,
  payTourInspectionFee,
  formatWhatsAppPhone,
} from "../../utils/inspectionApi";
import { hyveSuccess, hyveError } from "../../utils/hyveToast";
import {
  calculateInspectionFee,
  formatNaira,
} from "../../utils/feeCalculations";
import {
  Calendar,
  Clock,
  User,
  Phone,
  Copy,
  Check,
  CheckCircle2,
  RotateCcw,
  XCircle,
  Building2,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  Lock,
  CreditCard,
} from "lucide-react";
import { FaWhatsapp, FaUserTie } from "react-icons/fa";
import placeholderImage from "../../assets/images/apartments/apartment-image-1.png";

const ScheduleTour = () => {
  const { apartmentID } = useParams();
  const navigate = useNavigate();

  // Apartment details
  const { apartment, isLoading: isApartmentLoading } =
    useFetchApartment(apartmentID);

  // Cached tenant profile
  const cachedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  })();

  // Form states
  const [tourDate, setTourDate] = useState("");
  const [tourTime, setTourTime] = useState("");
  const [tenantName, setTenantName] = useState(
    cachedUser
      ? `${cachedUser.firstName || ""} ${cachedUser.lastName || ""}`.trim()
      : "",
  );
  const [tenantPhone, setTenantPhone] = useState(cachedUser?.phone || "");
  const [dateError, setDateError] = useState(false);
  const [timeError, setTimeError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active inspection state
  const [inspection, setInspection] = useState(null);
  const [isPolling, setIsPolling] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Countdown & Post-Tour payment modals
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    mins: 0,
    seconds: 0,
  });
  const [countdownElapsed, setCountdownElapsed] = useState(false);
  const [isConfirmPayment, setIsConfirmPayment] = useState(false);
  const [isReversePayment, setIsReversePayment] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const inspectionFee = calculateInspectionFee(apartment || inspection);

  // Load active inspection if previously booked
  const syncActiveInspection = useCallback(async () => {
    if (!apartmentID) return;
    try {
      const active = await getPropertyInspection(apartmentID);
      if (active) {
        setInspection(active);
        setTourDate(active.tourDate || "");
        setTourTime(active.tourTime || "");
      }
    } catch (err) {
      console.warn("No active inspection:", err?.message);
    }
  }, [apartmentID]);

  useEffect(() => {
    syncActiveInspection();
  }, [syncActiveInspection]);

  // Polling for live agent responses (every 10s if PENDING or PROPOSED_NEW_TIME)
  useEffect(() => {
    if (
      !inspection ||
      inspection.status === "COMPLETED" ||
      inspection.status === "CANCELLED"
    )
      return;

    const interval = setInterval(async () => {
      try {
        const updated = await getPropertyInspection(apartmentID);
        if (updated && updated.status !== inspection.status) {
          setInspection(updated);
          if (updated.status === "ACCEPTED") {
            hyveSuccess(
              "Tour Confirmed! 🎉",
              `${updated.assignedContactName} accepted your inspection.`,
            );
          } else if (updated.status === "PROPOSED_NEW_TIME") {
            hyveSuccess(
              "Agent Proposed New Time",
              `${updated.assignedContactName} suggested ${updated.proposedDate} at ${updated.proposedTime}.`,
            );
          }
        }
      } catch {
        // silent
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [apartmentID, inspection]);

  // Countdown timer calculation
  useEffect(() => {
    if (inspection && inspection.tourDate && inspection.tourTime) {
      const timer = setInterval(() => {
        const now = new Date().getTime();
        const scheduledDateTime = new Date(
          `${inspection.tourDate}T${inspection.tourTime}`,
        ).getTime();

        if (isNaN(scheduledDateTime)) {
          clearInterval(timer);
          return;
        }

        const distance = scheduledDateTime - now;
        if (distance < 0) {
          clearInterval(timer);
          setCountdown({ days: 0, hours: 0, mins: 0, seconds: 0 });
          setCountdownElapsed(true);
        } else {
          setCountdown({
            days: Math.floor(distance / (1000 * 60 * 60 * 24)),
            hours: Math.floor(
              (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
            ),
            mins: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((distance % (1000 * 60)) / 1000),
          });
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [inspection]);

  // Submit Tour Booking
  const handleSubmit = async (e) => {
    e.preventDefault();
    setDateError(false);
    setTimeError(false);

    if (!tourDate) {
      setDateError(true);
      return;
    }
    if (!tourTime) {
      setTimeError(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await bookTourInspection({
        propertyId: apartmentID,
        tourDate,
        tourTime,
        tenantFullName: tenantName.trim() || "Prospective Tenant",
        tenantPhoneNumber: tenantPhone.trim(),
      });

      setInspection(data);
      hyveSuccess(
        "Tour Scheduled!",
        `Inspection request created for ${tourDate} at ${tourTime}.`,
      );

      // Prompt user to pay the ₦5,000 inspection fee to unlock agent phone number
      if (!data.inspectionFeePaid) {
        setIsPaymentModalOpen(true);
      } else if (data.whatsappUrl) {
        window.open(data.whatsappUrl, "_blank");
      }
    } catch (err) {
      hyveError(
        "Booking Failed",
        err?.message || "Could not schedule tour. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Accept Agent's proposed time
  const handleAcceptProposedTime = async () => {
    if (!inspection?.id) return;
    setIsSubmitting(true);
    try {
      const updated = await acceptProposedInspectionTime(inspection.id);
      setInspection(updated);
      hyveSuccess(
        "Time Accepted",
        `Tour confirmed for ${updated.tourDate} at ${updated.tourTime}!`,
      );
    } catch (err) {
      hyveError("Error", err?.message || "Could not accept proposed time.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Pay Inspection Fee to Unlock Agent Number
  const handleConfirmInspectionFeePayment = async () => {
    if (!inspection?.id) return;
    try {
      const updated = await payTourInspectionFee(inspection.id);
      setInspection(updated);
      hyveSuccess(
        "Agent Contact Unlocked!",
        "Phone number and direct WhatsApp messaging are now available.",
      );
      if (updated.whatsappUrl) {
        window.open(updated.whatsappUrl, "_blank");
      }
    } catch (err) {
      hyveError(
        "Payment Failed",
        err?.message || "Could not complete fee payment.",
      );
    } finally {
      setIsPaymentModalOpen(false);
    }
  };

  const handleCopyViewingLink = () => {
    if (!inspection?.viewingUrl) return;
    navigator.clipboard.writeText(inspection.viewingUrl);
    setCopiedLink(true);
    hyveSuccess("Link Copied", "Viewing link copied to clipboard.");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCancelInspection = () => {
    setInspection(null);
    setTourDate("");
    setTourTime("");
  };

  const cleanAgentPhone =
    inspection?.inspectionFeePaid &&
    inspection?.assignedContactPhone &&
    !inspection.assignedContactPhone.includes("Locked")
      ? formatWhatsAppPhone(inspection.assignedContactPhone)
      : "";

  return (
    <div className="page-wrapper">
      <div className="flex">
        <Sidebar currentPage="home" />

        <main className="w-full h-[100svh] sm:w-[70%] lg:w-[80%] overflow-auto">
          <Header />

          <div className="px-3 sm:px-6 lg:px-8 py-8 max-w-4xl mx-auto">
            {/* BREADCRUMB / BACK */}
            <div className="mb-6 flex items-center justify-between">
              <Link
                to={`/user/apartment/${apartmentID}`}
                className="text-xs text-[#6B7280] hover:text-primary smooth-transition flex items-center gap-1.5"
              >
                ← Back to Apartment Details
              </Link>

              <span className="text-xs text-[#9CA3AF] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#059669]" />
                Hyve Verified Inspection
              </span>
            </div>

            {/* APARTMENT BANNER */}
            {apartment && (
              <div className="bg-white rounded-2xl border border-[#EAEAEA] p-4 sm:p-5 mb-8 flex items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-3.5 min-w-0">
                  <img
                    src={apartment.lodgeImage || placeholderImage}
                    alt={apartment.lodgeDesc}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = placeholderImage;
                    }}
                    className="w-16 h-16 rounded-xl object-cover shrink-0 bg-gray-100"
                  />
                  <div className="min-w-0">
                    <h2 className="text-sm sm:text-base font-bold text-[#1F2937] font-poppins truncate">
                      {apartment.lodgeDesc}
                    </h2>
                    <p className="text-xs text-[#6B7280] truncate mt-0.5">
                      {apartment.nearbyDistance || "Verified Location"}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-xs text-[#9CA3AF]">Rent</p>
                  <p className="text-sm sm:text-base font-bold text-primary font-montserrat">
                    ₦ {Number(apartment.price || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            {/* CASE 1: FORM TO SCHEDULE TOUR */}
            {!inspection ? (
              <div className="bg-white rounded-3xl border border-[#EAEAEA] p-6 sm:p-10 shadow-sm">
                <div className="text-center max-w-md mx-auto mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-primary-light text-primary flex items-center justify-center mx-auto mb-3 shadow-inner">
                    <Calendar className="w-7 h-7" />
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold text-[#1F2937] font-poppins">
                    Schedule Apartment Tour
                  </h1>
                  <p className="text-xs sm:text-sm text-[#6B7280] mt-1.5 leading-relaxed">
                    Select your preferred viewing date and time. An automated
                    inspection request and viewing link will be sent directly to
                    the property caretaker via WhatsApp.
                  </p>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="max-w-lg mx-auto space-y-4"
                >
                  {/* Tenant Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-[#4B5563] mb-1">
                        Your Full Name *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
                          <User className="w-4 h-4" />
                        </span>
                        <input
                          type="text"
                          value={tenantName}
                          onChange={(e) => setTenantName(e.target.value)}
                          placeholder="Enter full name"
                          className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-[#F9FAFB] border border-[#D1D5DB] rounded-xl outline-none focus:border-primary focus:bg-white"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#4B5563] mb-1">
                        Your Phone Number *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
                          <Phone className="w-4 h-4" />
                        </span>
                        <input
                          type="tel"
                          value={tenantPhone}
                          onChange={(e) => setTenantPhone(e.target.value)}
                          placeholder="e.g. 08012345678"
                          className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-[#F9FAFB] border border-[#D1D5DB] rounded-xl outline-none focus:border-primary focus:bg-white"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Tour Date & Time */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-[#4B5563] mb-1">
                        Inspection Date *
                      </label>
                      <input
                        type="date"
                        min={today}
                        value={tourDate}
                        onChange={(e) => setTourDate(e.target.value)}
                        className={`w-full px-3.5 py-2.5 text-xs bg-[#F9FAFB] border rounded-xl outline-none focus:border-primary focus:bg-white ${
                          dateError ? "border-[#EF4444]" : "border-[#D1D5DB]"
                        }`}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#4B5563] mb-1">
                        Inspection Time *
                      </label>
                      <input
                        type="time"
                        value={tourTime}
                        onChange={(e) => setTourTime(e.target.value)}
                        className={`w-full px-3.5 py-2.5 text-xs bg-[#F9FAFB] border rounded-xl outline-none focus:border-primary focus:bg-white ${
                          timeError ? "border-[#EF4444]" : "border-[#D1D5DB]"
                        }`}
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-primary hover:bg-primary-hover shadow-md smooth-transition flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
                  >
                    <FaWhatsapp className="w-4 h-4" />
                    {isSubmitting
                      ? "Generating Viewing Link..."
                      : "Book Tour & Notify Agent on WhatsApp"}
                  </button>

                  <p className="text-[11px] text-center text-[#9CA3AF] mt-3">
                    By booking, a unique inspection link is created allowing the
                    caretaker or property owner to confirm immediately.
                  </p>
                </form>
              </div>
            ) : (
              /* CASE 2: TOUR BOOKED - CONFIRMATION & LIVE TRACKER */
              <div className="space-y-6">
                {/* TOP CONFIRMATION BANNER */}
                <div className="bg-white rounded-3xl border border-[#EAEAEA] p-6 sm:p-8 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#F3F4F6]">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        {inspection.status === "ACCEPTED" ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed
                            by Agent
                          </span>
                        ) : inspection.status === "PROPOSED_NEW_TIME" ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]">
                            <RotateCcw className="w-3.5 h-3.5" /> Agent Proposed
                            New Time
                          </span>
                        ) : inspection.status === "DECLINED" ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]">
                            <XCircle className="w-3.5 h-3.5" /> Agent
                            Unavailable
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                            <Clock className="w-3.5 h-3.5" /> Tour Scheduled —
                            Pending Agent Reply
                          </span>
                        )}
                      </div>

                      <h2 className="text-xl sm:text-2xl font-bold text-[#1F2937] font-poppins">
                        {inspection.status === "ACCEPTED"
                          ? "Your Apartment Tour is Confirmed!"
                          : "Viewing Request Dispatched"}
                      </h2>
                      <p className="text-xs sm:text-sm text-[#6B7280] mt-1">
                        Scheduled for{" "}
                        <span className="font-semibold text-[#1F2937]">
                          {inspection.tourDate}
                        </span>{" "}
                        at{" "}
                        <span className="font-semibold text-[#1F2937]">
                          {inspection.tourTime}
                        </span>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleCancelInspection}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#6B7280] bg-[#F9FAFB] hover:bg-[#F3F4F6] border border-[#E5E7EB] self-start sm:self-auto"
                    >
                      Change Schedule
                    </button>
                  </div>

                  {/* PROPOSED NEW TIME ALERT (IF AGENT SUGGESTED ANOTHER TIME) */}
                  {inspection.status === "PROPOSED_NEW_TIME" && (
                    <div className="my-6 p-4 sm:p-5 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeIn">
                      <div className="flex items-start gap-3">
                        <span className="p-2 rounded-xl bg-[#F59E0B]/20 text-[#D97706] shrink-0 mt-0.5">
                          <RotateCcw className="w-5 h-5" />
                        </span>
                        <div>
                          <h3 className="text-xs sm:text-sm font-bold text-[#92400E]">
                            {inspection.assignedContactName} proposed an
                            alternative time:
                          </h3>
                          <p className="text-xs text-[#B45309] mt-0.5 font-medium">
                            📅 {inspection.proposedDate} at{" "}
                            {inspection.proposedTime}
                            {inspection.agentNotes &&
                              ` — "${inspection.agentNotes}"`}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleAcceptProposedTime}
                        disabled={isSubmitting}
                        className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#D97706] hover:bg-[#B45309] shadow-sm smooth-transition self-start sm:self-auto shrink-0"
                      >
                        {isSubmitting ? "Accepting..." : "Accept Proposed Time"}
                      </button>
                    </div>
                  )}

                  {/* ASSIGNED AGENT / CARETAKER CARD */}
                  <div className="mt-6 p-5 rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB]">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                        Inspection Handled By:
                      </p>
                      {inspection.inspectionFeePaid ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Contact Unlocked
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Fee Unpaid (Locked)
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-primary-light text-primary flex items-center justify-center font-bold text-lg shrink-0 shadow-sm">
                          {inspection.assignedContactName?.charAt(0) || "A"}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm sm:text-base font-bold text-[#1F2937]">
                              {inspection.assignedContactName}
                            </h4>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary">
                              {inspection.assignedContactType === "LANDLORD"
                                ? "Property Owner"
                                : inspection.assignedContactType === "ADMIN"
                                  ? "Hyve Support"
                                  : "Assigned Caretaker"}
                            </span>
                          </div>
                          <p className="text-xs text-[#6B7280] font-mono mt-0.5 flex items-center gap-1">
                            <span>Contact:</span>
                            {inspection.inspectionFeePaid ? (
                              <span className="text-[#1F2937] font-semibold">
                                {inspection.assignedContactPhone}
                              </span>
                            ) : (
                              <span className="text-amber-700 font-medium flex items-center gap-1">
                                <Lock className="w-3 h-3" />{" "}
                                {inspection.assignedContactPhone ||
                                  "••••••••••• (Locked)"}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                        {inspection.inspectionFeePaid ? (
                          <>
                            {cleanAgentPhone && (
                              <a
                                href={`https://wa.me/${cleanAgentPhone}?text=${encodeURIComponent(`Hello ${inspection.assignedContactName}, I scheduled a viewing for ${inspection.propertyTitle}...`)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#059669] bg-[#ECFDF5] hover:bg-[#D1FAE5] border border-[#A7F3D0] smooth-transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                              >
                                <FaWhatsapp className="w-3.5 h-3.5" />
                                WhatsApp Agent
                              </a>
                            )}

                            {inspection.assignedContactPhone && (
                              <a
                                href={`tel:${inspection.assignedContactPhone}`}
                                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#374151] bg-white hover:bg-[#F3F4F6] border border-[#D1D5DB] smooth-transition flex items-center gap-1.5 cursor-pointer"
                              >
                                <Phone className="w-3.5 h-3.5 text-[#6B7280]" />
                                Call Agent
                              </a>
                            )}
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setIsPaymentModalOpen(true)}
                            className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-hover active:scale-95 smooth-transition flex items-center gap-1.5 shadow-md shadow-primary/20 cursor-pointer"
                          >
                            <Lock className="w-3.5 h-3.5" />
                            Pay {formatNaira(inspectionFee.totalFee)} to Unlock
                            Contact
                          </button>
                        )}
                      </div>
                    </div>

                    {/* INSPECTION FEE PROMPT IF UNPAID */}
                    {!inspection.inspectionFeePaid && (
                      <div className="mt-4 p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
                        <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-semibold text-amber-900">
                            Inspection Payment Required
                          </p>
                          <p className="text-amber-700 text-[11px] mt-0.5">
                            Pay the {formatNaira(inspectionFee.totalFee)}{" "}
                            inspection fee to reveal the caretaker's direct
                            phone number and send them an instant WhatsApp
                            viewing invite.
                          </p>
                          <button
                            type="button"
                            onClick={() => setIsPaymentModalOpen(true)}
                            className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs smooth-transition cursor-pointer shadow-sm"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            Pay {formatNaira(inspectionFee.totalFee)} Now
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* UNIQUE VIEWING LINK BOX */}
                  <div className="mt-5 p-4 rounded-2xl bg-white border border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold text-[#6B7280] uppercase">
                        Unique Viewing Management Link:
                      </p>
                      <p className="text-xs font-mono text-[#374151] truncate mt-0.5">
                        {inspection.viewingUrl}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={handleCopyViewingLink}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#4B5563] bg-[#F3F4F6] hover:bg-[#E5E7EB] smooth-transition flex items-center gap-1.5"
                      >
                        {copiedLink ? (
                          <Check className="w-3.5 h-3.5 text-[#059669]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        {copiedLink ? "Copied" : "Copy Link"}
                      </button>

                      <a
                        href={inspection.viewingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-primary bg-primary-light hover:bg-primary/20 smooth-transition flex items-center gap-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Open Viewing Page
                      </a>
                    </div>
                  </div>

                  {/* DIRECT WHATSAPP ACTION BUTTON IF NOT ALREADY SENT */}
                  {inspection.whatsappUrl && (
                    <div className="mt-5 pt-4 border-t border-[#F3F4F6]">
                      <a
                        href={inspection.whatsappUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-3 rounded-xl text-xs sm:text-sm font-semibold text-white bg-[#059669] hover:bg-[#047857] shadow-sm smooth-transition flex items-center justify-center gap-2"
                      >
                        <FaWhatsapp className="w-4 h-4" />
                        Open WhatsApp & Resend Inspection Alert
                      </a>
                    </div>
                  )}
                </div>

                {/* COUNTDOWN OR POST-TOUR COMPONENT */}
                {!countdownElapsed ? (
                  <TourSchedule
                    daysRemaining={countdown.days}
                    hoursRemaining={countdown.hours}
                    minutesRemaining={countdown.mins}
                    secondsRemaining={countdown.seconds}
                  />
                ) : (
                  <PostScheduleTour
                    reversePayOnSubmit={(e) => {
                      e.preventDefault();
                      setIsReversePayment(true);
                    }}
                    confirmPayOnSubmit={(e) => {
                      e.preventDefault();
                      setIsConfirmPayment(true);
                    }}
                  />
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      <MobileNavigationTab />

      {/* INSPECTION FEE PAYMENT MODAL */}
      <PayInspectionModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        queue={{
          id: inspection?.id,
          property:
            inspection?.propertyTitle ||
            apartment?.lodgeDesc ||
            apartment?.title ||
            "Apartment",
          propertyType: apartment?.propertyType,
          bedrooms: apartment?.bedrooms,
          propertySize: apartment?.propertySize,
        }}
        onConfirmPayment={handleConfirmInspectionFeePayment}
      />

      {/* FEEDBACK MODALS */}
      <ReversePayment
        redirect="/user/dashboard"
        isReversePayment={isReversePayment}
      />
      <ConfirmPayment
        redirect={`/user/apartment/schedule-move-in/${apartmentID}`}
        isConfirmPayment={isConfirmPayment}
      />
    </div>
  );
};

export default ScheduleTour;
