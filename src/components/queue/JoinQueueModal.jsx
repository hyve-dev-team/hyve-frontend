import React, { useState } from "react";
import { CgClose } from "react-icons/cg";
import { Users, Clock, ShieldCheck, Calendar, AlertCircle } from "lucide-react";
import { hyveSuccess, hyveError } from "../../utils/hyveToast";

const JoinQueueModal = ({
  isOpen,
  onClose,
  apartment,
  capacity,
  onJoin,
  onOpenUpgrade,
  onViewExistingQueue,
  existingQueue,
}) => {
  const [tourDate, setTourDate] = useState("");
  const [tourTime, setTourTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // If user is already in this apartment's queue
  if (existingQueue) {
    return (
      <div
        className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-center"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-700"
          >
            <CgClose size={18} />
          </button>

          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
            <Users size={24} />
          </div>

          <h3 className="text-xl font-bold font-montserrat text-gray-900">
            You are already in this queue!
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            You hold <strong>Position #{existingQueue.position}</strong> of{" "}
            {existingQueue.total} for this apartment.
          </p>

          <div className="mt-6 flex flex-col gap-3">
            <button
              onClick={() => {
                onClose();
                onViewExistingQueue(existingQueue.id);
              }}
              className="w-full py-3 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-hover transition-colors shadow-md shadow-primary/20"
            >
              View Queue Status & Details
            </button>
            <button
              onClick={onClose}
              className="w-full py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If user has reached their maximum capacity limit (e.g. 3 of 3 for Free tier)
  if (!capacity.canJoin) {
    return (
      <div
        className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-center"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-700"
          >
            <CgClose size={18} />
          </button>

          <div className="w-12 h-12 rounded-full bg-orange-100 text-primary flex items-center justify-center mx-auto mb-3">
            <AlertCircle size={24} />
          </div>

          <h3 className="text-xl font-bold font-montserrat text-gray-900">
            Queue Limit Reached ({capacity.currentCount}/{capacity.maxLimit})
          </h3>
          <p className="text-sm text-gray-500 mt-2">
            On your current <strong>{capacity.tierDetails.name}</strong>, you can only hold up to{" "}
            {capacity.maxLimit} queues simultaneously to prevent apartment hoarding.
          </p>

          <div className="mt-6 flex flex-col gap-3">
            <button
              onClick={() => {
                onClose();
                onOpenUpgrade();
              }}
              className="w-full py-3 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-hover transition-colors shadow-md shadow-primary/20"
            >
              Upgrade Plan to Join More Queues
            </button>
            <button
              onClick={onClose}
              className="w-full py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50"
            >
              Manage Existing Queues
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleJoin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await onJoin({
        apartmentId: apartment?.id,
        propertyTitle: apartment?.lodgeDesc || "Verified Apartment",
        price: apartment?.price,
        image: apartment?.lodgeImage || apartment?.images?.[0] || "/images/apartments/apartment-image-1.png",
        location: apartment?.location || "Lagos, Nigeria",
        tourDate: tourDate || "As soon as possible",
        tourTime: tourTime || "Daylight hours",
        agentName: apartment?.landlord ? `${apartment.landlord.firstName || ""} ${apartment.landlord.lastName || ""}`.trim() : "Hyve Haven Verified Agent",
        agentPhone: apartment?.landlord?.phone || "+234 800 498 3200",
      });

      if (res?.success) {
        hyveSuccess(
          "Joined Queue!",
          `You've been assigned Position #${res.queue?.position || 1} for this apartment.`
        );
        onClose();
        if (onViewExistingQueue) {
          onViewExistingQueue(res.queue?.id);
        }
      } else if (res?.limitReached) {
        onOpenUpgrade();
      } else {
        hyveError("Could Not Join Queue", res?.message || "Please try again.");
      }
    } catch (err) {
      console.error(err);
      hyveError("Could Not Join Queue", err?.message || "Unexpected error joining queue.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div
      className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100"
          aria-label="Close"
        >
          <CgClose size={20} />
        </button>

        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
              Hyve Haven Fair Queue
            </span>
            <span className="text-xs text-gray-500">
              Slots: {capacity.currentCount} of {capacity.maxLimit} used
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold font-montserrat text-gray-900">
            Book Tour & Join Queue
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Secure your spot in the transparent, orderly queue for this apartment.
          </p>
        </div>

        {/* Property Brief */}
        <div className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-3">
          <img
            src={apartment?.lodgeImage || "/images/apartments/apartment-image-1.png"}
            alt="apartment"
            className="w-16 h-16 rounded-lg object-cover"
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-gray-900 truncate">
              {apartment?.lodgeDesc || "Apartment"}
            </h4>
            <p className="text-primary font-bold text-sm">
              ₦ {typeof apartment?.price === "number" ? apartment.price.toLocaleString() : apartment?.price || "0"} <span className="text-[10px] text-gray-400 font-normal">/ month</span>
            </p>
          </div>
        </div>

        {/* How it works info pill */}
        <div className="mt-4 p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-2 text-xs text-gray-700">
          <div className="flex items-center gap-2 font-semibold text-primary">
            <ShieldCheck size={16} />
            <span>How the Hyve Haven Fair Queue Protects You</span>
          </div>
          <ul className="space-y-1.5 pl-5 list-disc text-gray-600">
            <li><strong>Exclusive Access</strong>: Only 1 person inspects and decides at a time. No agent bidding games.</li>
            <li><strong>Pay When It's Your Turn</strong>: Inspection fee is only charged when you reach Position #1.</li>
            <li><strong>24-Hour Decision Lock</strong>: You have a full 24 hours to inspect, decide, and pay rent into escrow.</li>
          </ul>
        </div>

        {/* Tour Scheduling Preference */}
        <form onSubmit={handleJoin} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Preferred Viewing Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  min={today}
                  value={tourDate}
                  onChange={(e) => setTourDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Preferred Time
              </label>
              <select
                value={tourTime}
                onChange={(e) => setTourTime(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white"
              >
                <option value="">Any time (Daylight)</option>
                <option value="10:00 AM">Morning (10:00 AM)</option>
                <option value="12:00 PM">Midday (12:00 PM)</option>
                <option value="02:00 PM">Afternoon (02:00 PM)</option>
                <option value="04:00 PM">Late Afternoon (04:00 PM)</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-primary hover:bg-primary-hover active:scale-[0.99] text-white rounded-xl font-semibold text-sm shadow-md shadow-primary/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? "Securing Your Queue Spot..." : "Join Queue & Reserve Spot"}
            </button>
            <p className="text-[11px] text-center text-gray-400 mt-2">
              Joining the queue is free. Inspection fee is only charged when your turn arrives.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JoinQueueModal;
