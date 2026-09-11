import React from "react";
import { CgClose } from "react-icons/cg";
import { AlertTriangle } from "lucide-react";
import { hyveSuccess } from "../../utils/hyveToast";

const PassSlotModal = ({ isOpen, onClose, queue, onConfirmPass }) => {
  if (!isOpen || !queue) return null;

  const handlePass = () => {
    onConfirmPass(queue.id);
    hyveSuccess("Turn Passed", "Your slot has been passed to the next person in line. 1 queue slot freed.");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md p-6 md:p-8 shadow-2xl relative text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-700"
        >
          <CgClose size={18} />
        </button>

        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
          <AlertTriangle size={24} />
        </div>

        <h3 className="text-xl font-bold font-montserrat text-gray-900">
          Pass Your Turn?
        </h3>
        <p className="text-xs sm:text-sm text-gray-500 mt-2 leading-relaxed">
          Are you sure you want to pass on <strong>{queue.property}</strong>? Your exclusive 24-hour window will end immediately and the apartment will be offered to <strong>Person #2</strong> in line.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={handlePass}
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-sm shadow-md transition-colors cursor-pointer"
          >
            Yes, Pass to Next Person
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 border border-gray-200 text-gray-700 rounded-xl text-xs font-medium hover:bg-gray-50"
          >
            Cancel & Keep My Slot
          </button>
        </div>
      </div>
    </div>
  );
};

export default PassSlotModal;
