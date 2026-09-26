import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";
import Header from "../Dashboard/Header";
import MobileNavigationTab from "../MobileNavigation/MobileNavigationTab";
import { BsPeople, BsCheck2Circle } from "react-icons/bs";
import {
  IoTimeOutline,
  IoCallOutline,
  IoShieldCheckmarkOutline,
} from "react-icons/io5";
import { FaWhatsapp } from "react-icons/fa";
import {
  Users,
  ArrowLeft,
  ExternalLink,
  Calendar,
  Loader2,
} from "lucide-react";
import useFetchApartment from "../../../../../hooks/useFetchApartment";
import useQueueStore from "../../../../../hooks/useQueueStore";
import {
  getPropertyQueueApi,
  scheduleActiveTourApi,
  mapBackendQueue,
  parseServerDate,
} from "../../../../../utils/queueApi";
import { formatWhatsAppPhone } from "../../../../../utils/inspectionApi";
import placeholderImage from "../../../../../assets/images/apartments/apartment-image-1.png";
import JoinQueueModal from "../../../../../components/queue/JoinQueueModal";
import UpgradeTierModal from "../../../../../components/queue/UpgradeTierModal";
import PayInspectionModal from "../../../../../components/queue/PayInspectionModal";
import PassSlotModal from "../../../../../components/queue/PassSlotModal";
import { BiErrorCircle } from "react-icons/bi";
import { hyveSuccess, hyveError } from "../../../../../utils/hyveToast";

