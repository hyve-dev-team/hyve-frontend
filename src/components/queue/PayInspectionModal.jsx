import React, { useState } from "react";
import { CgClose } from "react-icons/cg";
import { ShieldCheck, Phone, CheckCircle, Loader2, CreditCard } from "lucide-react";
import { hyveSuccess } from "../../utils/hyveToast";

const PayInspectionModal = ({ isOpen, onClose, queue, onConfirmPayment }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !queue) return null;

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      onConfirmPayment(queue.id);
      setIsProcessing(false);
      hyveSuccess(
        "Inspection Fee Paid!",
        "Agent contact and 24-hour exclusive decision window unlocked."
      );
      onClose();
    }, 1200);
  };

  return (
    <div
      className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md p-6 md:p-8 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-700"
        >
          <CgClose size={18} />
        </button>

        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
            <CreditCard size={24} />
          </div>
          <h3 className="text-xl font-bold font-montserrat text-gray-900">
            Pay Inspection Fee
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            It's your turn for <strong>{queue.property}</strong>. Pay the inspection fee to unlock the agent's direct phone number and schedule your private tour.
          </p>
        </div>

        {/* Fee breakdown card */}
        <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 mb-5 space-y-2.5">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Inspection Fee</span>
            <span className="font-semibold text-gray-900">₦ 5,000</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Service & Escrow Security</span>
            <span className="font-semibold text-green-600">Free (Included)</span>
          </div>
          <div className="border-t border-gray-200 pt-2 flex justify-between items-center text-base font-bold">
            <span className="text-gray-900">Total Payable</span>
            <span className="text-primary font-bold">₦ 5,000</span>
          </div>
        </div>

        {/* Guarantee note */}
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-green-50 border border-green-200 text-xs text-green-800 mb-6">
          <ShieldCheck size={18} className="text-green-600 shrink-0 mt-0.5" />
          <p>
            <strong>Hyve Haven Anti-Fraud Guarantee:</strong> Inspection fees on Hyve Haven are strictly regulated. The agent only gets paid when you confirm the viewing.
          </p>
        </div>

        {/* CTA */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handlePay}
            disabled={isProcessing}
            className="w-full py-3.5 bg-primary hover:bg-primary-hover active:scale-[0.99] text-white rounded-xl font-semibold text-sm shadow-md shadow-primary/20 flex items-center justify-center gap-2 smooth-transition disabled:opacity-60 cursor-pointer"
          >
            {isProcessing ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Processing Secure Payment...</span>
              </>
            ) : (
              <span>Pay ₦ 5,000 Securely</span>
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 border border-gray-200 text-gray-600 rounded-xl text-xs font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default PayInspectionModal;
