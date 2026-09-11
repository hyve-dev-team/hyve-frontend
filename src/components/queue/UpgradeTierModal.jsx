import React from "react";
import { CgClose } from "react-icons/cg";
import { Check, Zap, Crown, Shield } from "lucide-react";
import { TIER_LIMITS } from "../../utils/queueStore";
import { hyveSuccess } from "../../utils/hyveToast";

const UpgradeTierModal = ({ isOpen, onClose, currentTier, onUpgrade }) => {
  if (!isOpen) return null;

  const handleSelectTier = (tierKey) => {
    if (tierKey === currentTier) return;
    onUpgrade(tierKey);
    hyveSuccess("Plan Upgraded!", `You are now on ${TIER_LIMITS[tierKey].name}. Your queue limit is updated.`);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          aria-label="Close"
        >
          <CgClose size={20} />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
            <Zap size={24} />
          </div>
          <h3 className="text-2xl font-bold font-montserrat text-gray-900">
            Expand Your Queue Limit
          </h3>
          <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
            Free accounts can hold up to 3 queues simultaneously. Upgrade to hold more spots and secure apartments faster.
          </p>
        </div>

        {/* Tiers list */}
        <div className="space-y-4">
          {/* Free Tier */}
          <div
            className={`border-2 rounded-xl p-4 flex items-center justify-between transition-all ${
              currentTier === "FREE"
                ? "border-gray-300 bg-gray-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900">Free Tier</span>
                {currentTier === "FREE" && (
                  <span className="text-[10px] uppercase tracking-wider font-bold bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                    Current Plan
                  </span>
                )}
              </div>
              <ul className="text-xs text-gray-500 mt-1.5 space-y-1">
                <li className="flex items-center gap-1.5">
                  <Check size={14} className="text-green-600" />
                  <span>Max <strong>3 simultaneous queues</strong></span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check size={14} className="text-green-600" />
                  <span>Standard 24-hour decision lock</span>
                </li>
              </ul>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-gray-900">₦0</span>
              <p className="text-[11px] text-gray-400">Forever</p>
            </div>
          </div>

          {/* HYVE Plus Tier */}
          <div
            className={`border-2 rounded-xl p-4 flex items-center justify-between transition-all cursor-pointer relative overflow-hidden ${
              currentTier === "PREMIUM"
                ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                : "border-primary/40 hover:border-primary hover:shadow-md"
            }`}
            onClick={() => handleSelectTier("PREMIUM")}
          >
            <div className="absolute -right-8 -top-8 w-16 h-16 bg-primary/10 rounded-full pointer-events-none" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900 flex items-center gap-1.5">
                  <Zap size={16} className="text-primary" />
                  HYVE Plus
                </span>
                <span className="text-[10px] uppercase tracking-wider font-bold bg-primary text-white px-2 py-0.5 rounded-full">
                  Popular
                </span>
              </div>
              <ul className="text-xs text-gray-600 mt-1.5 space-y-1">
                <li className="flex items-center gap-1.5 font-medium">
                  <Check size={14} className="text-primary" />
                  <span>Max <strong>6 simultaneous queues</strong></span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check size={14} className="text-primary" />
                  <span>Instant SMS & WhatsApp slot notifications</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check size={14} className="text-primary" />
                  <span>24-hour decision window</span>
                </li>
              </ul>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold text-primary">₦4,999</span>
              <p className="text-[11px] text-gray-400">/ month</p>
              <button
                type="button"
                className="mt-2 text-xs font-semibold px-3 py-1 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
              >
                {currentTier === "PREMIUM" ? "Active" : "Upgrade"}
              </button>
            </div>
          </div>

          {/* HYVE Pro Tier */}
          <div
            className={`border-2 rounded-xl p-4 flex items-center justify-between transition-all cursor-pointer relative overflow-hidden ${
              currentTier === "PRO"
                ? "border-purple-600 bg-purple-50 ring-2 ring-purple-200"
                : "border-purple-200 hover:border-purple-500 hover:shadow-md"
            }`}
            onClick={() => handleSelectTier("PRO")}
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900 flex items-center gap-1.5">
                  <Crown size={16} className="text-purple-600" />
                  HYVE Pro
                </span>
                <span className="text-[10px] uppercase tracking-wider font-bold bg-purple-600 text-white px-2 py-0.5 rounded-full">
                  Maximum Access
                </span>
              </div>
              <ul className="text-xs text-gray-600 mt-1.5 space-y-1">
                <li className="flex items-center gap-1.5 font-medium">
                  <Check size={14} className="text-purple-600" />
                  <span>Max <strong>10 simultaneous queues</strong></span>
                </li>
                <li className="flex items-center gap-1.5 font-medium text-purple-700">
                  <Check size={14} className="text-purple-600" />
                  <span>Extended <strong>36-hour decision window</strong></span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check size={14} className="text-purple-600" />
                  <span>Dedicated HYVE verified concierge agent</span>
                </li>
              </ul>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold text-purple-700">₦9,999</span>
              <p className="text-[11px] text-gray-400">/ month</p>
              <button
                type="button"
                className="mt-2 text-xs font-semibold px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                {currentTier === "PRO" ? "Active" : "Upgrade"}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-center gap-2 text-xs text-gray-400">
          <Shield size={14} />
          <span>All subscriptions protected by HYVE Money-Back Guarantee</span>
        </div>
      </div>
    </div>
  );
};

export default UpgradeTierModal;
