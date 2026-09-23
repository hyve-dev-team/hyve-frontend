import React, { useRef } from 'react';
import { FiFileText, FiDownload } from 'react-icons/fi';
import { IoCloseOutline, IoCheckmarkCircle } from 'react-icons/io5';

/**
 * Reusable Landlord Partnership Agreement Modal
 * NDPR & Lagos State Rental Laws Compliant (April 2026)
 */
const LandlordAgreementModal = ({
    isOpen,
    onClose,
    onAccept,
    hasAccepted = false,
    showAcceptButton = false,
    landlordName = '',
    propertyAddress = '',
}) => {
    const printableRef = useRef(null);

    if (!isOpen) return null;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4'>
            <div className='bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200'>
                {/* Modal Header */}
                <div className='p-4 sm:p-6 border-b border-stone-100 flex items-center justify-between bg-white shrink-0'>
                    <div className='flex items-center gap-3'>
                        <div className='w-10 h-10 rounded-2xl bg-orange-50 text-primary flex items-center justify-center text-xl shrink-0'>
                            <FiFileText />
                        </div>
                        <div>
                            <h3 className='text-sm sm:text-base font-bold text-stone-900'>
                                HYVE Landlord Partnership Agreement
                            </h3>
                            <p className='text-[11px] sm:text-xs text-stone-500'>
                                Legal Listing Covenant & Standards for Platform Conduct (RC 9000322)
                            </p>
                        </div>
                    </div>
                    <button
                        type='button'
                        onClick={onClose}
                        className='p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors'
                        aria-label='Close modal'
                    >
                        <IoCloseOutline className='text-2xl' />
                    </button>
                </div>

                {/* Notice banner */}
                <div className='px-4 sm:px-6 py-2.5 bg-orange-50/70 border-b border-orange-100/80 flex items-center justify-between text-xs text-stone-700 shrink-0'>
                    <span className='font-medium text-primary'>
                        Please review the listing terms, dispute mediation, and commission policy (5%).
                    </span>
                    <button
                        type='button'
                        onClick={handlePrint}
                        className='hidden sm:flex items-center gap-1 text-xs font-semibold text-primary hover:underline cursor-pointer'
                    >
                        <FiDownload /> Print / Save PDF
                    </button>
                </div>

                {/* Modal Body: Agreement Full Text */}
                <div
                    ref={printableRef}
                    className='p-5 sm:p-7 overflow-y-auto space-y-4 text-xs text-stone-700 leading-relaxed font-normal bg-[#FAF7F5]/40 select-text'
                >
                    <div className='text-center pb-3 border-b border-stone-200'>
                        <h2 className='text-sm sm:text-base font-bold text-stone-900 tracking-tight uppercase'>
                            HYVE HAVEN LIMITED
                        </h2>
                        <h3 className='text-xs font-semibold text-primary uppercase tracking-wide mt-0.5'>
                            LANDLORD PARTNERSHIP AGREEMENT
                        </h3>
                        <p className='text-[10px] text-stone-400 mt-1 font-mono'>
                            HYVE Haven Limited  ·  RC 9000322  ·  Lagos, Nigeria  ·  April 2026
                        </p>
                    </div>

                    <p className='text-stone-600 italic'>
                        This Landlord Partnership Agreement ("Agreement") is entered into between{' '}
                        <strong>HYVE Haven Limited (RC 9000322)</strong>, with principal office in Lagos, Nigeria ("HYVE"), and the Landlord / Host / Caretaker:
                    </p>

                    <div className='bg-white p-3.5 rounded-xl border border-stone-200/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-stone-700 text-[11px]'>
                        <div>
                            <span className='font-semibold text-stone-500'>Landlord / Host: </span>
                            <span className='font-medium'>{landlordName || 'Registered Account Holder'}</span>
                        </div>
                        <div>
                            <span className='font-semibold text-stone-500'>Property Address: </span>
                            <span className='font-medium'>{propertyAddress || 'To be specified upon listing'}</span>
                        </div>
                    </div>

                    <h4 className='font-bold text-stone-900 text-xs sm:text-sm uppercase tracking-wide pt-2'>
                        1. Services Provided by HYVE
                    </h4>
                    <p>HYVE shall provide the following services to the Landlord:</p>
                    <ul className='list-disc pl-5 space-y-1 text-stone-600'>
                        <li>Listing of the Property on the HYVE Platform with photos, descriptions, and rental details.</li>
                        <li>Tenant verification services including ID verification and background checks.</li>
                        <li>Queue management system for multiple interested tenants with exclusive decision windows.</li>
                        <li>Secure escrow payment processing for initial rent and deposits.</li>
                        <li>Recurring monthly rent payment processing and automated reminders to tenants.</li>
                        <li>Legal documentation and rental agreement support.</li>
                        <li>Basic dispute mediation services for common landlord-tenant issues (see Section 1.1).</li>
                        <li>Customer support for both Landlord and tenants throughout the rental period.</li>
                    </ul>

                    <div className='p-3 bg-white border border-stone-200 rounded-xl space-y-1.5'>
                        <h5 className='font-bold text-stone-900 text-xs'>1.1 Dispute Mediation Services</h5>
                        <p className='text-[11px] text-stone-600'>
                            HYVE provides first-level mediation for common landlord-tenant disputes including maintenance disagreements, security deposit returns, minor damage claims, lease interpretation, and communication breakdowns.
                        </p>
                        <p className='text-[11px] text-stone-600'>
                            <strong>How It Works:</strong> Either party can request mediation via the app. HYVE reviews evidence (photos, messages, receipts) and delivers a written recommendation within 48–72 hours. HYVE mediation is advisory and not legally binding; criminal or complex court matters require legal counsel.
                        </p>
                    </div>

                    <h4 className='font-bold text-stone-900 text-xs sm:text-sm uppercase tracking-wide pt-2'>
                        2. Commission and Payment Terms
                    </h4>
                    <ul className='list-disc pl-5 space-y-1.5 text-stone-600'>
                        <li>
                            <strong>2.1 Commission Structure:</strong> Landlord agrees to pay HYVE a commission of <strong>five percent (5%)</strong> of the total annual rent upon successful completion of a rental transaction, in accordance with Lagos State rental agency laws.
                        </li>
                        <li>
                            <strong>2.2 Payment Timeline:</strong> Payment to Landlord shall be disbursed within <strong>48 hours</strong> after the escrow clears and the tenant confirms move-in. HYVE's commission is automatically deducted before disbursement.
                        </li>
                        <li>
                            <strong>2.3 Recurring Rent Payments:</strong> For monthly recurring rent payments processed through HYVE, a processing fee of <strong>1.5%</strong> will be deducted from each payment to cover platform maintenance and payment processing.
                        </li>
                        <li>
                            <strong>2.4 No Upfront Fees:</strong> HYVE does NOT charge any upfront listing fees. Landlord only pays commission upon successful rental.
                        </li>
                    </ul>

                    <h4 className='font-bold text-stone-900 text-xs sm:text-sm uppercase tracking-wide pt-2'>
                        3. Listing Terms and Property Availability
                    </h4>
                    <ul className='list-disc pl-5 space-y-1.5 text-stone-600'>
                        <li>
                            <strong>3.1 Listing Duration:</strong> Listings remain active on HYVE until rented or removed with 48 hours notice.
                        </li>
                        <li>
                            <strong>3.2 Listing Removal:</strong> Landlord may remove a listing with 48 hours written notice provided NO tenant is currently in an ACTIVE viewing window in the queue, or a valid documented emergency exists. <em>If a tenant is active in the queue or has committed payment, Landlord cannot remove the listing without incurring full 5% commission forfeiture and a 90-day platform blacklist.</em>
                        </li>
                        <li>
                            <strong>3.3 Platform Exclusivity:</strong> Non-exclusive listings are permitted; however, HYVE-exclusive listings receive premium placement. Once a tenant commits through HYVE, the property must be delisted from all other platforms within 24 hours.
                        </li>
                    </ul>

                    <h4 className='font-bold text-stone-900 text-xs sm:text-sm uppercase tracking-wide pt-2'>
                        4. Landlord Responsibilities
                    </h4>
                    <p className='text-stone-600'>
                        Landlord agrees to provide truthful information, ensure property habitability, be available during tenant viewing windows, respond to inquiries within 24 hours, honor committed agreements, maintain the property, and uphold non-discrimination policies (no bias based on tribe, religion, or gender).
                    </p>

                    <h4 className='font-bold text-stone-900 text-xs sm:text-sm uppercase tracking-wide pt-2'>
                        5. HYVE's Responsibilities & Liability Limitations
                    </h4>
                    <p className='text-stone-600'>
                        HYVE verifies tenants, facilitates escrow payments, sends automated rent reminders (14 days before due), immediately flags missed/late payments within 24 hours, and disburses funds within 48 hours of move-in.
                    </p>
                    <div className='p-3 bg-red-50/50 border border-red-200/60 rounded-xl text-[11px] text-stone-700 space-y-1'>
                        <p className='font-bold text-red-900'>Section 7.2 Liability Limits on Rent Collection:</p>
                        <p>
                            HYVE facilitates payment processing and flags defaults, but is NOT responsible for a tenant's willingness or financial ability to pay, does not act as a debt collection agency, and does not guarantee payment if a tenant defaults post-move-in. Landlord retains all statutory rights to pursue legal eviction under Nigerian law.
                        </p>
                    </div>

                    <h4 className='font-bold text-stone-900 text-xs sm:text-sm uppercase tracking-wide pt-2'>
                        6. Governing Law & Dispute Resolution
                    </h4>
                    <p className='text-stone-600'>
                        This Agreement is governed by the laws of the Federal Republic of Nigeria and Lagos State rental agency regulations. Any disputes shall first be resolved through good faith negotiations, failing which they shall be submitted to arbitration in Lagos, Nigeria.
                    </p>

                    {/* Signature block */}
                    <div className='mt-5 pt-4 border-t border-stone-200 grid grid-cols-2 gap-4 text-stone-600'>
                        <div className='space-y-1'>
                            <p className='font-bold text-stone-800 text-[11px]'>FOR HYVE HAVEN LIMITED:</p>
                            <p className='text-xs font-semibold text-stone-900'>Praise Osedeme</p>
                            <p className='text-[10px] text-stone-400'>Chief Executive Officer</p>
                            <p className='text-[10px] text-emerald-600 font-medium'>✓ Digitally Authorized</p>
                        </div>
                        <div className='space-y-1'>
                            <p className='font-bold text-stone-800 text-[11px]'>FOR LANDLORD / HOST:</p>
                            <p className='text-xs font-semibold text-stone-900'>
                                {landlordName || 'Authorized Landlord / Host'}
                            </p>
                            <p className='text-[10px] text-stone-400'>Listing Covenant Acceptance</p>
                            <p className='text-[10px] text-emerald-600 font-medium'>
                                {hasAccepted ? '✓ Agreed & Accepted' : 'Pending Confirmation'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className='p-4 border-t border-stone-100 flex items-center justify-between bg-white shrink-0 gap-3'>
                    <button
                        type='button'
                        onClick={onClose}
                        className='px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-colors cursor-pointer'
                    >
                        Close
                    </button>

                    <div className='flex items-center gap-2'>
                        <button
                            type='button'
                            onClick={handlePrint}
                            className='px-4 py-2.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer'
                        >
                            <FiDownload />
                            <span>Download / Print</span>
                        </button>

                        {showAcceptButton && (
                            <button
                                type='button'
                                onClick={() => {
                                    if (onAccept) onAccept();
                                    onClose();
                                }}
                                className='px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-primary/20 transition-colors cursor-pointer'
                            >
                                <IoCheckmarkCircle className='text-base' />
                                <span>I Understand & Agree</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LandlordAgreementModal;
