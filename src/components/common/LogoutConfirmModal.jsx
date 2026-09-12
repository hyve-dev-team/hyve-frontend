import React from "react";
import { IoLogOutOutline } from "react-icons/io5";

const LogoutConfirmModal = ({ isOpen, onClose, onConfirm, isLoading = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div
        className="bg-white w-full max-w-sm rounded-3xl p-6 sm:p-7 shadow-2xl relative animate-in zoom-in-95 duration-150 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-100">
          <IoLogOutOutline size={28} className="translate-x-0.5" />
        </div>

        {/* Title & Description */}
        <h3 className="text-lg sm:text-xl font-bold font-montserrat text-gray-900">
          Log Out of Hyve Haven?
        </h3>
        <p className="mt-2 text-xs sm:text-sm text-gray-500 leading-relaxed">
          Are you sure you want to end your session? You will be redirected to the sign-in page.
        </p>

        {/* Buttons */}
        <div className="mt-6 flex flex-col-reverse sm:flex-row gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-3 px-4 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl font-semibold text-xs sm:text-sm transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 active:scale-[0.99] text-white rounded-xl font-semibold text-xs sm:text-sm transition-all shadow-md shadow-red-600/20 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? "Logging Out..." : "Yes, Log Out"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutConfirmModal;
