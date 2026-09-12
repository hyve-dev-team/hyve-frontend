import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";
import Header from "../Dashboard/Header";
import MobileNavigationTab from "../MobileNavigation/MobileNavigationTab";
import { BsPeople, BsCheck2Circle } from "react-icons/bs";
import { IoTimeOutline, IoCallOutline, IoShieldCheckmarkOutline } from "react-icons/io5";
import { FaWhatsapp } from "react-icons/fa";
import { Users, ArrowLeft, ExternalLink } from "lucide-react";
import useFetchApartment from "../../../../../hooks/useFetchApartment";
import useQueueStore from "../../../../../hooks/useQueueStore";
import { getPropertyQueueApi, mapBackendQueue } from "../../../../../utils/queueApi";
import placeholderImage from "../../../../../assets/images/apartments/apartment-image-1.png";
import JoinQueueModal from "../../../../../components/queue/JoinQueueModal";
import UpgradeTierModal from "../../../../../components/queue/UpgradeTierModal";
import PayInspectionModal from "../../../../../components/queue/PayInspectionModal";
import PassSlotModal from "../../../../../components/queue/PassSlotModal";
import { BiErrorCircle } from "react-icons/bi";
import { hyveSuccess } from "../../../../../utils/hyveToast";

// Live Countdown
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

  useEffect(() => {
    let cancelled = false;
    if (!apartmentID) return;
    setIsQueueLoading(true);
    getPropertyQueueApi(apartmentID)
      .then((data) => {
        if (cancelled) return;
        setPropertyQueue(data ? mapBackendQueue(data) : null);
      })
      .catch(() => {
        if (cancelled) return;
        setPropertyQueue(null);
      })
      .finally(() => {
        if (!cancelled) setIsQueueLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [apartmentID]);

  const userQueue = propertyQueue || getQueueForApartment(apartmentID);

  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [payingQueue, setPayingQueue] = useState(null);
  const [passingQueue, setPassingQueue] = useState(null);

  const handleLeave = () => {
    if (!userQueue) return;
    if (window.confirm("Leave this queue? This will free up 1 of your queue slots.")) {
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

          <main className="w-full min-h-[100svh] sm:w-[70%] lg:w-[80%] overflow-auto">
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
                <h2 className="font-montserrat text-2xl font-bold text-gray-900">
                  Apartment Queue Status
                </h2>
              </div>

              {/* Loading State */}
              {(isLoading || isQueueLoading) ? (
                <div className="flex flex-col items-center justify-center p-16">
                  <div className="spinner w-[32px] h-[32px]" />
                  <p className="mt-4 text-xs text-gray-400">Loading queue details...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center p-16 text-center">
                  <BiErrorCircle className="text-4xl text-primary mb-2" />
                  <p className="text-sm text-gray-600">{error}</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-md">
                  {/* Image */}
                  <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-gray-100">
                    <img
                      src={apartment?.lodgeImage || apartment?.images?.[0] || placeholderImage}
                      alt="apartment"
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = placeholderImage; }}
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
                          IN QUEUE: POSITION #{userQueue.position} OF {userQueue.total}
                        </span>
                      ) : (
                        <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-white/90 text-gray-800 shadow-md backdrop-blur-xs">
                          ● OPEN FOR TOUR & QUEUE
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 text-white flex items-end justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-xl font-bold font-montserrat leading-snug break-words">
                          {apartment?.lodgeDesc}
                        </h3>
                        <p className="text-xs text-white/80 mt-0.5 truncate">
                          {apartment?.location || "Lagos, Nigeria"}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-base sm:text-xl font-bold text-white whitespace-nowrap">
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
                        <div className="p-4 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-between">
                          <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                            <IoTimeOutline size={20} className="animate-pulse" />
                            <span>Exclusive Decision Window:</span>
                          </div>
                          <div className="font-mono font-bold text-lg text-primary">
                            <CountdownTimer expiresAt={userQueue.expiresAt} />
                          </div>
                        </div>

                        {!userQueue.inspectionPaid ? (
                          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                            <p className="text-xs text-gray-600 font-medium">
                              Pay the inspection fee (₦5,000) to confirm your private tour and unlock direct agent contact.
                            </p>
                            <button
                              type="button"
                              onClick={() => setPayingQueue(userQueue)}
                              className="w-full py-3 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-colors"
                            >
                              Pay Inspection Fee (₦ 5,000)
                            </button>
                          </div>
                        ) : (
                          <div className="p-4 rounded-xl bg-green-50 border border-green-200 space-y-3">
                            <div className="flex items-center justify-between text-xs font-bold text-green-800">
                              <span className="flex items-center gap-1.5">
                                <IoShieldCheckmarkOutline size={16} />
                                <span>Inspection Fee Confirmed</span>
                              </span>
                              <span className="text-gray-500 font-normal">
                                Tour: {userQueue.scheduledTour}
                              </span>
                            </div>
                            <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-green-100">
                              <div>
                                <p className="text-xs font-bold text-gray-900">
                                  {userQueue.agentName}
                                </p>
                                <p className="text-[11px] text-gray-500">
                                  {userQueue.agentPhone}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <a
                                  href={`tel:${userQueue.agentPhone}`}
                                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs"
                                >
                                  <IoCallOutline size={16} />
                                </a>
                                <a
                                  href={`https://wa.me/${userQueue.agentPhone?.replace(/\D/g, "")}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-xs"
                                >
                                  <FaWhatsapp size={16} />
                                </a>
                              </div>
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
                        <div className="flex items-center justify-between text-sm border-b border-gray-100 pb-3">
                          <span className="text-gray-500">Your Current Position:</span>
                          <span className="font-bold text-gray-900">
                            #{userQueue.position} of {userQueue.total}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-sm border-b border-gray-100 pb-3">
                          <span className="text-gray-500">People Ahead:</span>
                          <span className="font-bold text-gray-900">
                            {userQueue.peopleAhead} {userQueue.peopleAhead === 1 ? "person" : "people"}
                          </span>
                        </div>

                        <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-500 flex items-center gap-1">
                              <IoTimeOutline size={14} className="text-primary" />
                              Estimated Wait Until Your Turn:
                            </span>
                            <span className="font-semibold text-gray-800">
                              ~
                              <CountdownTimer
                                expiresAt={userQueue.currentPersonExpiresAt || Date.now() + 12 * 3600 * 1000}
                              />
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
                            className="w-full py-3 border border-gray-300 hover:border-red-400 hover:text-red-600 text-gray-600 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                          >
                            Leave Queue (Free Up Slot)
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* User is NOT yet in this queue */
                      <div className="space-y-4 text-center">
                        <p className="text-sm text-gray-600 leading-relaxed">
                          Join the fair queue for this apartment to secure transparent, first-come-first-served viewing rights. Only 1 person inspects and decides at a time.
                        </p>

                        <button
                          type="button"
                          onClick={() => setShowJoinModal(true)}
                          className="w-full py-3.5 bg-primary hover:bg-primary-hover active:scale-[0.99] text-white rounded-xl font-bold text-sm shadow-md shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
                        >
                          <Users size={18} />
                          <span>Book Tour & Join Queue</span>
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

export default ApartmentQueue;