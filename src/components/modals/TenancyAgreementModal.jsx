import React, { useRef } from 'react';
import { FiFileText, FiDownload, FiExternalLink } from 'react-icons/fi';
import { IoCloseOutline, IoCheckmarkCircle, IoShieldCheckmarkOutline } from 'react-icons/io5';

/**
 * Reusable Tenancy Agreement Template Modal
 * Facilitated by HYVE Haven Limited (RC 9000322)
 * Lagos State Tenancy Law Compliant (Effective April 2026)
 */
const TenancyAgreementModal = ({
    isOpen,
    onClose,
    onAccept,
    hasAccepted = false,
    showAcceptButton = false,
    tenantName = '',
    landlordName = '',
    propertyTitle = '',
    propertyAddress = '',
    annualRent = 0,
    cautionFee = 0,
    landlordDocUrls = [],
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
                                Standard Residential Tenancy Agreement
                            </h3>
                            <p className='text-[11px] sm:text-xs text-stone-500'>
                                Facilitated by HYVE Haven Limited · Lagos State Tenancy Law Compliant
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

                {/* Banner notice */}
                <div className='px-4 sm:px-6 py-2.5 bg-orange-50/70 border-b border-orange-100/80 flex items-center justify-between text-xs text-stone-700 shrink-0'>
                    <span className='font-medium text-primary'>
                        Please review all terms, tenant obligations, caution fee return rules, and attached landlord addendums before payment.
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
                            STANDARD RESIDENTIAL TENANCY AGREEMENT
                        </h3>
                        <p className='text-[10px] text-stone-400 mt-1 font-mono'>
                            HYVE Haven Limited  ·  RC 9000322  ·  Effective April 2026
                        </p>
                        <p className='text-[11px] text-stone-500 italic mt-1.5 max-w-lg mx-auto'>
                            This Tenancy Agreement is between the Landlord and Tenant named below and is facilitated by HYVE Haven Limited as a platform service. HYVE is not a party to this Agreement and is not responsible for the obligations of either party.
                        </p>
                    </div>

                    {/* Parties and Tenancy Summary Table */}
                    <div className='bg-white p-4 rounded-2xl border border-stone-200/80 space-y-3 shadow-xs'>
                        <h4 className='font-bold text-stone-900 text-xs uppercase tracking-wide'>
                            Parties & Tenancy Schedule
                        </h4>
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]'>
                            <div>
                                <span className='text-stone-400 block'>Landlord / Host</span>
                                <span className='font-semibold text-stone-800'>{landlordName || 'Verified Property Landlord'}</span>
                            </div>
                            <div>
                                <span className='text-stone-400 block'>Tenant</span>
                                <span className='font-semibold text-stone-800'>{tenantName || 'Verified HYVE Tenant'}</span>
                            </div>
                            <div>
                                <span className='text-stone-400 block'>Property / Title</span>
                                <span className='font-semibold text-stone-800'>{propertyTitle || 'Residential Accommodation'}</span>
                            </div>
                            <div>
                                <span className='text-stone-400 block'>Property Address</span>
                                <span className='font-semibold text-stone-800'>{propertyAddress || 'Lagos, Nigeria'}</span>
                            </div>
                            <div>
                                <span className='text-stone-400 block'>Annual Rent Amount</span>
                                <span className='font-bold text-primary font-montserrat'>
                                    {annualRent ? `₦${Number(annualRent).toLocaleString()} / year` : 'As listed'}
                                </span>
                            </div>
                            <div>
                                <span className='text-stone-400 block'>Caution Fee (Held by Landlord)</span>
                                <span className='font-semibold text-stone-800 font-montserrat'>
                                    {cautionFee ? `₦${Number(cautionFee).toLocaleString()}` : 'Per tenancy terms'}
                                </span>
                            </div>
                            <div>
                                <span className='text-stone-400 block'>Tenancy Duration</span>
                                <span className='font-semibold text-stone-800'>12 Months (1 Year Fixed Term)</span>
                            </div>
                            <div>
                                <span className='text-stone-400 block'>Payment Processed Via</span>
                                <span className='font-semibold text-emerald-700 flex items-center gap-1'>
                                    <IoShieldCheckmarkOutline /> HYVE Platform Escrow
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Section 1: Grant of Tenancy */}
                    <h4 className='font-bold text-stone-900 text-xs sm:text-sm uppercase tracking-wide pt-2'>
                        1. Grant of Tenancy
                    </h4>
                    <p className='text-stone-600'>
                        The Landlord hereby lets and the Tenant hereby takes the Property described above for the agreed duration and rent specified. This Tenancy is a fixed-term residential tenancy and shall expire on the Expiry Date unless renewed by mutual written agreement.
                    </p>

                    {/* Section 2: Rent */}
                    <h4 className='font-bold text-stone-900 text-xs sm:text-sm uppercase tracking-wide pt-2'>
                        2. Rent & Payment Terms
                    </h4>
                    <ul className='list-disc pl-5 space-y-1.5 text-stone-600'>
                        <li>
                            <strong>2.1 Payment of Rent:</strong> The Tenant shall pay rent in advance through the HYVE platform on the agreed due dates. Rent is considered paid upon HYVE's confirmation of successful escrow processing.
                        </li>
                        <li>
                            <strong>2.2 Late Payment:</strong> Rent not paid within 7 days of the due date shall attract the agreed late fee per week until paid. Landlord shall notify Tenant through the HYVE platform before imposing late fees.
                        </li>
                        <li>
                            <strong>2.3 Rent Review:</strong> Rent may only be reviewed at the end of the agreed tenancy period. Any proposed rent increase must be communicated in writing at least 60 days before the expiry of the current tenancy.
                        </li>
                    </ul>

                    {/* Section 3: Caution Fee */}
                    <h4 className='font-bold text-stone-900 text-xs sm:text-sm uppercase tracking-wide pt-2'>
                        3. Caution Fee (Security Deposit)
                    </h4>
                    <div className='p-3.5 bg-orange-50/70 border border-orange-200/60 rounded-xl space-y-1 text-stone-700 text-[11px]'>
                        <p className='font-semibold text-stone-900'>
                            Caution fees are collected and held directly by the Landlord (not held in HYVE Escrow).
                        </p>
                        <p className='text-stone-600'>
                            The caution fee is held as security for Tenant's obligations and shall be returned to the Tenant within <strong>14 days</strong> of the end of the tenancy, less any verified deductions for: (a) damage beyond fair wear and tear; (b) unpaid utility balances; or (c) unpaid rent. The Landlord must provide a written, itemised account of any deductions made.
                        </p>
                    </div>

                    {/* Section 4: Tenant's Obligations */}
                    <h4 className='font-bold text-stone-900 text-xs sm:text-sm uppercase tracking-wide pt-2'>
                        4. Tenant's Obligations
                    </h4>
                    <ul className='list-disc pl-5 space-y-1 text-stone-600'>
                        <li>Pay rent and all charges on time exclusively through the HYVE platform.</li>
                        <li>Use the property solely as a private residence and for no unlawful purpose.</li>
                        <li>Keep the property clean, tidy, and in good condition throughout the tenancy.</li>
                        <li>Not make alterations, additions, or structural changes without Landlord's prior written consent.</li>
                        <li>Not sublet the property or any part of it without Landlord's prior written consent.</li>
                        <li>Not keep pets without Landlord's prior written consent.</li>
                        <li>Report any maintenance issues, leaks, or defects promptly.</li>
                        <li>Not engage in activities constituting a nuisance to neighbours or violating Nigerian law.</li>
                        <li>Allow Landlord or representative access with at least 24 hours' notice for inspections or repairs.</li>
                        <li>Return the property in substantially the same condition as at move-in, fair wear and tear excepted.</li>
                    </ul>

                    {/* Section 5: Landlord's Obligations */}
                    <h4 className='font-bold text-stone-900 text-xs sm:text-sm uppercase tracking-wide pt-2'>
                        5. Landlord's Obligations
                    </h4>
                    <ul className='list-disc pl-5 space-y-1 text-stone-600'>
                        <li>Ensure property is in safe, habitable, and good condition at move-in.</li>
                        <li>Promptly carry out structural repairs and major maintenance upon notification.</li>
                        <li>Ensure quiet enjoyment of the premises without unlawful entry (minimum 24h notice required).</li>
                        <li>Return caution deposit within 14 days of vacancy less documented itemised deductions.</li>
                        <li>Comply fully with the Tenancy Law of Lagos State.</li>
                    </ul>

                    {/* Section 6: Utilities */}
                    <h4 className='font-bold text-stone-900 text-xs sm:text-sm uppercase tracking-wide pt-2'>
                        6. Utilities & Service Charges
                    </h4>
                    <p className='text-stone-600'>
                        Unless otherwise agreed in writing, Tenant is responsible for prepaid electricity meter recharging, water, internet, and estate waste disposal charges. Landlord shall disclose all applicable service charges before Tenant takes possession.
                    </p>

                    {/* Section 7, 8, 9, 10, 11 */}
                    <h4 className='font-bold text-stone-900 text-xs sm:text-sm uppercase tracking-wide pt-2'>
                        7. Renewal, Termination & Dispute Resolution
                    </h4>
                    <p className='text-stone-600'>
                        Renewal requests must be submitted at least 30 days prior to expiry through HYVE. Early termination by tenant requires agreed written notice. Any tenancy disputes must first be reported through the HYVE platform dispute resolution and mediation tool before escalation to arbitration or the Rent Tribunal of Lagos State.
                    </p>

                    {/* Section 10: HYVE's Platform Role */}
                    <div className='p-3 bg-stone-100/80 rounded-xl text-[11px] text-stone-600 space-y-1'>
                        <p className='font-bold text-stone-800'>10. HYVE's Platform Role & Non-Party Status</p>
                        <p>
                            HYVE Haven Limited facilitates introductions and payment processing between verified parties. HYVE is not a landlord, tenant, or party to this tenancy agreement and does not provide legal advice.
                        </p>
                    </div>

                    {/* Landlord Attached Documents / Addendums */}
                    {landlordDocUrls && landlordDocUrls.length > 0 && (
                        <div className='mt-4 p-4 bg-amber-50/60 border border-amber-200/70 rounded-2xl space-y-2'>
                            <h4 className='font-bold text-stone-900 text-xs uppercase tracking-wide flex items-center gap-1.5'>
                                <FiFileText className='text-amber-600' />
                                <span>Landlord's Specific Tenancy Addendums / Estate Rules</span>
                            </h4>
                            <p className='text-[11px] text-stone-600'>
                                The landlord has attached the following supplementary rules and agreements for this property:
                            </p>
                            <div className='space-y-1.5 pt-1'>
                                {landlordDocUrls.map((url, idx) => (
                                    <a
                                        key={idx}
                                        href={url}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='flex items-center justify-between p-2 rounded-xl bg-white border border-stone-200 hover:border-primary text-primary text-xs font-medium transition-colors'
                                    >
                                        <span className='truncate max-w-[80%]'>
                                            Document #{idx + 1}: Landlord Tenancy Attachment
                                        </span>
                                        <span className='inline-flex items-center gap-1 text-[11px] shrink-0 font-semibold'>
                                            View <FiExternalLink />
                                        </span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Signatures */}
                    <div className='mt-6 pt-4 border-t border-stone-200 grid grid-cols-2 gap-4 text-stone-600'>
                        <div className='space-y-1'>
                            <p className='font-bold text-stone-800 text-[11px]'>LANDLORD / CARETAKER:</p>
                            <p className='text-xs font-semibold text-stone-900'>
                                {landlordName || 'Property Landlord / Host'}
                            </p>
                            <p className='text-[10px] text-stone-400'>Listing Covenant Executed</p>
                            <p className='text-[10px] text-emerald-600 font-medium'>✓ Digital Authorization</p>
                        </div>
                        <div className='space-y-1'>
                            <p className='font-bold text-stone-800 text-[11px]'>TENANT CONFIRMATION:</p>
                            <p className='text-xs font-semibold text-stone-900'>
                                {tenantName || 'Pending Payment Confirmation'}
                            </p>
                            <p className='text-[10px] text-stone-400'>HYVE Platform Verified</p>
                            <p className='text-[10px] text-emerald-600 font-medium'>
                                {hasAccepted ? '✓ Tenancy Terms Accepted' : 'Awaiting Acceptance'}
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
                                <span>I Accept Tenancy Agreement</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TenancyAgreementModal;
