import React from 'react';
import { 
  IoClose, 
  IoCallOutline, 
  IoLogoWhatsapp, 
  IoMailOutline, 
  IoCalendarOutline, 
  IoShieldCheckmarkOutline, 
  IoCopyOutline, 
  IoTimeOutline,
  IoCashOutline,
  IoCheckmarkCircle
} from 'react-icons/io5';
import { hyveSuccess } from '../../utils/hyveToast';

const TenantProfileModal = ({ isOpen, onClose, tenant, propertyTitle }) => {
  if (!isOpen || !tenant) return null;

  const initials = tenant.fullName
    ? tenant.fullName
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : (tenant.firstName?.[0] || 'T').toUpperCase();

  const formattedMoveIn = tenant.moveInDate
    ? new Date(tenant.moveInDate).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    : 'Not specified';

  const formattedExpiry = tenant.rentExpiryDate
    ? new Date(tenant.rentExpiryDate).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    : 'Ongoing / 1 Year';

  // Calculate days remaining if rentExpiryDate is available
  let daysRemaining = null;
  if (tenant.rentExpiryDate) {
    const diffTime = new Date(tenant.rentExpiryDate).getTime() - Date.now();
    daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  const cleanPhone = tenant.phone ? tenant.phone.replace(/[^0-9]/g, '') : '';
  const whatsappUrl = cleanPhone ? `https://wa.me/${cleanPhone}` : null;

  const handleCopyRef = () => {
    if (tenant.referenceNumber) {
      navigator.clipboard.writeText(tenant.referenceNumber);
      hyveSuccess('Copied', 'Lease reference copied to clipboard');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-black/5 transform transition-all animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div className="relative bg-gradient-to-r from-[#FF6300] to-[#FF8533] p-6 text-white pb-14">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
            aria-label="Close modal"
          >
            <IoClose size={20} />
          </button>
          <div className="flex items-center gap-2 text-white/90 text-xs font-medium uppercase tracking-wider">
            <IoShieldCheckmarkOutline className="text-sm" /> Verified Hyve Tenant
          </div>
          <h2 className="text-xl font-bold font-poppins mt-1">Tenant Profile</h2>
          <p className="text-xs text-white/80 line-clamp-1">{propertyTitle || 'Occupied Property'}</p>
        </div>

        {/* Profile Card & Avatar */}
        <div className="px-6 relative -mt-10 pb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                {tenant.profilePictureUrl ? (
                  <img
                    src={tenant.profilePictureUrl}
                    alt={tenant.fullName || 'Tenant profile'}
                    className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md bg-white"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full border-4 border-white shadow-md bg-primary text-white flex items-center justify-center font-poppins font-bold text-2xl">
                    {initials}
                  </div>
                )}
                <span 
                  className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-xs" 
                  title="Active resident"
                />
              </div>

              <div>
                <h3 className="font-poppins text-lg font-bold text-[#3D3129] flex items-center gap-1.5">
                  {tenant.fullName || `${tenant.firstName || ''} ${tenant.lastName || ''}`.trim() || 'Verified Tenant'}
                  <IoCheckmarkCircle className="text-emerald-500 text-base" title="KYC Verified" />
                </h3>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                  Active Lease
                </span>
              </div>
            </div>

            {/* Quick Call / WhatsApp actions */}
            <div className="flex items-center gap-2">
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold shadow-sm transition-all"
                >
                  <IoLogoWhatsapp size={15} /> WhatsApp
                </a>
              )}
              {tenant.phone && (
                <a
                  href={`tel:${tenant.phone}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-[#3D3129] text-xs font-semibold transition-all border border-stone-200"
                >
                  <IoCallOutline size={14} /> Call
                </a>
              )}
            </div>
          </div>

          {/* Contact Details Grid */}
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-stone-50 border border-stone-100">
              <span className="text-stone-400 font-medium flex items-center gap-1.5 mb-1">
                <IoCallOutline /> Phone Number
              </span>
              <p className="font-semibold text-stone-800 font-mono">
                {tenant.phone || 'Phone hidden by privacy'}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-stone-50 border border-stone-100">
              <span className="text-stone-400 font-medium flex items-center gap-1.5 mb-1">
                <IoMailOutline /> Email Address
              </span>
              <p className="font-semibold text-stone-800 truncate" title={tenant.email}>
                {tenant.email || 'Email not provided'}
              </p>
            </div>
          </div>

          {/* Tenancy & Rent Duration Details */}
          <div className="mt-4 p-4 rounded-2xl bg-[#FFF9F6] border border-orange-200">
            <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <IoCalendarOutline /> Lease Details
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-stone-500">Move-in Date</span>
                <p className="font-bold text-stone-800 mt-0.5">{formattedMoveIn}</p>
              </div>
              <div>
                <span className="text-stone-500">Rent Expiry Date</span>
                <p className="font-bold text-stone-800 mt-0.5">{formattedExpiry}</p>
              </div>
              <div>
                <span className="text-stone-500">Rent Duration</span>
                <p className="font-bold text-stone-800 mt-0.5">
                  {tenant.durationMonths ? `${tenant.durationMonths} Months` : '12 Months (1 Year)'}
                </p>
              </div>
              <div>
                <span className="text-stone-500">Lease Countdown</span>
                <p className={`font-bold mt-0.5 flex items-center gap-1 ${
                  daysRemaining !== null && daysRemaining <= 30 ? 'text-amber-600' : 'text-emerald-700'
                }`}>
                  <IoTimeOutline />
                  {daysRemaining !== null 
                    ? daysRemaining > 0 ? `${daysRemaining} days left` : 'Expired / Renewal due'
                    : 'Active'}
                </p>
              </div>
            </div>

            {/* Financial Summary */}
            {(tenant.annualRent != null || tenant.monthlyRent != null) && (
              <div className="mt-3 pt-3 border-t border-orange-200/60 flex items-center justify-between text-xs">
                <span className="text-stone-600 flex items-center gap-1 font-medium">
                  <IoCashOutline className="text-primary text-sm" /> Annual Rent:
                </span>
                <span className="font-bold text-primary font-poppins text-sm">
                  ₦ {Number(tenant.annualRent || (tenant.monthlyRent * 12)).toLocaleString()}
                </span>
              </div>
            )}
          </div>

          {/* Escrow Lease Reference */}
          {tenant.referenceNumber && (
            <div className="mt-3 flex items-center justify-between p-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs">
              <div>
                <span className="text-stone-500 block text-[11px]">Hyve Escrow Lease Ref</span>
                <span className="font-mono font-bold text-stone-800">{tenant.referenceNumber}</span>
              </div>
              <button
                type="button"
                onClick={handleCopyRef}
                className="flex items-center gap-1 px-3 py-1 rounded-lg bg-white border border-stone-300 text-stone-700 font-medium hover:bg-stone-100 transition-colors shadow-2xs"
              >
                <IoCopyOutline /> Copy
              </button>
            </div>
          )}

          {/* Action buttons */}
          <div className="mt-5 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantProfileModal;
