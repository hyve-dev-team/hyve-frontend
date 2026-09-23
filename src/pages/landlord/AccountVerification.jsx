import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar/Sidebar';
import Header from './components/layout/Dashboard/Header';
import MobileNavigationTab from './components/layout/MobileNavigation/MobileNavigationTab';
import config from '../../config';
import { hyveSuccess, hyveError } from '../../utils/hyveToast';
import { uploadMediaFiles } from '../../utils/mediaApi';

import { GoClock } from 'react-icons/go';
import { FiCheckCircle, FiUploadCloud, FiXCircle, FiExternalLink, FiDownload, FiFileText } from 'react-icons/fi';
import { IoArrowBackOutline, IoCloseOutline } from 'react-icons/io5';
import { HiOutlineDocumentText, HiOutlineShieldCheck, HiOutlineSparkles } from 'react-icons/hi2';
import LandlordAgreementModal from '../../components/modals/LandlordAgreementModal';

const AccountVerification = () => {
    const navigate = useNavigate();

    // 4 strictly required verification documents:
    // 1. Normal ID verifications
    // 2. photo, property proof of ownership/ caretaker authorisation (deed, tenancy, agreement, landlord letter)
    // 3. Property address proof doc
    // 4. Hyve landlord agreements signed
    const [documents, setDocuments] = useState({
        idDoc: null,
        ownershipProof: null,
        addressProof: null,
        agreement: null,
    });

    const [docFiles, setDocFiles] = useState({
        idDoc: null,
        ownershipProof: null,
        addressProof: null,
        agreement: null,
    });

    const docRefs = {
        idDoc: useRef(null),
        ownershipProof: useRef(null),
        addressProof: useRef(null),
        agreement: useRef(null),
    };

    const prevDocUrlsRef = useRef({});
    const [verificationStatus, setVerificationStatus] = useState(null); // 'pending' | 'verified' | 'rejected'
    const [rejectionReason, setRejectionReason] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingStatus, setIsLoadingStatus] = useState(true);
    const [showAgreementModal, setShowAgreementModal] = useState(false);

    // Fetch existing status from backend on mount
    useEffect(() => {
        const fetchStatus = async () => {
            try {
                setIsLoadingStatus(true);
                const res = await config.getAPI({
                    url: '/api/v1/landlord/verification/status'
                });
                if (res?.success && res?.data) {
                    const data = res.data;
                    const st = (data.status || '').toLowerCase();
                    setVerificationStatus(st);
                    setRejectionReason(data.rejectionReason);

                    setDocuments({
                        idDoc: (data.idDocumentUrl || data.selfieUrl)
                            ? { url: data.idDocumentUrl || data.selfieUrl, name: 'Normal ID Document', size: 'Verified Upload' }
                            : null,
                        ownershipProof: (data.ownershipProofUrl || data.cofoUrl || data.deedUrl)
                            ? { url: data.ownershipProofUrl || data.cofoUrl || data.deedUrl, name: 'Proof of Ownership / Caretaker Authorisation', size: 'Verified Upload' }
                            : null,
                        addressProof: (data.addressProofUrl || data.surveyPlanUrl)
                            ? { url: data.addressProofUrl || data.surveyPlanUrl, name: 'Property Address Proof', size: 'Verified Upload' }
                            : null,
                        agreement: (data.signedAgreementUrl || data.cacUrl)
                            ? { url: data.signedAgreementUrl || data.cacUrl, name: 'Signed Hyve Landlord Agreement', size: 'Verified Upload' }
                            : null,
                    });
                } else {
                    const userStr = localStorage.getItem('user');
                    if (userStr) {
                        const u = JSON.parse(userStr);
                        if (u?.kycStatus) {
                            setVerificationStatus(u.kycStatus.toLowerCase());
                        }
                    }
                }
            } catch (err) {
                console.warn('Could not fetch verification status:', err);
            } finally {
                setIsLoadingStatus(false);
            }
        };

        fetchStatus();
    }, []);

    const handleDocClick = (key) => {
        docRefs[key].current?.click();
    };

    const handleDocChange = (key) => (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setDocFiles((prev) => ({ ...prev, [key]: file }));
        const url = URL.createObjectURL(file);
        if (prevDocUrlsRef.current[key]) URL.revokeObjectURL(prevDocUrlsRef.current[key]);
        prevDocUrlsRef.current[key] = url;
        setDocuments((prev) => ({ ...prev, [key]: { url, name: file.name, size: (file.size / 1024).toFixed(0) + ' KB' } }));
    };

    useEffect(() => {
        return () => {
            Object.values(prevDocUrlsRef.current).forEach((url) => {
                if (url) URL.revokeObjectURL(url);
            });
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate strictly the 4 required documents
        if (!documents.idDoc) {
            hyveError('Document Missing', 'Please upload your Normal ID verification (e.g. NIN, National ID, Passport, Driver’s License).');
            return;
        }

        if (!documents.ownershipProof) {
            hyveError('Document Missing', 'Please upload your photo or document of property proof of ownership or caretaker authorisation (deed, tenancy, agreement, landlord letter).');
            return;
        }

        if (!documents.addressProof) {
            hyveError('Document Missing', 'Please upload your Property address proof document (e.g. utility bill, LAWMA, PHCN).');
            return;
        }

        if (!documents.agreement) {
            hyveError('Document Missing', 'Please upload your signed Hyve Landlord Agreement.');
            return;
        }

        setIsSubmitting(true);
        try {
            // 1. Upload new files to media endpoint if selected
            let uploadedIdDocUrl = documents.idDoc?.url?.startsWith('blob:') ? null : documents.idDoc?.url;
            let uploadedOwnershipUrl = documents.ownershipProof?.url?.startsWith('blob:') ? null : documents.ownershipProof?.url;
            let uploadedAddressUrl = documents.addressProof?.url?.startsWith('blob:') ? null : documents.addressProof?.url;
            let uploadedAgreementUrl = documents.agreement?.url?.startsWith('blob:') ? null : documents.agreement?.url;

            if (docFiles.idDoc) {
                const res = await uploadMediaFiles([docFiles.idDoc], 'kyc');
                if (res && res[0]) uploadedIdDocUrl = res[0];
            }
            if (docFiles.ownershipProof) {
                const res = await uploadMediaFiles([docFiles.ownershipProof], 'kyc');
                if (res && res[0]) uploadedOwnershipUrl = res[0];
            }
            if (docFiles.addressProof) {
                const res = await uploadMediaFiles([docFiles.addressProof], 'kyc');
                if (res && res[0]) uploadedAddressUrl = res[0];
            }
            if (docFiles.agreement) {
                const res = await uploadMediaFiles([docFiles.agreement], 'kyc');
                if (res && res[0]) uploadedAgreementUrl = res[0];
            }

            if (!uploadedIdDocUrl || !uploadedOwnershipUrl || !uploadedAddressUrl || !uploadedAgreementUrl) {
                hyveError('Upload Incomplete', 'Could not upload all required documents. Please check your network and try again.');
                setIsSubmitting(false);
                return;
            }

            // 2. Submit verification application with the 4 documents
            const payload = {
                idDocumentUrl: uploadedIdDocUrl,
                ownershipProofUrl: uploadedOwnershipUrl,
                addressProofUrl: uploadedAddressUrl,
                signedAgreementUrl: uploadedAgreementUrl,
                // Legacy field mappings for fallback
                selfieUrl: uploadedIdDocUrl,
                cofoUrl: uploadedOwnershipUrl,
                surveyPlanUrl: uploadedAddressUrl,
                cacUrl: uploadedAgreementUrl,
            };

            const submitRes = await config.postAPI({
                url: '/api/v1/landlord/verification/submit',
                params: payload,
            });

            if (submitRes?.success) {
                setVerificationStatus('pending');
                setRejectionReason(null);
                hyveSuccess('Verification Submitted', 'Your documents are being reviewed by the Hyve Haven compliance team.');

                // Update local storage user KYC status
                const userStr = localStorage.getItem('user');
                if (userStr) {
                    const u = JSON.parse(userStr);
                    u.kycStatus = 'PENDING';
                    localStorage.setItem('user', JSON.stringify(u));
                }
            } else {
                hyveError('Submission Failed', submitRes?.message || 'Unable to submit verification application. Please try again.');
            }
        } catch (err) {
            console.error('Verification upload failed:', err);
            hyveError('Submission Error', err.message || 'An error occurred while uploading verification documents.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // The 4 strictly required documents
    const docItems = [
        {
            num: 1,
            key: 'idDoc',
            title: 'Normal ID Verification',
            desc: 'Valid government-issued ID (National ID card / NIN slip, International Passport, Driver’s License, or Voter’s Card).',
            badge: 'Required',
        },
        {
            num: 2,
            key: 'ownershipProof',
            title: 'Photo / Property Proof of Ownership or Caretaker Authorisation',
            desc: 'Photo or document proof of ownership or caretaker authorization (Deed of assignment, Tenancy agreement, Caretaker authorization, or Landlord letter).',
            badge: 'Required',
        },
        {
            num: 3,
            key: 'addressProof',
            title: 'Property Address Proof Doc',
            desc: 'Official document proving the property address (Utility bill: PHCN/NEPA electricity, LAWMA/waste, Water bill, or Local Government receipt).',
            badge: 'Required',
        },
        {
            num: 4,
            key: 'agreement',
            title: 'Hyve Landlord Agreement (Signed)',
            desc: 'Signed Hyve landlord platform agreement. Download our standard agreement, sign, and upload the signed document.',
            badge: 'Required',
            hasTemplateDownload: true,
        },
    ];

    return (
        <div className='page-wrapper'>
            <div className='flex'>
                {/* Dashboard sidebar */}
                <Sidebar currentPage={'profile'} />

                {/* Dashboard content area */}
                <main className='w-full h-[100svh] sm:w-[70%] lg:w-[80%] overflow-y-auto overflow-x-hidden bg-[#FAF7F5] pb-28 sm:pb-16'>
                    <Header />

                    <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10'>
                        {/* Header back button */}
                        <div className='flex items-center gap-3 mb-6'>
                            <button
                                onClick={() => navigate('/landlord/profile')}
                                className='p-2 rounded-xl bg-white border border-stone-200 text-stone-600 hover:text-primary hover:border-primary/40 smooth-transition shadow-sm cursor-pointer'
                                title='Back to Profile'
                            >
                                <IoArrowBackOutline className='text-lg' />
                            </button>
                            <div>
                                <h1 className='text-xl sm:text-2xl font-bold font-poppins text-stone-900'>
                                    Landlord Verification
                                </h1>
                                <p className='text-xs sm:text-sm text-stone-500'>
                                    Upload the 4 required verification documents to confirm your identity and earn the Verified Host badge
                                </p>
                            </div>
                        </div>

                        {/* Rejection Alert Banner if status is rejected */}
                        {verificationStatus === 'rejected' && (
                            <div className='mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3'>
                                <FiXCircle className='text-rose-600 text-xl shrink-0 mt-0.5' />
                                <div className='text-xs text-rose-800'>
                                    <p className='font-bold text-sm'>Verification Application Rejected</p>
                                    <p className='mt-1'>{rejectionReason || 'Your previous document submission did not meet the compliance standards. Please re-upload clear and valid verification documents.'}</p>
                                </div>
                            </div>
                        )}

                        {/* Success Verified Banner */}
                        {verificationStatus === 'verified' && (
                            <div className='mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3'>
                                <FiCheckCircle className='text-emerald-600 text-xl shrink-0 mt-0.5' />
                                <div className='text-xs text-emerald-800'>
                                    <p className='font-bold text-sm'>Account Verified & Approved</p>
                                    <p className='mt-1'>You are a verified Hyve Haven host. The Verified trust badge is prominently displayed on all your property listings for students.</p>
                                </div>
                            </div>
                        )}

                        {/* Review Pipeline & Requirements Overview Banner */}
                        <div className='mb-6 bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.03)]'>
                            <div className='flex flex-col md:flex-row md:items-center justify-between gap-6'>
                                <div className='max-w-md'>
                                    <span className='text-xs font-semibold text-primary uppercase tracking-wider mb-2 flex items-center gap-1'>
                                        <HiOutlineSparkles /> Verified Host Program
                                    </span>
                                    <h3 className='text-base sm:text-lg font-bold text-stone-900'>
                                        Strict 4-Document Verification
                                    </h3>
                                    <p className='text-xs text-stone-500 mt-1.5 leading-relaxed'>
                                        To maintain safety and trust on Hyve, landlords and caretakers must provide only the 4 documents listed below. Once submitted, our compliance desk audits them within 24 business hours.
                                    </p>
                                </div>

                                {/* Stepper tracker */}
                                <div className='flex items-center gap-3 sm:gap-6 bg-stone-50/70 p-4 rounded-2xl border border-stone-100'>
                                    <div className='flex flex-col items-center text-center'>
                                        <div
                                            className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg mb-1.5 ${
                                                verificationStatus === 'pending'
                                                    ? 'bg-amber-100 text-amber-700 font-bold ring-4 ring-amber-50'
                                                    : 'bg-stone-200/80 text-stone-500'
                                            }`}
                                        >
                                            <GoClock />
                                        </div>
                                        <p className='text-[11px] font-semibold text-stone-800'>In Review</p>
                                        <p className='text-[9px] text-stone-400'>Submission</p>
                                    </div>

                                    <div className='w-6 h-0.5 bg-stone-200'></div>

                                    <div className='flex flex-col items-center text-center'>
                                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg mb-1.5 ${
                                            verificationStatus === 'pending' ? 'bg-orange-100 text-primary font-bold' : 'bg-stone-200/80 text-stone-500'
                                        }`}>
                                            <HiOutlineShieldCheck />
                                        </div>
                                        <p className='text-[11px] font-semibold text-stone-800'>Legal Audit</p>
                                        <p className='text-[9px] text-stone-400'>Doc check</p>
                                    </div>

                                    <div className='w-6 h-0.5 bg-stone-200'></div>

                                    <div className='flex flex-col items-center text-center'>
                                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg mb-1.5 ${
                                            verificationStatus === 'verified'
                                                ? 'bg-emerald-100 text-emerald-700 font-bold ring-4 ring-emerald-50'
                                                : 'bg-stone-200/80 text-stone-500'
                                        }`}>
                                            <FiCheckCircle />
                                        </div>
                                        <p className='text-[11px] font-semibold text-stone-800'>Approved</p>
                                        <p className='text-[9px] text-emerald-600 font-medium'>
                                            {verificationStatus === 'verified' ? 'Badge Active' : 'Verified Host'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Document Uploads Form */}
                        <form onSubmit={handleSubmit} className='space-y-6 mb-12'>
                            <div className='bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.03)]'>
                                <div className='flex items-center justify-between gap-4 mb-6 pb-4 border-b border-stone-100'>
                                    <div className='flex items-center gap-3'>
                                        <div className='w-10 h-10 rounded-xl bg-orange-100 text-primary flex items-center justify-center text-xl'>
                                            <HiOutlineDocumentText />
                                        </div>
                                        <div>
                                            <h2 className='text-base sm:text-lg font-bold text-stone-900'>
                                                Required Verification Documents
                                            </h2>
                                            <p className='text-xs text-stone-500'>
                                                Please upload clear PDF scans or photo copies for all 4 verification items
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type='button'
                                        onClick={() => setShowAgreementModal(true)}
                                        className='hidden sm:flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-hover bg-orange-50 hover:bg-orange-100/70 px-3.5 py-2 rounded-xl border border-orange-200/60 transition-colors cursor-pointer'
                                    >
                                        <FiDownload className='text-sm' />
                                        <span>Download Hyve Agreement</span>
                                    </button>
                                </div>

                                <div className='divide-y divide-stone-100'>
                                    {docItems.map(({ num, key, title, desc, hasTemplateDownload }) => {
                                        const doc = documents[key];
                                        return (
                                            <div key={key} className='py-5 first:pt-2 last:pb-2 flex flex-col md:flex-row md:items-center justify-between gap-4'>
                                                <div className='flex items-start gap-3.5 flex-1'>
                                                    <div className='w-7 h-7 rounded-lg bg-orange-50 text-primary font-bold text-xs flex items-center justify-center shrink-0 border border-orange-100 mt-0.5'>
                                                        {num}
                                                    </div>
                                                    <div>
                                                        <div className='flex items-center gap-2 flex-wrap'>
                                                            <h4 className='text-sm font-bold text-stone-900'>
                                                                {title}
                                                            </h4>
                                                            <span className='text-[10px] font-semibold text-primary bg-orange-50 border border-orange-200/70 px-2 py-0.5 rounded-full'>
                                                                Required
                                                            </span>
                                                        </div>
                                                        <p className='text-xs text-stone-500 mt-1 max-w-xl leading-relaxed'>
                                                            {desc}
                                                        </p>

                                                        {hasTemplateDownload && (
                                                            <button
                                                                type='button'
                                                                onClick={() => setShowAgreementModal(true)}
                                                                className='sm:hidden mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline'
                                                            >
                                                                <FiDownload /> Download Agreement Template
                                                            </button>
                                                        )}

                                                        {doc && (
                                                            <div className='flex items-center gap-2 mt-2'>
                                                                <span className='inline-block text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200 font-medium'>
                                                                    &bull; {doc.name} ({doc.size})
                                                                </span>
                                                                {doc.url && !doc.url.startsWith('blob:') && (
                                                                    <a
                                                                        href={doc.url}
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                        className="text-xs text-primary hover:underline flex items-center gap-0.5 font-medium"
                                                                    >
                                                                        <span>Preview</span>
                                                                        <FiExternalLink className="text-[10px]" />
                                                                    </a>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className='shrink-0 self-end md:self-center'>
                                                    <input
                                                        type='file'
                                                        accept='image/*,application/pdf'
                                                        ref={docRefs[key]}
                                                        onChange={handleDocChange(key)}
                                                        className='hidden'
                                                    />

                                                    {doc ? (
                                                        <div className='flex items-center gap-2'>
                                                            <span className='inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-100/70 px-3 py-1.5 rounded-xl'>
                                                                <FiCheckCircle /> Selected
                                                            </span>
                                                            <button
                                                                type='button'
                                                                onClick={() => handleDocClick(key)}
                                                                className='text-xs text-stone-500 hover:text-stone-800 underline cursor-pointer'
                                                            >
                                                                Replace
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            type='button'
                                                            onClick={() => handleDocClick(key)}
                                                            className='px-4 py-2 rounded-xl border border-dashed border-stone-300 hover:border-primary bg-stone-50 hover:bg-orange-50/50 text-stone-700 hover:text-primary text-xs font-semibold smooth-transition flex items-center gap-1.5 cursor-pointer shadow-xs'
                                                        >
                                                            <FiUploadCloud className='text-base' />
                                                            <span>Upload File</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className='flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 mt-6 border-t border-stone-100'>
                                    <div className='flex items-center gap-2 text-xs text-stone-500'>
                                        <HiOutlineShieldCheck className='text-primary text-base shrink-0' />
                                        <span>All documents are securely encrypted and reviewed solely for host verification.</span>
                                    </div>

                                    <button
                                        type='submit'
                                        disabled={isSubmitting}
                                        className='w-full sm:w-auto px-8 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-semibold shadow-md hover:shadow-lg disabled:opacity-60 smooth-transition flex items-center justify-center gap-2 cursor-pointer'
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                                                <span>Submitting Verification...</span>
                                            </>
                                        ) : (
                                            <span>{verificationStatus === 'verified' ? 'Update & Resubmit Verification' : 'Submit 4 Documents for Verification'}</span>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </main>
            </div>

            {/* Modal: Official Hyve Landlord Agreement Template */}
            <LandlordAgreementModal
                isOpen={showAgreementModal}
                onClose={() => setShowAgreementModal(false)}
                showAcceptButton={false}
                hasAccepted={Boolean(documents.agreement)}
            />


            {/* Mobile navigation */}
            <MobileNavigationTab currentTab={'profile'} />
        </div>
    );
};

export default AccountVerification;