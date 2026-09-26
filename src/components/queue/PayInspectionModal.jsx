import React, { useState } from "react";
import { CgClose } from "react-icons/cg";
import { ShieldCheck, Loader2, CreditCard, CheckCircle2 } from "lucide-react";
import { hyveSuccess, hyveError } from "../../utils/hyveToast";
import { calculateInspectionFee, formatNaira } from "../../utils/feeCalculations";

const PayInspectionModal = ({ isOpen, onClose, queue, onConfirmPayment }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !queue) return null;

  const fee = calculateInspectionFee(queue);

  const handlePay = async () => {
    setIsProcessing(true);
    try {
      await onConfirmPayment(queue.id);
      hyveSuccess(
        "Inspection Fee Paid!",
        "Agent contact and 24-hour exclusive decision window unlocked."
      );
      onClose();
    } catch (err) {
      hyveError("Payment Failed", err?.message || "Could not process inspection fee payment");
    } finally {
      setIsProcessing(false);
    }
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
            It's your turn for <strong>{queue.property || "this apartment"}</strong>. Pay the inspection fee to unlock the agent's verified contact and confirm your exclusive tour.
          </p>
        </div>

        {/* Tier category indicator */}
        <div className="flex items-center justify-between px-3.5 py-2 bg-orange-50/70 border border-orange-200/70 rounded-xl mb-4 text-xs">
          <span className="text-gray-600">Property Tier:</span>
          <span className="font-bold text-primary font-poppins">{fee.label}</span>
        </div>

        {/* Dynamic Transparent Fee Breakdown Card */}
        <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 mb-5 space-y-2.5">
          <div className="flex justify-between items-center text-xs sm:text-sm">
            <span className="text-gray-600">Supplier / Agent Logistics</span>
            <span className="font-semibold text-gray-900">{formatNaira(fee.supplierBaseFee)}</span>
          </div>
          <div className="flex justify-between items-center text-xs sm:text-sm">
            <span className="text-gray-600">HYVE Inspection & Verification</span>
            <span className="font-semibold text-gray-900">{formatNaira(fee.hyveShare)}</span>
          </div>
          <div className="border-t border-gray-200 pt-2.5 flex justify-between items-center text-sm sm:text-base font-bold">
            <span className="text-gray-900">Total Inspection Fee</span>
            <span className="text-primary font-bold">{formatNaira(fee.totalFee)}</span>
          </div>
        </div>

        {/* Anti-Fraud Guarantee Note */}
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-green-50 border border-green-200 text-xs text-green-800 mb-6">
          <ShieldCheck size={18} className="text-green-600 shrink-0 mt-0.5" />
          <p>
            <strong>HYVE Anti-Fraud & Escrow Guarantee:</strong> Supplier base logistics fee ({formatNaira(fee.supplierBaseFee)}) is only released when you confirm the viewing.
          </p>
        </div>

        {/* CTA Actions */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handlePay}
            disabled={isProcessing}
            className="w-full py-3.5 bg-primary hover:bg-primary-hover active:scale-[0.99] text-white rounded-xl font-semibold text-xs sm:text-sm shadow-md shadow-primary/20 flex items-center justify-center gap-2 smooth-transition disabled:opacity-60 cursor-pointer"
          >
            {isProcessing ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Processing Secure Payment...</span>
              </>
            ) : (
              <span>Pay {formatNaira(fee.totalFee)} Securely</span>
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 border border-gray-200 text-gray-600 rounded-xl text-xs font-medium hover:bg-gray-50 cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default PayInspectionModal;
