import React, { useState, useEffect } from "react";
import Sidebar from "../Sidebar/Sidebar";
import Header from "../Dashboard/Header";
import MobileNavigationTab from "../MobileNavigation/MobileNavigationTab";
import {
  IoTimeOutline,
  IoCallOutline,
  IoShieldCheckmarkOutline,
  IoLocationOutline,
} from "react-icons/io5";
import { BsPeople, BsCheck2Circle, BsShieldCheck } from "react-icons/bs";
import { FaWhatsapp } from "react-icons/fa";
import {
  Zap,
  ArrowRight,
  Sparkles,
  Clock,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import useQueueStore from "../../../../../hooks/useQueueStore";
import UpgradeTierModal from "../../../../../components/queue/UpgradeTierModal";
import PayInspectionModal from "../../../../../components/queue/PayInspectionModal";
import PassSlotModal from "../../../../../components/queue/PassSlotModal";
import { formatWhatsAppPhone } from "../../../../../utils/inspectionApi";
import { parseServerDate } from "../../../../../utils/queueApi";
import { hyveSuccess } from "../../../../../utils/hyveToast";
import {
  formatNaira,
  calculateInspectionFee,
} from "../../../../../utils/feeCalculations";

// Digital Block Countdown Component
const CountdownTimer = ({ expiresAt, compact = false }) => {
  const [timeLeft, setTimeLeft] = useState({
    hours: "00",
    minutes: "00",
    seconds: "00",
    isExpired: false,
  });

  useEffect(() => {
    const updateTimer = () => {
      const expMs = parseServerDate(expiresAt);
      if (!expMs) {
        setTimeLeft({
          hours: "00",
          minutes: "00",
          seconds: "00",
          isExpired: false,
        });
        return;
      }
      const diff = expMs - Date.now();
      if (diff <= 0) {
        setTimeLeft({
          hours: "00",
          minutes: "00",
          seconds: "00",
          isExpired: true,
        });
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({
        hours: String(hours).padStart(2, "0"),
        minutes: String(minutes).padStart(2, "0"),
        seconds: String(seconds).padStart(2, "0"),
        isExpired: false,
      });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  if (timeLeft.isExpired) {
    return (
      <span className="text-xs font-semibold text-red-500">Window Expired</span>
    );
  }

  if (compact) {
    return (
      <span className="font-mono font-bold text-gray-800">
        {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
      </span>
    );
  }

  return (
    <div className="inline-flex items-center gap-1 font-mono font-bold">
      <span className="bg-white text-primary px-2 py-0.5 rounded-md border border-orange-200/80 shadow-xs text-xs sm:text-sm">
        {timeLeft.hours}h
      </span>
      <span className="text-xs font-bold text-orange-400">:</span>
      <span className="bg-white text-primary px-2 py-0.5 rounded-md border border-orange-200/80 shadow-xs text-xs sm:text-sm">
        {timeLeft.minutes}m
      </span>
      <span className="text-xs font-bold text-orange-400">:</span>
      <span className="bg-white text-primary px-2 py-0.5 rounded-md border border-orange-200/80 shadow-xs text-xs sm:text-sm">
        {timeLeft.seconds}s
      </span>
    </div>
  );
};

const MyQueues = () => {
  const navigate = useNavigate();
  const {
    queues,
    capacity,
    leaveQueue,
    payInspectionFee,
    passSlot,
    upgradeTier,
    isLoading,
  } = useQueueStore();

  const [activeFilter, setActiveFilter] = useState("ALL"); // ALL, ACTIVE, WAITING
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [payingQueue, setPayingQueue] = useState(null);
  const [passingQueue, setPassingQueue] = useState(null);
  const [showTrustInfo, setShowTrustInfo] = useState(false);

  const filteredQueues = queues.filter((q) => {
    if (activeFilter === "ACTIVE") return q.status === "ACTIVE";
    if (activeFilter === "WAITING") return q.status === "WAITING";
    return true;
  });

  const activeTurnsCount = queues.filter((q) => q.status === "ACTIVE").length;
  const waitingCount = queues.filter((q) => q.status === "WAITING").length;

  const handleLeave = (queueId, propertyName) => {
    if (
      window.confirm(
        `Are you sure you want to leave the queue for ${propertyName}? This will free up 1 of your queue slots.`,
      )
    ) {
      leaveQueue(queueId);
      hyveSuccess("Left Queue", `You have left the queue for ${propertyName}.`);
    }
  };

  return (
    <>
      <div className="page-wrapper bg-[#FBFBFB]">
        <div className="flex">
          <Sidebar currentPage={"queues"} />

          <main className="w-full h-[100svh] sm:w-[70%] lg:w-[80%] overflow-y-auto">
            <Header />

            <div className="px-4 py-6 mx-auto sm:px-8 lg:px-12 sm:py-8 pb-28 sm:pb-16 max-w-7xl">
              {/* Header Title Section */}
              <div className="flex flex-col justify-between gap-4 mb-6 md:flex-row md:items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl font-montserrat">
                      My Queues
                    </h2>
                    <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-full">
                      Fair Queue System
                    </span>
                  </div>
                  <p className="max-w-xl mt-1 text-xs text-gray-500 sm:text-sm">
                    Orderly, transparent, and first-come-first-served apartment
                    access. Only one prospective tenant inspects and decides at
                    a time.
                  </p>
                </div>

                {/* Quick Trust Guide Toggle */}
                <button
                  type="button"
                  onClick={() => setShowTrustInfo(!showTrustInfo)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-gray-600 hover:text-primary bg-white hover:bg-orange-50/50 border border-gray-200 hover:border-primary/30 rounded-xl transition-all shadow-xs cursor-pointer self-start md:self-auto"
                >
                  <ShieldCheck size={16} className="text-primary" />
                  <span>How Fair Queue Protects You</span>
                  <ChevronRight
                    size={14}
                    className={`transition-transform duration-200 ${showTrustInfo ? "rotate-90" : ""}`}
                  />
                </button>
              </div>

              {/* Collapsible Fair Queue Trust Banner */}
              {showTrustInfo && (
                <div className="p-4 mb-6 duration-200 border shadow-xs sm:p-5 rounded-2xl bg-gradient-to-r from-orange-50/90 via-amber-50/70 to-emerald-50/80 border-primary/20 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center gap-2 mb-3 text-sm font-bold text-gray-900">
                    <Sparkles size={18} className="text-primary" />
                    <span>The Hyve Haven 3-Pillar Fair Queue Guarantee</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs text-gray-700">
                    <div className="p-3 border border-orange-100 bg-white/80 rounded-xl shadow-2xs">
                      <p className="font-bold text-gray-900 mb-0.5">
                        1. No Agent Bidding Wars
                      </p>
                      <p className="leading-relaxed text-gray-500">
                        Only 1 person gets the landlord's contact and tours at a
                        time. Agents cannot pit renters against each other.
                      </p>
                    </div>
                    <div className="p-3 border border-orange-100 bg-white/80 rounded-xl shadow-2xs">
                      <p className="font-bold text-gray-900 mb-0.5">
                        2. 24-Hour Decision Lock
                      </p>
                      <p className="leading-relaxed text-gray-500">
                        When it's your turn, the listing is completely reserved
                        for your decision window. Nobody can jump ahead.
                      </p>
                    </div>
                    <div className="p-3 border bg-white/80 rounded-xl border-emerald-100 shadow-2xs">
                      <p className="font-bold text-[#1B784D] mb-0.5">
                        3. 100% Escrow Protection
                      </p>
                      <p className="leading-relaxed text-gray-500">
                        Rent is safely held in Hyve Haven Escrow until physical
                        key handover and inspection confirmation.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Dashboard Metrics Overview & Queues Section */}
              {isLoading ? (
                <div className="space-y-6">
                  {/* Skeleton Metrics */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4 animate-pulse">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="p-4 bg-white border border-gray-200 rounded-2xl shadow-2xs"
                      >
                        <div className="h-4 mb-3 bg-gray-200 rounded w-28" />
                        <div className="w-16 h-8 mb-2 bg-gray-200 rounded" />
                        <div className="w-40 h-3 bg-gray-100 rounded" />
                      </div>
                    ))}
                  </div>

                  {/* Skeleton Queue Cards */}
                  <div className="grid grid-cols-1 gap-6 mt-6 lg:grid-cols-2 animate-pulse">
                    {[1, 2].map((i) => (
                      <div
                        key={i}
                        className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-3xl"
                      >
                        <div className="bg-gray-200 h-60 sm:h-64" />
                        <div className="p-6 space-y-3">
                          <div className="w-3/4 h-5 bg-gray-200 rounded" />
                          <div className="w-1/2 h-4 bg-gray-100 rounded" />
                          <div className="w-full h-10 mt-4 bg-gray-100 rounded-xl" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {/* Dashboard Metrics Overview Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4 mb-6">
                    {/* Metric 1: Ready to Decide */}
                    <div
                      className={`p-4 rounded-2xl border transition-all ${
                        activeTurnsCount > 0
                          ? "bg-gradient-to-br from-emerald-50/80 to-white border-emerald-200 ring-2 ring-emerald-500/10 shadow-xs"
                          : "bg-white border-gray-200 shadow-2xs"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-500">
                          Action Required
                        </span>
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            activeTurnsCount > 0
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          <BsCheck2Circle size={18} />
                        </div>
                      </div>
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-2xl font-bold text-gray-900 font-montserrat">
                          {activeTurnsCount}
                        </span>
                        {activeTurnsCount > 0 ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                            Your Turn Now
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">
                            None right now
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 mt-1">
                        Apartments unlocked for exclusive tour & reservation
                      </p>
                    </div>

                    {/* Metric 2: Waiting in Line */}
                    <div className="p-4 bg-white border border-gray-200 rounded-2xl shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-500">
                          In Waiting Lines
                        </span>
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-50 text-primary">
                          <Clock size={16} />
                        </div>
                      </div>
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-2xl font-bold text-gray-900 font-montserrat">
                          {waitingCount}
                        </span>
                        <span className="text-xs text-gray-500">
                          {waitingCount === 1
                            ? "apartment queued"
                            : "apartments queued"}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-1">
                        Moving forward as earlier applicants finish decisions
                      </p>
                    </div>

                    {/* Metric 3: Queue Slots & Tier */}
                    <div className="flex flex-col justify-between p-4 bg-white border border-gray-200 rounded-2xl shadow-2xs">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-gray-500">
                            Queue Slots Used
                          </span>
                          <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-primary/10 text-primary">
                            {capacity.tierDetails.name}
                          </span>
                        </div>
                        <div className="flex items-baseline justify-between mt-2">
                          <span className="text-2xl font-bold text-gray-900 font-montserrat">
                            {capacity.currentCount}{" "}
                            <span className="text-sm font-normal text-gray-400">
                              / {capacity.maxLimit}
                            </span>
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowUpgradeModal(true)}
                            className="inline-flex items-center gap-1 text-xs font-bold transition-colors cursor-pointer text-primary hover:text-primary-hover"
                          >
                            <Zap size={13} />
                            <span>Upgrade</span>
                          </button>
                        </div>
                        {/* Capacity progress bar */}
                        <div className="w-full h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              capacity.currentCount >= capacity.maxLimit
                                ? "bg-amber-500"
                                : "bg-primary"
                            }`}
                            style={{
                              width: `${Math.min(100, (capacity.currentCount / capacity.maxLimit) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1">
                        {capacity.maxLimit - capacity.currentCount > 0
                          ? `${capacity.maxLimit - capacity.currentCount} slots available for new listings`
                          : "Slot limit reached. Upgrade for more concurrent queues."}
                      </p>
                    </div>
                  </div>

                  {/* Filter Tabs */}
                  <div className="flex items-center gap-2.5 mb-6 overflow-x-auto pb-1">
                    <button
                      type="button"
                      onClick={() => setActiveFilter("ALL")}
                      className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer shrink-0 border ${
                        activeFilter === "ALL"
                          ? "bg-[#1E1E1E] text-white border-[#1E1E1E] shadow-sm"
                          : "bg-white text-[#4B5563] hover:bg-[#F3F4F6] hover:text-[#111827] border-[#D1D5DB]"
                      }`}
                    >
                      All Queues ({queues.length})
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveFilter("ACTIVE")}
                      className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer shrink-0 border ${
                        activeFilter === "ACTIVE"
                          ? "bg-[#1B784D] text-white border-[#1B784D] shadow-sm"
                          : "bg-white text-[#4B5563] hover:bg-[#F3F4F6] hover:text-[#111827] border-[#D1D5DB]"
                      }`}
                    >
                      <span>Your Turn (#1)</span>
                      {activeTurnsCount > 0 && (
                        <span
                          className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                            activeFilter === "ACTIVE"
                              ? "bg-white text-[#1B784D]"
                              : "bg-[#1B784D] text-white"
                          }`}
                        >
                          {activeTurnsCount}
                        </span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveFilter("WAITING")}
                      className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer shrink-0 border ${
                        activeFilter === "WAITING"
                          ? "bg-primary text-white border-primary shadow-sm"
                          : "bg-white text-[#4B5563] hover:bg-[#F3F4F6] hover:text-[#111827] border-[#D1D5DB]"
                      }`}
                    >
                      Waiting in Line ({waitingCount})
                    </button>
                  </div>

                  {/* Queues List Grid */}
                  {filteredQueues.length === 0 ? (
                    /* Empty state */
                    <div className="max-w-lg p-8 mx-auto my-8 text-center bg-white border border-gray-200 shadow-xs rounded-3xl sm:p-14">
                      <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 border border-orange-100 rounded-2xl bg-orange-50 text-primary">
                        <BsPeople size={28} />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 sm:text-xl font-montserrat">
                        {activeFilter === "ACTIVE"
                          ? "No apartments currently in your turn"
                          : activeFilter === "WAITING"
                            ? "No apartments in waiting line"
                            : "You have no active queues"}
                      </h3>
                      <p className="mt-2 text-xs leading-relaxed text-gray-500 sm:text-sm">
                        {activeFilter === "ALL"
                          ? "Browse verified listings, join an orderly fair queue, and secure exclusive private inspection rights with zero bidding wars."
                          : "Explore available apartments to secure your spot in line."}
                      </p>
                      <button
                        type="button"
                        onClick={() => navigate("/user/dashboard")}
                        className="inline-flex items-center gap-2 px-6 py-3 mt-6 text-xs font-semibold text-white transition-colors shadow-md cursor-pointer bg-primary sm:text-sm rounded-xl hover:bg-primary-hover shadow-primary/20"
                      >
                        <span>Browse Verified Apartments</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                      {filteredQueues.map((queue) => {
                        const isYourTurn = queue.status === "ACTIVE";

                        return (
                          <div
                            key={queue.id}
                            className={`bg-white rounded-3xl overflow-hidden border transition-all duration-200 shadow-sm flex flex-col justify-between ${
                              isYourTurn
                                ? "border-[#1B784D]/40 ring-2 ring-[#1B784D]/15 shadow-md"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <div>
                              {/* Property Image Banner */}
                              <div className="relative w-full overflow-hidden bg-gray-100 h-60 sm:h-64">
                                <img
                                  src={queue.image}
                                  alt={queue.property}
                                  className="object-cover w-full h-full"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

                                {/* Top Badges */}
                                <div className="absolute flex items-center justify-between top-4 left-4 right-4">
                                  {isYourTurn ? (
                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#1B784D] text-white flex items-center gap-1.5 shadow-md backdrop-blur-xs">
                                      <span className="w-2 h-2 bg-white rounded-full animate-ping" />
                                      <span>YOUR TURN (POSITION #1)</span>
                                    </span>
                                  ) : (
                                    <span className="px-3 py-1 text-xs font-bold text-white rounded-full shadow-md bg-primary">
                                      POSITION #{queue.position} OF{" "}
                                      {queue.total}
                                    </span>
                                  )}

                                  <Link
                                    to={`/user/apartment/${queue.apartmentId}`}
                                    className="p-2 text-white transition-colors rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-xs"
                                    title="View Apartment Page"
                                  >
                                    <ExternalLink size={14} />
                                  </Link>
                                </div>

                                {/* Title & Price Overlay */}
                                <div className="absolute flex items-end justify-between gap-3 text-white bottom-4 left-4 right-4">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs text-white/80 flex items-center gap-1 mb-0.5">
                                      <IoLocationOutline className="shrink-0" />
                                      <span className="truncate">
                                        {queue.location}
                                      </span>
                                    </p>
                                    <h3 className="text-base font-bold leading-snug break-words sm:text-lg font-montserrat">
                                      {queue.property}
                                    </h3>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <p className="text-base font-bold text-white sm:text-lg whitespace-nowrap">
                                      ₦{" "}
                                      {typeof queue.price === "number"
                                        ? queue.price.toLocaleString()
                                        : queue.price}
                                    </p>
                                    <p className="text-[11px] text-white/80 font-light">
                                      per month
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Queue Card Body */}
                              <div className="p-4 space-y-4 sm:p-6">
                                {/* ================= CASE 1: YOUR TURN (POSITION 1) ================= */}
                                {isYourTurn ? (
                                  <div className="space-y-4">
                                    {/* 24-Hour Urgent Countdown Bar */}
                                    <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50/70 border border-orange-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                                      <div className="flex items-center gap-2 text-xs font-bold text-primary sm:text-sm">
                                        <IoTimeOutline
                                          size={18}
                                          className="animate-pulse shrink-0"
                                        />
                                        <span>Exclusive Decision Window:</span>
                                      </div>
                                      <div>
                                        <CountdownTimer
                                          expiresAt={queue.expiresAt}
                                        />
                                      </div>
                                    </div>

                                    {/* Step 1: Inspection Fee & Tour */}
                                    {!queue.inspectionPaid ? (
                                      <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2.5">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
                                            <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] flex items-center justify-center font-bold">
                                              1
                                            </span>
                                            <span>
                                              Confirm Tour & Unlock Agent
                                            </span>
                                          </div>
                                          <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                                            {formatNaira(
                                              queue.inspectionFee ||
                                                calculateInspectionFee(queue)
                                                  .totalFee,
                                            )}{" "}
                                            fee
                                          </span>
                                        </div>
                                        <p className="text-xs leading-relaxed text-gray-500">
                                          Pay the official inspection fee to
                                          unlock the agent's verified contact,
                                          schedule your private walkthrough, and
                                          lock in your 24-hour decision window.
                                        </p>
                                        <button
                                          type="button"
                                          onClick={() => setPayingQueue(queue)}
                                          className="w-full py-3 bg-primary hover:bg-primary-hover active:scale-[0.99] text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm shadow-primary/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                                        >
                                          <span>
                                            Pay Inspection Fee (
                                            {formatNaira(
                                              queue.inspectionFee ||
                                                calculateInspectionFee(queue)
                                                  .totalFee,
                                            )}
                                            )
                                          </span>
                                          <ArrowRight size={14} />
                                        </button>
                                      </div>
                                    ) : (
                                      /* Inspection fee paid: Agent contact unlocked */
                                      <div className="p-4 space-y-3 border rounded-2xl bg-emerald-50/70 border-emerald-200">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                                            <IoShieldCheckmarkOutline
                                              size={16}
                                              className="text-[#1B784D]"
                                            />
                                            <span>
                                              Tour Confirmed & Agent Unlocked
                                            </span>
                                          </div>
                                          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                                            Tour: {queue.scheduledTour}
                                          </span>
                                        </div>

                                        {/* Agent Contact Card */}
                                        <div className="flex items-center justify-between p-3 bg-white border rounded-xl border-emerald-100 shadow-2xs">
                                          <div className="flex items-center gap-2.5">
                                            <div className="flex items-center justify-center text-sm font-bold rounded-full w-9 h-9 bg-primary/10 text-primary">
                                              {queue.agentName
                                                ? queue.agentName.charAt(0)
                                                : "A"}
                                            </div>
                                            <div>
                                              <p className="text-xs font-bold leading-tight text-gray-900">
                                                {queue.agentName}
                                              </p>
                                              <p className="text-[11px] text-gray-500 mt-0.5">
                                                {queue.agentPhone}
                                              </p>
                                            </div>
                                          </div>

                                          <div className="flex items-center gap-2">
                                            <a
                                              href={`tel:${queue.agentPhone}`}
                                              className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs transition-colors cursor-pointer"
                                              title="Call Agent"
                                            >
                                              <IoCallOutline size={16} />
                                            </a>
                                            <a
                                              href={`https://wa.me/${formatWhatsAppPhone(queue.agentPhone)}`}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs transition-colors cursor-pointer"
                                              title="WhatsApp Agent"
                                            >
                                              <FaWhatsapp size={16} />
                                            </a>
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    {/* Step 2: Commit & Reserve / Pass Turn */}
                                    <div className="pt-1 space-y-2">
                                      <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
                                        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] flex items-center justify-center font-bold">
                                          2
                                        </span>
                                        <span>
                                          Decision: Secure Property with Escrow
                                        </span>
                                      </div>
                                      <div className="flex flex-col sm:flex-row items-center gap-2.5">
                                        <Link
                                          to={`/user/apartment/reserve/${queue.apartmentId}`}
                                          className="w-full sm:flex-1 py-3.5 bg-primary hover:bg-primary-hover active:scale-[0.99] text-white rounded-xl text-center font-bold text-xs sm:text-sm shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-2"
                                        >
                                          <BsShieldCheck size={16} />
                                          <span>
                                            Commit & Pay Rent (Escrow)
                                          </span>
                                        </Link>

                                        <button
                                          type="button"
                                          onClick={() => setPassingQueue(queue)}
                                          className="w-full px-4 py-3 text-xs font-semibold text-center text-gray-600 transition-colors border border-gray-200 cursor-pointer sm:w-auto hover:border-red-300 hover:bg-red-50/50 hover:text-red-600 rounded-xl sm:text-sm"
                                        >
                                          Pass Turn
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  /* ================= CASE 2: WAITING IN LINE (Position > 1) ================= */
                                  <div className="space-y-4">
                                    {/* Visual Queue Step Track */}
                                    <div>
                                      <div className="flex items-center justify-between mb-2 text-xs">
                                        <span className="font-medium text-gray-500">
                                          Queue Progression:
                                        </span>
                                        <span className="font-bold text-primary">
                                          {queue.peopleAhead}{" "}
                                          {queue.peopleAhead === 1
                                            ? "person ahead"
                                            : "people ahead"}
                                        </span>
                                      </div>

                                      {/* Progress Step Bar */}
                                      <div className="flex w-full h-2 overflow-hidden bg-gray-100 rounded-full">
                                        <div
                                          className="h-full transition-all bg-gray-300 rounded-l-full"
                                          style={{
                                            width: `${Math.min(100, Math.max(15, ((queue.total - queue.position) / queue.total) * 100))}%`,
                                          }}
                                        />
                                        <div className="flex-1 h-full bg-primary" />
                                      </div>
                                    </div>

                                    {/* Estimated Wait Pill */}
                                    <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
                                      <div className="flex items-center justify-between text-xs">
                                        <span className="text-gray-500 flex items-center gap-1.5">
                                          <IoTimeOutline
                                            size={15}
                                            className="text-primary"
                                          />
                                          <span>
                                            Estimated Wait Until Your Turn:
                                          </span>
                                        </span>
                                        <span className="font-mono font-semibold text-gray-800">
                                          ~
                                          <CountdownTimer
                                            expiresAt={
                                              queue.currentPersonExpiresAt ||
                                              Date.now() + 12 * 3600 * 1000
                                            }
                                            compact={true}
                                          />
                                        </span>
                                      </div>

                                      <div className="flex items-center justify-between pt-2 text-xs border-t border-gray-200/80">
                                        <span className="text-gray-500">
                                          Your Exclusive Window When Called:
                                        </span>
                                        <span className="font-bold text-primary">
                                          24 hours full lock
                                        </span>
                                      </div>
                                    </div>

                                    {/* Actions for waiting queue */}
                                    <div className="flex items-center gap-3 pt-2">
                                      <Link
                                        to={`/user/apartment/${queue.apartmentId}`}
                                        className="flex-1 py-3 px-4 bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#1F2937] border border-[#E5E7EB] rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                                      >
                                        <span>View Listing</span>
                                        <ArrowRight
                                          size={14}
                                          className="shrink-0"
                                        />
                                      </Link>

                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleLeave(queue.id, queue.property)
                                        }
                                        className="flex-1 py-3 px-4 bg-white hover:bg-red-50/60 border border-[#E5E7EB] hover:border-red-300 text-[#4B5563] hover:text-red-600 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center justify-center"
                                      >
                                        Leave Queue
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          </main>
        </div>

        <MobileNavigationTab currentTab={"queues"} />

        {/* Modals */}
        <UpgradeTierModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          currentTier={capacity.tier}
          onUpgrade={upgradeTier}
        />

        <PayInspectionModal
          isOpen={Boolean(payingQueue)}
          onClose={() => setPayingQueue(null)}
          queue={payingQueue}
          onConfirmPayment={payInspectionFee}
        />

        <PassSlotModal
          isOpen={Boolean(passingQueue)}
          onClose={() => setPassingQueue(null)}
          queue={passingQueue}
          onConfirmPass={passSlot}
        />
      </div>
    </>
  );
};

export default MyQueues;
