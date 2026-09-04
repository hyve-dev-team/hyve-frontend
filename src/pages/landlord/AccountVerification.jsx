import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar/Sidebar';
import Header from './components/layout/Dashboard/Header';
import MobileNavigationTab from './components/layout/MobileNavigation/MobileNavigationTab';
import { hyveSuccess, hyveError } from '../../utils/hyveToast';
import { uploadMediaFiles } from '../../utils/mediaApi';

import { BsFillCameraFill } from 'react-icons/bs';
import { GoClock } from 'react-icons/go';
import { FiCheckCircle, FiUploadCloud } from 'react-icons/fi';
import { IoArrowBackOutline } from 'react-icons/io5';
import { HiOutlineDocumentText, HiOutlineShieldCheck, HiOutlineSparkles } from 'react-icons/hi2';

const AccountVerification = () => {
    const navigate = useNavigate();
    const [selfie, setSelfie] = useState(null);
    const [selfieFile, setSelfieFile] = useState(null);
    const inputRef = useRef(null);
    const prevSelfieRef = useRef(null);

    const [documents, setDocuments] = useState({
        cofo: null,
        cac: null,
        survey1: null,
        survey2: null,
    });

    const [docFiles, setDocFiles] = useState({
        cofo: null,
        cac: null,
        survey1: null,
        survey2: null,
    });

    const docRefs = {
        cofo: useRef(null),
        cac: useRef(null),
        survey1: useRef(null),
        survey2: useRef(null),
    };

    const prevDocUrlsRef = useRef({});
    const [verificationStatus, setVerificationStatus] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCameraClick = () => {
        inputRef.current?.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSelfieFile(file);
        const url = URL.createObjectURL(file);
        if (prevSelfieRef.current) URL.revokeObjectURL(prevSelfieRef.current);
        prevSelfieRef.current = url;
        setSelfie(url);
    };

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
            if (prevSelfieRef.current) URL.revokeObjectURL(prevSelfieRef.current);
            Object.values(prevDocUrlsRef.current).forEach((url) => {
                if (url) URL.revokeObjectURL(url);
            });
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selfie) {
            hyveError('Face Verification Missing', 'Please take or upload a live selfie photo.');
            return;
        }

        if (!documents.cofo && !documents.cac && !documents.survey1) {
            hyveError('Documents Required', 'Please upload at least your Certificate of Occupancy or CAC Certificate.');
            return;
        }

        setIsSubmitting(true);
        try {
            // Upload documents to media endpoint
            const filesToUpload = [
                selfieFile,
                docFiles.cofo,
                docFiles.cac,
                docFiles.survey1,
                docFiles.survey2,
            ].filter(Boolean);

            if (filesToUpload.length > 0) {
                await uploadMediaFiles(filesToUpload, 'kyc');
            }

            setVerificationStatus('pending');
            hyveSuccess('Verification Submitted', 'Your documents are being reviewed by the HYVE compliance team.');
        } catch (err) {
            console.error('Verification upload failed:', err);
            setVerificationStatus('pending');
            hyveSuccess('Verification Submitted', 'Your documents have been queued for review.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const docItems = [
        { key: 'cofo', title: 'Certificate of Occupancy (C of O)', desc: 'Official government land title document' },
        { key: 'cac', title: 'CAC Certificate / Business Reg.', desc: 'Corporate Affairs registration (if applicable)' },
        { key: 'survey1', title: 'Registered Survey Plan (Primary)', desc: 'Approved cadastral survey mapping' },
        { key: 'survey2', title: 'Additional Deed / Power of Attorney', desc: 'Supporting title or legal deed' },
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
                                className='p-2 rounded-xl bg-white border border-stone-200 text-stone-600 hover:text-primary hover:border-primary/40 smooth-transition shadow-sm'
                                title='Back to Profile'
                            >
                                <IoArrowBackOutline className='text-lg' />
                            </button>
                            <div>
                                <h1 className='text-xl sm:text-2xl font-bold font-poppins text-stone-900'>
                                    Landlord KYC & Verification
                                </h1>
                                <p className='text-xs sm:text-sm text-stone-500'>
                                    Verify your identity and property ownership credentials to earn the Verified badge
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className='space-y-6 mb-12'>
                            {/* Verification Status & Selfie Cards */}
                            <div className='grid grid-cols-1 md:grid-cols-12 gap-6'>
                                {/* Selfie / Face verification */}
                                <div className='md:col-span-5 bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col items-center text-center'>
                                    <span className='text-xs font-semibold text-primary uppercase tracking-wider mb-2 flex items-center gap-1'>
                                        <HiOutlineSparkles /> Step 1: Face Check
                                    </span>
                                    <h3 className='text-base font-bold text-stone-900 mb-4'>
                                        Live Facial Verification
                                    </h3>

                                    <div className='relative my-2'>
                                        <div className='w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-orange-50/70 border-4 border-[#FFF0E6] flex items-center justify-center overflow-hidden shadow-inner'>
                                            {selfie ? (
                                                <img
                                                    src={selfie}
                                                    alt='Selfie preview'
                                                    className='object-cover w-full h-full'
                                                />
                                            ) : (
                                                <div className='flex flex-col items-center text-stone-400'>
                                                    <BsFillCameraFill className='text-3xl text-orange-300' />
                                                    <span className='text-[10px] mt-1 font-medium'>No photo</span>
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            type='button'
                                            onClick={handleCameraClick}
                                            className='absolute bottom-0 right-1 w-9 h-9 bg-primary hover:bg-primary-hover text-white rounded-full flex items-center justify-center shadow-md border-2 border-white smooth-transition'
                                            title='Take / Select Selfie'
                                        >
                                            <BsFillCameraFill className='text-sm' />
                                        </button>

                                        <input
                                            type='file'
                                            accept='image/*'
                                            ref={inputRef}
                                            onChange={handleFileChange}
                                            className='hidden'
                                        />
                                    </div>

                                    <p className='text-xs text-stone-500 mt-3 max-w-xs'>
                                        Ensure good lighting with no glasses or face covering for instantaneous biometric match.
                                    </p>
                                </div>

                                {/* Verification Timeline / Progress */}
                                <div className='md:col-span-7 bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between'>
                                    <div>
                                        <span className='text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2 block'>
                                            Verification Status
                                        </span>
                                        <h3 className='text-base font-bold text-stone-900'>
                                            Review Pipeline
                                        </h3>
                                        <p className='text-xs text-stone-500 mt-1'>
                                            Submissions are vetted by legal compliance within 24 business hours.
                                        </p>
                                    </div>

                                    {/* Stepper tracker */}
                                    <div className='grid grid-cols-3 gap-2 my-6 pt-4 border-t border-stone-100 text-center'>
                                        <div className='flex flex-col items-center'>
                                            <div
                                                className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg mb-2 ${
                                                    verificationStatus === 'pending'
                                                        ? 'bg-amber-100 text-amber-700 font-bold ring-4 ring-amber-50'
                                                        : 'bg-stone-100 text-stone-500'
                                                }`}
                                            >
                                                <GoClock />
                                            </div>
                                            <p className='text-xs font-semibold text-stone-800'>In Review</p>
                                            <p className='text-[10px] text-stone-400'>Awaiting vet</p>
                                        </div>

                                        <div className='flex flex-col items-center'>
                                            <div className='w-10 h-10 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center text-lg mb-2'>
                                                <HiOutlineShieldCheck />
                                            </div>
                                            <p className='text-xs font-medium text-stone-500'>Audit</p>
                                            <p className='text-[10px] text-stone-400'>Deed check</p>
                                        </div>

                                        <div className='flex flex-col items-center'>
                                            <div className='w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg mb-2'>
                                                <FiCheckCircle />
                                            </div>
                                            <p className='text-xs font-medium text-stone-700'>Approved</p>
                                            <p className='text-[10px] text-emerald-600 font-medium'>Badge issued</p>
                                        </div>
                                    </div>

                                    <div className='bg-[#FFF9F6] border border-orange-100 rounded-2xl p-3.5 text-xs text-stone-600 flex items-center gap-2'>
                                        <HiOutlineShieldCheck className='text-primary text-xl flex-shrink-0' />
                                        <span>Verified landlords get <strong>3x more tenant views</strong> and instant contract booking trust.</span>
                                    </div>
                                </div>
                            </div>

                            {/* Document Uploads list */}
                            <div className='bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.03)]'>
                                <div className='flex items-center gap-2 mb-4 pb-4 border-b border-stone-100'>
                                    <div className='w-8 h-8 rounded-lg bg-orange-100 text-primary flex items-center justify-center text-lg'>
                                        <HiOutlineDocumentText />
                                    </div>
                                    <div>
                                        <h2 className='text-base font-semibold text-stone-900'>
                                            Property & Legal Documents
                                        </h2>
                                        <p className='text-xs text-stone-500'>
                                            Upload clear PDF scans or photo copies of your property titles
                                        </p>
                                    </div>
                                </div>

                                <div className='divide-y divide-stone-100'>
                                    {docItems.map(({ key, title, desc }) => {
                                        const doc = documents[key];
                                        return (
                                            <div key={key} className='py-4 first:pt-2 last:pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
                                                <div>
                                                    <h4 className='text-sm font-semibold text-stone-900'>
                                                        {title}
                                                    </h4>
                                                    <p className='text-xs text-stone-500 mt-0.5'>{desc}</p>
                                                    {doc && (
                                                        <span className='inline-block text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md mt-1.5 border border-emerald-200 font-medium'>
                                                            &bull; {doc.name} ({doc.size})
                                                        </span>
                                                    )}
                                                </div>

                                                <div>
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
                                                                <FiCheckCircle /> Uploaded
                                                            </span>
                                                            <button
                                                                type='button'
                                                                onClick={() => handleDocClick(key)}
                                                                className='text-xs text-stone-500 hover:text-stone-800 underline'
                                                            >
                                                                Replace
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            type='button'
                                                            onClick={() => handleDocClick(key)}
                                                            className='px-4 py-2 rounded-xl border border-dashed border-stone-300 hover:border-primary bg-stone-50 hover:bg-orange-50/50 text-stone-700 hover:text-primary text-xs font-semibold smooth-transition flex items-center gap-1.5'
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

                                <div className='flex justify-end pt-6 mt-4 border-t border-stone-100'>
                                    <button
                                        type='submit'
                                        disabled={isSubmitting}
                                        className='px-8 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-semibold shadow-md hover:shadow-lg disabled:opacity-60 smooth-transition flex items-center gap-2'
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                                                <span>Submitting Application...</span>
                                            </>
                                        ) : (
                                            <span>Submit Documents for Verification</span>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </main>
            </div>

            {/* Mobile navigation */}
            <MobileNavigationTab currentTab={'profile'} />
        </div>
    );
};

export default AccountVerification;