// Live Countdown
const CountdownTimer = ({ expiresAt }) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const updateTimer = () => {
      const expMs = parseServerDate(expiresAt);
      if (!expMs) {
        setTimeLeft("00:00:00");
        return;
      }
      const diff = expMs - Date.now();
      if (diff <= 0) {
        setTimeLeft("00:00:00 (Expired)");
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(
        `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`,
      );
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  return <span>{timeLeft}</span>;
};

const ApartmentQueue = () => {
  const { apartmentID } = useParams();
  const navigate = useNavigate();

  const { apartment, isLoading, error } = useFetchApartment(apartmentID);
  const {
    capacity,
    joinQueue,
    leaveQueue,
    payInspectionFee,
    passSlot,
    upgradeTier,
    getQueueForApartment,
  } = useQueueStore();

  const [propertyQueue, setPropertyQueue] = useState(null);
  const [isQueueLoading, setIsQueueLoading] = useState(true);

  const fetchPropertyQueue = useCallback(async () => {
    if (!apartmentID) return;
    setIsQueueLoading(true);
    try {
      const data = await getPropertyQueueApi(apartmentID);
      setPropertyQueue(data ? mapBackendQueue(data) : null);
    } catch {
      setPropertyQueue(null);
    } finally {
      setIsQueueLoading(false);
    }
  }, [apartmentID]);

  useEffect(() => {
    fetchPropertyQueue();

    const handleQueueUpdate = () => {
      fetchPropertyQueue();
    };

    window.addEventListener("hyve_queue_updated", handleQueueUpdate);
    return () => {
      window.removeEventListener("hyve_queue_updated", handleQueueUpdate);
    };
  }, [fetchPropertyQueue]);

  const userQueue = propertyQueue || getQueueForApartment(apartmentID);

  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [payingQueue, setPayingQueue] = useState(null);
  const [passingQueue, setPassingQueue] = useState(null);
  const [isScheduling, setIsScheduling] = useState(false);
  const [showSlotPicker, setShowSlotPicker] = useState(false);

  const SAME_DAY_SLOTS = [
    "10:00 AM",
    "11:30 AM",
    "01:00 PM",
    "02:30 PM",
    "04:00 PM",
    "05:30 PM",
  ];

  const handleScheduleSlot = async (slot) => {
    if (!userQueue?.id || isScheduling) return;
    setIsScheduling(true);
    try {
      const res = await scheduleActiveTourApi(userQueue.id, slot);
      if (res) {
        setPropertyQueue(mapBackendQueue(res));
        hyveSuccess(
          "Tour Scheduled",
          `Your viewing is confirmed for today at ${slot}`,
        );
        setShowSlotPicker(false);
      }
    } catch (err) {
      hyveError(
        "Scheduling Failed",
        err?.message || "Could not schedule viewing time",
      );
    } finally {
      setIsScheduling(false);
    }
  };

  // User details for automated WhatsApp dispatch to agent
  const currentUser = (() => {
    try {
      return (
        JSON.parse(localStorage.getItem("user")) ||
        JSON.parse(localStorage.getItem("userData")) ||
        {}
      );
    } catch {
      return {};
    }
  })();
  const renterName =
    `${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim() ||
    currentUser.email ||
    "Tenant";
  const renterPhone =
    currentUser.phone || currentUser.phoneNumber || "Not provided";
  const apartmentType =
    apartment?.type || apartment?.propertyType || "Apartment";
  const propertyTitle = apartment?.lodgeDesc || "Hyve Apartment";
  const tourDetails = userQueue?.scheduledTour
    ? `Scheduled Viewing: Today at ${userQueue.scheduledTour}`
    : "Preferred Viewing: Flexible today";

  const cleanPhone = formatWhatsAppPhone(userQueue?.agentPhone);
  const waMessage = `Hello ${userQueue?.agentName || "Agent"},\n\nI am currently Position #1 on Hyve Haven for "${propertyTitle}" (${apartmentType}) and have paid my inspection fee.\n\nTenant Details:\n- Name: ${renterName}\n- Phone: ${renterPhone}\n- Apartment: ${propertyTitle} (${apartmentType})\n- Status: ${tourDetails}\n- Hyve Queue Reference: #${userQueue?.id}\n\nPlease confirm our viewing arrangement. Thank you!`;
  const whatsappUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waMessage)}`
    : null;

  const handleLeave = () => {
    if (!userQueue) return;
    if (
      window.confirm(
        "Leave this queue? This will free up 1 of your queue slots.",
      )
    ) {
      leaveQueue(userQueue.id);
      setPropertyQueue(null);
      hyveSuccess("Left Queue", "You have stepped out of the queue.");
      navigate("/user/apartment/queue");
    }
  };

  return (
    <>
      <div className="page-wrapper bg-[#FBFBFB]">
        <div className="flex">
          <Sidebar currentPage="queues" />

          <main className="w-full h-[100svh] sm:w-[70%] lg:w-[80%] overflow-y-auto">
            <Header />

            <div className="px-4 sm:px-8 lg:px-[18%] py-8 pb-28 sm:pb-16">
              {/* Back Link */}
              <div className="flex items-center justify-between mb-6">
                <Link
                  to="/user/apartment/queue"
                  className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-500 hover:text-primary transition-colors"
                >
                  <ArrowLeft size={16} />
                  <span>Back to My Queues</span>
                </Link>

                <Link
                  to={`/user/apartment/${apartmentID}`}
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-primary font-semibold hover:underline"
                >
                  <span>View Listing Details</span>
                  <ExternalLink size={14} className="shrink-0" />
                </Link>
              </div>

              {/* Title */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                    Hyve Haven Fair Queue
                  </span>
                  <span className="text-xs text-gray-400">
                    Slots: {capacity.currentCount} of {capacity.maxLimit} used
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 font-montserrat">
                  Apartment Queue Status
                </h2>
              </div>

              {/* Loading State */}
              {isLoading || isQueueLoading ? (
                <div className="flex flex-col items-center justify-center p-16">
                  <div className="spinner w-[32px] h-[32px]" />
                  <p className="mt-4 text-xs text-gray-400">
                    Loading queue details...
                  </p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center p-16 text-center">
                  <BiErrorCircle className="mb-2 text-4xl text-primary" />
                  <p className="text-sm text-gray-600">{error}</p>
                </div>
              ) : (
                <div className="overflow-hidden bg-white border border-gray-200 shadow-md rounded-2xl">
                  {/* Image */}
                  <div className="relative w-full h-64 overflow-hidden bg-gray-100 sm:h-72">
                    <img
                      src={
                        apartment?.lodgeImage ||
                        apartment?.images?.[0] ||
                        placeholderImage
                      }
                      alt="apartment"
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        e.target.src = placeholderImage;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

                    {/* Status badge */}
                    <div className="absolute top-4 left-4">
                      {userQueue?.status === "ACTIVE" ? (
                        <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-[#1B784D] text-white flex items-center gap-1.5 shadow-md">
                          <BsCheck2Circle size={14} />
                          <span>YOUR TURN (POSITION #1)</span>
                        </span>
                      ) : userQueue ? (
                        <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-primary text-white shadow-md">
                          IN QUEUE: POSITION #{userQueue.position} OF{" "}
                          {userQueue.total}
                        </span>
                      ) : (
                        <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-white/90 text-gray-800 shadow-md backdrop-blur-xs">
                          ● OPEN FOR TOUR & QUEUE
                        </span>
                      )}
                    </div>

                    <div className="absolute flex items-end justify-between gap-3 text-white bottom-4 left-4 right-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold leading-snug break-words sm:text-xl font-montserrat">
                          {apartment?.lodgeDesc}
                        </h3>
                        <p className="text-xs text-white/80 mt-0.5 truncate">
                          {apartment?.location || "Lagos, Nigeria"}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-base font-bold text-white sm:text-xl whitespace-nowrap">
                          ₦ {Number(apartment?.price || 0).toLocaleString()}
                        </p>
                        <p className="text-[11px] text-white/80">per month</p>
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 space-y-5">
                    {/* User is in Queue and it's their turn */}
                    {userQueue?.status === "ACTIVE" ? (
                      <div className="space-y-4">
                        {/* Countdown */}
                        <div className="flex items-center justify-between p-4 border border-orange-200 rounded-xl bg-orange-50">
                          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                            <IoTimeOutline
                              size={20}
                              className="animate-pulse"
                            />
                            <span>Exclusive Decision Window:</span>
                          </div>
                          <div className="font-mono text-lg font-bold text-primary">
                            <CountdownTimer expiresAt={userQueue.expiresAt} />
                          </div>
                        </div>

                        {!userQueue.inspectionPaid ? (
                          <div className="p-4 space-y-3 border border-gray-200 rounded-xl bg-gray-50">
                            <div className="flex items-start gap-2.5">
                              <IoShieldCheckmarkOutline className="text-primary w-5 h-5 shrink-0 mt-0.5" />
                              <div>
                                <p className="text-xs font-bold text-gray-900">
                                  Unlock Agent Direct Contact & Schedule Viewing
                                </p>
                                <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                                  Pay the inspection fee (₦5,000) to reveal the
                                  agent's verified contact, automatically
                                  dispatch your tenant details to their
                                  WhatsApp, and book your same-day viewing time.
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setPayingQueue(userQueue)}
                              className="w-full py-3 bg-primary hover:bg-primary-hover active:scale-[0.99] text-white rounded-xl text-xs sm:text-sm font-bold shadow-md cursor-pointer transition-all"
                            >
                              Pay Inspection Fee (₦ 5,000)
                            </button>
                          </div>
                        ) : (
                          <div className="p-4 rounded-xl bg-green-50/70 border border-green-200 space-y-3.5">
                            <div className="flex items-center justify-between text-xs font-bold text-green-800">
                              <span className="flex items-center gap-1.5">
                                <IoShieldCheckmarkOutline
                                  size={18}
                                  className="text-green-600"
                                />
                                <span>Inspection Fee Confirmed (₦ 5,000)</span>
                              </span>
                              <span className="text-green-700 bg-green-100 px-2 py-0.5 rounded-md font-medium">
                                24h Window Active
                              </span>
                            </div>

                            {/* Agent Direct Contact (Unlocked after payment) */}
                            <div className="bg-white p-3.5 rounded-xl border border-green-100 shadow-2xs space-y-2.5">
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <p className="text-xs font-bold text-gray-900">
                                    {userQueue.agentName ||
                                      "Assigned Property Agent"}
                                  </p>
                                  <p className="text-[11px] text-gray-500">
                                    {userQueue.agentPhone ||
                                      "Verified Agent Phone"}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  {userQueue.agentPhone && (
                                    <a
                                      href={`tel:${userQueue.agentPhone}`}
                                      className="p-2 text-xs text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
                                      title="Call Agent"
                                    >
                                      <IoCallOutline size={17} />
                                    </a>
                                  )}
                                  {whatsappUrl && (
                                    <a
                                      href={whatsappUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold shadow-xs transition-colors"
                                      title="Send details & chat on WhatsApp"
                                    >
                                      <FaWhatsapp size={16} />
                                      <span>WhatsApp Agent</span>
                                    </a>
                                  )}
                                </div>
                              </div>

                              {whatsappUrl && (
                                <p className="text-[11px] text-gray-500 bg-gray-50 p-2 rounded-lg border border-gray-100">
                                  💬 <strong>Auto-Dispatch Ready:</strong>{" "}
                                  Clicking "WhatsApp Agent" sends your name,
                                  phone, property choice, and queue ID directly
                                  to the agent's WhatsApp.
                                </p>
                              )}
                            </div>

                            {/* Same-Day Inspection Schedule Picker */}
                            <div className="bg-white p-3.5 rounded-xl border border-green-100 shadow-2xs space-y-2.5">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
                                  <Calendar className="w-4 h-4 text-primary" />
                                  <span>Same-Day Inspection Time</span>
                                </div>
                                {userQueue.scheduledTour && !showSlotPicker && (
                                  <button
                                    type="button"
                                    onClick={() => setShowSlotPicker(true)}
                                    className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
                                  >
                                    Change Slot
                                  </button>
                                )}
                              </div>

                              {userQueue.scheduledTour && !showSlotPicker ? (
                                <div className="p-2.5 bg-green-50/70 rounded-lg border border-green-200/80 flex items-center justify-between text-xs">
                                  <span className="text-gray-700">
                                    Confirmed inspection:{" "}
                                    <strong className="text-green-900">
                                      {userQueue.scheduledTour}
                                    </strong>
                                  </span>
                                  <span className="text-[11px] text-green-700 font-semibold flex items-center gap-1">
                                    <BsCheck2Circle size={14} /> Scheduled
                                  </span>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <p className="text-[11px] text-gray-500">
                                    Pick your preferred tour slot for today
                                    (within your 24-hour decision lock):
                                  </p>
                                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                    {SAME_DAY_SLOTS.map((slot) => {
                                      const isSelected =
                                        userQueue.scheduledTour?.includes(slot);
                                      return (
                                        <button
                                          key={slot}
                                          type="button"
                                          disabled={isScheduling}
                                          onClick={() =>
                                            handleScheduleSlot(slot)
                                          }
                                          className={`py-2 px-2.5 rounded-lg text-xs font-semibold border transition-all text-center flex items-center justify-center gap-1 ${
                                            isSelected
                                              ? "bg-primary text-white border-primary shadow-xs"
                                              : "bg-gray-50 hover:bg-primary/10 hover:border-primary/40 text-gray-800 border-gray-200"
                                          }`}
                                        >
                                          {isScheduling && isSelected ? (
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                          ) : (
                                            slot
                                          )}
                                        </button>
                                      );
                                    })}
                                  </div>
                                  {userQueue.scheduledTour && (
                                    <div className="text-right">
                                      <button
                                        type="button"
                                        onClick={() => setShowSlotPicker(false)}
                                        className="text-[11px] text-gray-500 hover:text-gray-700 underline cursor-pointer"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-3 pt-2">
                          <Link
                            to={`/user/apartment/reserve/${apartmentID}`}
                            className="flex-1 py-3.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-center font-bold text-sm shadow-md transition-all"
                          >
                            Commit & Pay Rent (Escrow)
                          </Link>
                          <button
                            type="button"
                            onClick={() => setPassingQueue(userQueue)}
                            className="py-3.5 px-5 border border-gray-300 hover:border-red-400 hover:text-red-600 text-gray-700 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                          >
                            Pass Turn
                          </button>
                        </div>
                      </div>
                    ) : userQueue ? (
                      /* User is in Queue and waiting */
                      <div className="space-y-4">
                        <div className="flex items-center justify-between pb-3 text-sm border-b border-gray-100">
                          <span className="text-gray-500">
                            Your Current Position:
                          </span>
                          <span className="font-bold text-gray-900">
                            #{userQueue.position} of {userQueue.total}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pb-3 text-sm border-b border-gray-100">
                          <span className="text-gray-500">People Ahead:</span>
                          <span className="font-bold text-gray-900">
                            {userQueue.peopleAhead}{" "}
                            {userQueue.peopleAhead === 1 ? "person" : "people"}
                          </span>
                        </div>

                        <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1 text-gray-500">
                              <IoTimeOutline
                                size={14}
                                className="text-primary"
                              />
                              Estimated Wait:
                            </span>
                            <span className="font-bold text-gray-800">
                              {userQueue.peopleAhead === 0
                                ? "You're first in queue / first to inspect and pay!"
                                : userQueue.peopleAhead === 1
                                  ? "Approx. 24 hours until you can inspect"
                                  : `Approx. ${userQueue.peopleAhead * 24} hours until you can inspect`}
                            </span>
                          </div>
                          <div className="flex justify-between pt-1 border-t border-gray-200">
                            <span className="text-gray-500">
                              Your Exclusive Window Once It's Your Turn:
                            </span>
                            <span className="font-bold text-primary">
                              24 hours full lock
                            </span>
                          </div>
                        </div>

                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={handleLeave}
                            className="w-full py-3 text-xs font-semibold text-gray-600 transition-colors border border-gray-300 cursor-pointer hover:border-red-400 hover:text-red-600 rounded-xl sm:text-sm"
                          >
                            Leave Queue (Free Up Slot)
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* User is NOT yet in this queue */
                      <div className="space-y-4 text-center">
                        <p className="text-sm leading-relaxed text-gray-600">
                          Join the fair queue for this apartment to secure
                          transparent, first-come-first-served viewing rights.
                          Only 1 person inspects and decides at a time.
                        </p>

                        <button
                          type="button"
                          onClick={() => setShowJoinModal(true)}
                          className="w-full py-3.5 bg-primary hover:bg-primary-hover active:scale-[0.99] text-white rounded-xl font-bold text-sm shadow-md shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
                        >
                          <Users size={18} />
                          <span>Join Queue</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>

        <MobileNavigationTab currentTab="queues" />

        {/* Modals */}
        <JoinQueueModal
          isOpen={showJoinModal}
          onClose={() => setShowJoinModal(false)}
          apartment={apartment}
          capacity={capacity}
          existingQueue={userQueue}
          onJoin={async (params) => {
            const res = await joinQueue(params);
            if (res?.success && res.queue) {
              setPropertyQueue(res.queue);
            }
            return res;
          }}
          onOpenUpgrade={() => setShowUpgradeModal(true)}
          onViewExistingQueue={() => setShowJoinModal(false)}
        />

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
          onConfirmPayment={async (qId) => {
            const res = await payInspectionFee(qId);
            if (res?.queue) {
              setPropertyQueue(res.queue);
            }
          }}
        />

        <PassSlotModal
          isOpen={Boolean(passingQueue)}
          onClose={() => setPassingQueue(null)}
          queue={passingQueue}
          onConfirmPass={async (qId) => {
            await passSlot(qId);
            setPropertyQueue(null);
            await fetchPropertyQueue();
          }}
        />
      </div>
    </>
  );
};

export default ApartmentQueue;
