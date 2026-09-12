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
import { BsPeople, BsCheck2Circle } from "react-icons/bs";
import { FaWhatsapp } from "react-icons/fa";
import { Zap, AlertCircle, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import useQueueStore from "../../../../../hooks/useQueueStore";
import UpgradeTierModal from "../../../../../components/queue/UpgradeTierModal";
import PayInspectionModal from "../../../../../components/queue/PayInspectionModal";
import PassSlotModal from "../../../../../components/queue/PassSlotModal";
import { hyveSuccess } from "../../../../../utils/hyveToast";

// Live Countdown Component
const CountdownTimer = ({ expiresAt }) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const updateTimer = () => {
      const diff = expiresAt - Date.now();
      if (diff <= 0) {
        setTimeLeft("00:00:00 (Expired)");
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(
        `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
      );
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  return <span>{timeLeft}</span>;
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
  } = useQueueStore();

  const [activeFilter, setActiveFilter] = useState("ALL"); // ALL, ACTIVE, WAITING
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [payingQueue, setPayingQueue] = useState(null);
  const [passingQueue, setPassingQueue] = useState(null);

  const filteredQueues = queues.filter((q) => {
    if (activeFilter === "ACTIVE") return q.status === "ACTIVE";
    if (activeFilter === "WAITING") return q.status === "WAITING";
    return true;
  });

  const activeTurnsCount = queues.filter((q) => q.status === "ACTIVE").length;

  const handleLeave = (queueId, propertyName) => {
    if (window.confirm(`Are you sure you want to leave the queue for ${propertyName}? This will free up 1 of your queue slots.`)) {
      leaveQueue(queueId);
      hyveSuccess("Left Queue", `You have left the queue for ${propertyName}.`);
    }
  };

  return (
    <>
      <div className="page-wrapper bg-[#FBFBFB]">
        <div className="flex">
          <Sidebar currentPage={"queues"} />

          <main className="w-full min-h-[100svh] sm:w-[70%] lg:w-[80%] overflow-auto">
            <Header />

            <div className="px-4 sm:px-8 lg:px-12 py-8 pb-28 sm:pb-16">
              {/* Page Title & Queue Capacity Status */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold font-montserrat text-gray-900">
                    My Queues
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                    Orderly, fair, first-come-first-served apartment access. Only one person decides at a time.
                  </p>
                </div>

                {/* Queue Capacity Pill & Upgrade Button */}
                <div className="flex items-center gap-3 bg-white p-2.5 sm:p-3 rounded-2xl border border-gray-200 shadow-sm">
                  <div className="text-left">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                      <span>Queue Slots:</span>
                      <span className="text-primary font-bold">
                        {capacity.currentCount} of {capacity.maxLimit}
                      </span>
                      <span className="text-[10px] text-gray-400 uppercase font-medium">
                        ({capacity.tierDetails.name})
                      </span>
                    </div>
                    {/* Capacity progress bar */}
                    <div className="w-28 sm:w-36 h-1.5 bg-gray-100 rounded-full mt-1.5 overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(100, (capacity.currentCount / capacity.maxLimit) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowUpgradeModal(true)}
                    className="flex items-center gap-1 px-3 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Zap size={14} />
                    <span>Upgrade Limit</span>
                  </button>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-2 mb-6 border-b border-gray-200 pb-3">
                <button
                  type="button"
                  onClick={() => setActiveFilter("ALL")}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    activeFilter === "ALL"
                      ? "bg-primary text-white shadow-sm"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  All Queues ({queues.length})
                </button>

                <button
                  type="button"
                  onClick={() => setActiveFilter("ACTIVE")}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    activeFilter === "ACTIVE"
                      ? "bg-primary text-white shadow-sm"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <span>Your Turn</span>
                  {activeTurnsCount > 0 && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        activeFilter === "ACTIVE"
                          ? "bg-white text-primary"
                          : "bg-primary text-white"
                      }`}
                    >
                      {activeTurnsCount}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveFilter("WAITING")}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    activeFilter === "WAITING"
                      ? "bg-primary text-white shadow-sm"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  Waiting in Line ({queues.filter((q) => q.status === "WAITING").length})
                </button>
              </div>

              {/* Queues List Grid */}
              {filteredQueues.length === 0 ? (
                /* Empty state */
                <div className="bg-white border border-gray-200 rounded-2xl p-10 sm:p-16 text-center max-w-lg mx-auto my-8 shadow-sm">
                  <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                    <BsPeople size={32} />
                  </div>
                  <h3 className="text-xl font-bold font-montserrat text-gray-900">
                    No active queues found
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-2 leading-relaxed">
                    You are not currently waiting in line for any apartment. Browse verified listings and join a queue to secure exclusive viewing rights.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate("/user/dashboard")}
                    className="mt-6 px-6 py-3 bg-primary text-white font-semibold text-xs sm:text-sm rounded-xl hover:bg-primary-hover transition-colors shadow-md shadow-primary/20"
                  >
                    Browse Available Apartments
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredQueues.map((queue) => {
                    const isYourTurn = queue.status === "ACTIVE";

                    return (
                      <div
                        key={queue.id}
                        className={`bg-white rounded-2xl overflow-hidden border-2 transition-all duration-200 shadow-sm ${
                          isYourTurn
                            ? "border-primary ring-2 ring-primary/20"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        {/* Property Image & Status Header */}
                        <div className="relative h-56 sm:h-64 w-full overflow-hidden bg-gray-100">
                          <img
                            src={queue.image}
                            alt={queue.property}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                          {/* Position / Status Badge */}
                          <div className="absolute top-4 left-4 flex items-center gap-2">
                            {isYourTurn ? (
                              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#1B784D] text-white flex items-center gap-1.5 shadow-md">
                                <BsCheck2Circle size={14} />
                                <span>YOUR TURN (POSITION #1)</span>
                              </span>
                            ) : (
                              <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary text-white shadow-md">
                                POSITION #{queue.position} OF {queue.total}
                              </span>
                            )}
                          </div>

                          {/* Price Tag Overlay */}
                          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white">
                            <div>
                              <p className="text-xs text-white/80 flex items-center gap-1">
                                <IoLocationOutline />
                                <span>{queue.location}</span>
                              </p>
                              <h3 className="text-lg sm:text-xl font-bold font-montserrat truncate max-w-xs">
                                {queue.property}
                              </h3>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-lg sm:text-xl font-bold text-white">
                                ₦ {typeof queue.price === "number" ? queue.price.toLocaleString() : queue.price}
                              </p>
                              <p className="text-[11px] text-white/80">per month</p>
                            </div>
                          </div>
                        </div>

                        {/* Queue Body */}
                        <div className="p-4 sm:p-6 space-y-4">
                          {/* Case 1: YOUR TURN (POSITION 1) */}
                          {isYourTurn ? (
                            <div className="space-y-4">
                              {/* 24-Hour Countdown Bar */}
                              <div className="p-3.5 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-primary font-semibold text-xs sm:text-sm">
                                  <IoTimeOutline size={18} className="animate-pulse" />
                                  <span>Exclusive Decision Window:</span>
                                </div>
                                <div className="font-mono font-bold text-sm sm:text-base text-primary">
                                  <CountdownTimer expiresAt={queue.expiresAt} />
                                </div>
                              </div>

                              {/* Inspection status & details */}
                              {!queue.inspectionPaid ? (
                                /* Inspection fee not yet paid */
                                <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-gray-700">
                                      Step 1: Confirm Inspection Slot
                                    </span>
                                    <span className="text-xs font-bold text-primary">
                                      ₦ 5,000 fee
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-500">
                                    Pay the regulated inspection fee to unlock the agent's direct phone number, schedule viewing, and start your full 24-hour decision lock.
                                  </p>
                                  <button
                                    type="button"
                                    onClick={() => setPayingQueue(queue)}
                                    className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                                  >
                                    Pay Inspection Fee & View Agent Details
                                  </button>
                                </div>
                              ) : (
                                /* Inspection fee already paid: Agent unlocked! */
                                <div className="p-4 rounded-xl bg-green-50/60 border border-green-200 space-y-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-green-800">
                                      <IoShieldCheckmarkOutline size={16} className="text-green-600" />
                                      <span>Inspection Confirmed & Unlocked</span>
                                    </div>
                                    <span className="text-[11px] text-gray-500">
                                      Tour: {queue.scheduledTour}
                                    </span>
                                  </div>

                                  {/* Agent Contacts */}
                                  <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-green-100">
                                    <div>
                                      <p className="text-xs font-bold text-gray-900">
                                        {queue.agentName}
                                      </p>
                                      <p className="text-[11px] text-gray-500">
                                        {queue.agentPhone}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <a
                                        href={`tel:${queue.agentPhone}`}
                                        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs transition-colors"
                                        title="Call Agent"
                                      >
                                        <IoCallOutline size={16} />
                                      </a>
                                      <a
                                        href={`https://wa.me/${queue.agentPhone?.replace(/\D/g, "")}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-xs transition-colors"
                                        title="WhatsApp Agent"
                                      >
                                        <FaWhatsapp size={16} />
                                      </a>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Decision CTAs */}
                              <div className="flex items-center gap-3 pt-2">
                                <Link
                                  to={`/user/apartment/reserve/${queue.apartmentId}`}
                                  className="flex-1 py-3 bg-primary hover:bg-primary-hover active:scale-[0.99] text-white rounded-xl text-center font-bold text-xs sm:text-sm shadow-md shadow-primary/20 transition-all"
                                >
                                  Commit & Pay Rent (Escrow)
                                </Link>

                                <button
                                  type="button"
                                  onClick={() => setPassingQueue(queue)}
                                  className="py-3 px-4 border border-gray-300 hover:border-red-400 hover:text-red-600 text-gray-600 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                                >
                                  Pass Turn
                                </button>
                              </div>
                            </div>
                          ) : (
                            /* Case 2: WAITING IN LINE (Position > 1) */
                            <div className="space-y-4">
                              {/* Position & people ahead */}
                              <div className="flex items-center justify-between text-xs sm:text-sm border-b border-gray-100 pb-3">
                                <span className="text-gray-500">People Ahead of You:</span>
                                <span className="font-bold text-gray-900">
                                  {queue.peopleAhead} {queue.peopleAhead === 1 ? "person" : "people"}
                                </span>
                              </div>

                              {/* Time calculation for people waiting (as per business spec) */}
                              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-gray-500 flex items-center gap-1">
                                    <IoTimeOutline size={14} className="text-primary" />
                                    Estimated Wait Until Your Turn:
                                  </span>
                                  <span className="font-semibold text-gray-800">
                                    ~
                                    <CountdownTimer
                                      expiresAt={queue.currentPersonExpiresAt || Date.now() + 12 * 3600 * 1000}
                                    />
                                  </span>
                                </div>

                                <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-200">
                                  <span className="text-gray-500">
                                    Your Exclusive Window When Called:
                                  </span>
                                  <span className="font-bold text-primary">
                                    24 hours full lock
                                  </span>
                                </div>
                              </div>

                              {/* Action: Leave Queue */}
                              <div className="flex items-center gap-3 pt-2">
                                <button
                                  type="button"
                                  onClick={() => handleLeave(queue.id, queue.property)}
                                  className="w-full py-2.5 border border-gray-300 hover:border-red-400 hover:text-red-600 text-gray-600 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                                >
                                  Leave Queue (Free up slot)
                                </button>
                                <Link
                                  to={`/user/apartment/${queue.apartmentId}`}
                                  className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-semibold text-center transition-colors flex items-center justify-center gap-1"
                                >
                                  <span>View Apartment</span>
                                  <ArrowRight size={12} />
                                </Link>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
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