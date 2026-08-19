import React, { useState, useRef, useEffect } from 'react'
import Sidebar from './components/layout/Sidebar/Sidebar'
import Header from './components/layout/Dashboard/Header'
import MobileNavigationTab from './components/layout/MobileNavigation/MobileNavigationTab'

import { CiUser } from "react-icons/ci";
import { BsFillCameraFill } from "react-icons/bs";
import { GoClock } from "react-icons/go";
import { IoIosInformationCircleOutline } from "react-icons/io";
import { FiCheckCircle } from "react-icons/fi";
import { BsPlus } from "react-icons/bs";
import { IoIosCheckmarkCircleOutline } from "react-icons/io";

const AccountVerification = () => {
    const [selfie, setSelfie] = useState(null)
    const inputRef = useRef(null)
    const prevSelfieRef = useRef(null)
    /* state to handle documnet uploads */
    const [documents, setDocuments] = useState({
        cofo: null,
        cac: null,
        survey1: null,
        survey2: null,
    })

    /* refs to manage document uploads */
    const docRefs = {
        cofo: useRef(null),
        cac: useRef(null),
        survey1: useRef(null),
        survey2: useRef(null),
    }

    const prevDocUrlsRef = useRef({})
    /* State to handle verification starus */
    const [verificationStatus, setVerificationStatus] = useState(null)
    const [errors, setErrors] = useState({ missing: [] })

    const handleCameraClick = () => {
        inputRef.current?.click()
    }

    const handleFileChange = (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        const url = URL.createObjectURL(file)
        // revoke previous object URL to avoid memory leak
        if (prevSelfieRef.current) URL.revokeObjectURL(prevSelfieRef.current)
        prevSelfieRef.current = url
        setSelfie(url)
    }

    const handleDocClick = (key) => {
        docRefs[key].current?.click()
    }

    /* Handler for document uploads */
    const handleDocChange = (key) => (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        const url = URL.createObjectURL(file)
        if (prevDocUrlsRef.current[key]) URL.revokeObjectURL(prevDocUrlsRef.current[key])
        prevDocUrlsRef.current[key] = url
        setDocuments(prev => ({ ...prev, [key]: url }))
    }

    useEffect(() => {
        return () => {
            if (prevSelfieRef.current) {
                URL.revokeObjectURL(prevSelfieRef.current)
            }
            // revoke docs
            Object.values(prevDocUrlsRef.current).forEach(url => {
                if (url) URL.revokeObjectURL(url)
            })
        }
    }, [])

    // when user try to submit, check if all files are uploaded
    const handleSubmit = (e) => {
        e.preventDefault()
        const missing = []
        if (!selfie) missing.push('Selfie')
        Object.entries(documents).forEach(([key, val]) => {
            if (!val) {
                // map keys to friendly names
                if (key === 'cofo') missing.push('C of O')
                else if (key === 'cac') missing.push('CAC certificate')
                else missing.push('Survey Plan')
            }
        })

        if (missing.length > 0) {
            setErrors({ missing })
            setVerificationStatus(null)
            return
        }

        // all good
        setErrors({ missing: [] })
        setVerificationStatus('pending')
        console.log({ selfie, documents, verificationStatus: 'pending' })
    }

    // clear errors automatically when user finishes all uploads
    useEffect(() => {
        const allDocsUploaded = Object.values(documents).every(Boolean)
        if (allDocsUploaded && selfie) {
            if (errors.missing.length) setErrors({ missing: [] })
        }
    }, [documents, selfie])

    return (
        <div className='page-wrapper'>
            <div className='flex'>
                {/* dashboard sidebar*/}
                <Sidebar />

                {/* dashboard content area */}
                <main className='w-full h-[100svh] sm:w-[70%] lg:w-[80%] overflow-auto bg-slate-50'>
                    {/* dashboard header */}
                    <Header />

                    <form onSubmit={handleSubmit}>
                        <div className='px-3 mt-8 pb-28 sm:pb-16 sm:px-6 lg:px-8 lg:mt-8'>
                            <div className='flex flex-col gap-6 md:flex-row'>

                                <div className='bg-white rounded-2xl w-full md:w-[40%] flex justify-center items-center flex-col p-10 gap-6 shadow-sm'>

                                    <span className='text-sm text-[#606060]'>Face  Verification</span>

                                    <div className='relative'>
                                        <div className='w-[100px] h-[100px] md:w-[130px] md:h-[130px] rounded-full bg-[#FFF2EA] flex relative justify-center items-center overflow-hidden'>

                                            {selfie ? (
                                                <img src={selfie} alt="Selfie preview" className='object-cover w-full h-full rounded-full' />
                                            ) : (
                                                <CiUser className='text-[40px] md:text-[80px] text-[#6060605d]' />
                                            )}

                                            <input
                                                type='file'
                                                accept='image/*'
                                                ref={inputRef}
                                                onChange={handleFileChange}
                                                className='hidden'
                                                aria-hidden='true'
                                            />
                                        </div>
                                        <div
                                            role='button'
                                            tabIndex={0}
                                            onClick={handleCameraClick}
                                            className='absolute bottom-0 flex items-center justify-center w-6 h-6 text-white rounded-full shadow-sm cursor-pointer right-2 md:w-8 md:h-8 bg-primary'
                                            aria-label='Upload selfie'
                                        >
                                            <BsFillCameraFill />
                                        </div>
                                    </div>
                                </div>

                                <div className='bg-white rounded-2xl w-full md:w-[60%] shadow-sm px-4 py-6 lg:p-10 flex items-center justify-center'>
                                    <div className='flex flex-col gap-16'>
                                        <div className='relative'>
                                            <div className='absolute w-full border-b-2 border-dashed top-3 '></div>

                                            {/* Verification status */}
                                            <div className='flex justify-between z-[10] relative'>
                                                <div className='flex flex-col items-center gap-2'>
                                                    <span className='px-4 bg-white md:px-8'>
                                                        <GoClock className={`text-2xl ${verificationStatus === 'pending' ? 'text-primary' : ''}`} />
                                                    </span>
                                                    <span className={`text-xs lg:text-sm ${verificationStatus === 'pending' ? 'text-primary' : ''}`}>Pending</span>
                                                </div>
                                                
                                                <div className='flex flex-col items-center gap-2'>
                                                    <span className='px-4 bg-white lg:px-8'>
                                                        <IoIosInformationCircleOutline className='text-2xl' />
                                                    </span>
                                                    <span className='text-xs lg:text-sm'>Needing more Info</span>
                                                </div>
                                                
                                                <div className='flex flex-col items-center gap-2'>
                                                    <span className='px-4 bg-white lg:px-8'>
                                                        <FiCheckCircle className='text-2xl' />
                                                    </span>
                                                    <span className='text-xs lg:text-sm'>Approved</span>
                                                </div>
                                            </div>

                                        </div>

                                        <div className='text-center w-full mx-auto md:w-[60%]'>
                                            <p className='text-[#555555] text-sm'>Your application has been received, and is undergoing verification</p>
                                        </div>
                                    </div>
                                </div>

                            </div>


                            {/* Document uploads */}

                            <div className='w-full px-4 py-2 mt-8 bg-white shadow-sm lg:px-10 rounded-2xl'>
                                <div className='divide-y divide-[#0000000D]'>
                                    <div className='flex items-center justify-between py-6'>
                                        <p className='text-sm font-medium lg:text-base'>C of O</p>

                                        <span className='cursor-pointer'>
                                            {/* cofo already uploaded? show check, else allow upload */}
                                            {documents.cofo ? (
                                                <IoIosCheckmarkCircleOutline size={28} className="text-primary" />
                                            ) : (
                                                <>
                                                    <input
                                                        type='file'
                                                        accept='image/*,application/pdf'
                                                        ref={docRefs.cofo}
                                                        onChange={handleDocChange('cofo')}
                                                        className='hidden'
                                                    />
                                                    <button type='button' onClick={() => handleDocClick('cofo')} aria-label='Upload C of O'>
                                                        <BsPlus size={23} />
                                                    </button>
                                                </>
                                            )}
                                        </span>
                                    </div>

                                    <div className='flex items-center justify-between py-6'>
                                        <p className='text-sm font-medium lg:text-base'>CAC certificate</p>

                                        <span className='cursor-pointer'>
                                            {documents.cac ? (
                                                <IoIosCheckmarkCircleOutline size={28} className="text-primary" />
                                            ) : (
                                                <>
                                                    <input
                                                        type='file'
                                                        accept='image/*,application/pdf'
                                                        ref={docRefs.cac}
                                                        onChange={handleDocChange('cac')}
                                                        className='hidden'
                                                    />
                                                    <button type='button' onClick={() => handleDocClick('cac')} aria-label='Upload CAC'>
                                                        <BsPlus size={23} />
                                                    </button>
                                                </>
                                            )}
                                        </span>
                                    </div>

                                    <div className='flex items-center justify-between py-6'>
                                        <p className='text-sm font-medium lg:text-base'>Survey Plan</p>

                                        <span className='cursor-pointer'>
                                            {documents.survey1 ? (
                                                <IoIosCheckmarkCircleOutline size={28} className="text-primary" />
                                            ) : (
                                                <>
                                                    <input
                                                        type='file'
                                                        accept='image/*,application/pdf'
                                                        ref={docRefs.survey1}
                                                        onChange={handleDocChange('survey1')}
                                                        className='hidden'
                                                    />
                                                    <button type='button' onClick={() => handleDocClick('survey1')} aria-label='Upload Survey Plan'>
                                                        <BsPlus size={23} />
                                                    </button>
                                                </>
                                            )}
                                        </span>
                                    </div>

                                    <div className='flex items-center justify-between py-6'>
                                        <p className='text-sm font-medium lg:text-base'>Survey Plan</p>

                                        <span className='cursor-pointer'>
                                            {documents.survey2 ? (
                                                <IoIosCheckmarkCircleOutline size={28} className="text-primary" />
                                            ) : (
                                                <>
                                                    <input
                                                        type='file'
                                                        accept='image/*,application/pdf'
                                                        ref={docRefs.survey2}
                                                        onChange={handleDocChange('survey2')}
                                                        className='hidden'
                                                    />
                                                    <button type='button' onClick={() => handleDocClick('survey2')} aria-label='Upload Survey Plan'>
                                                        <BsPlus size={23} />
                                                    </button>
                                                </>
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Error / Success message */}
                            {errors.missing.length > 0 ? (
                                // If any document is missing, show the generic documents error
                                errors.missing.some(item => ['C of O', 'CAC certificate', 'Survey Plan'].includes(item)) ? (
                                    <div className='px-4 py-3 mt-4 text-red-700 border border-red-200 rounded-md bg-red-50'>
                                        <p className='text-xs md:text-sm'>All Documents are required!</p>
                                    </div>
                                ) : (
                                    // fallback: selfie missing
                                    <div className='px-4 py-3 mt-4 text-red-700 border border-red-200 rounded-md bg-red-50'>
                                        <p className='text-xs md:text-sm'>Please upload your selfie.</p>
                                    </div>
                                )
                            ) : (
                                verificationStatus === 'pending' && (
                                    <div className='px-4 py-3 mt-4 text-green-700 border border-green-200 rounded-md bg-green-50'>
                                        <p className='text-xs md:text-sm'>Your documents have been uploaded and are undergoing verification.</p>
                                    </div>
                                )
                            )}

                            <div className='flex justify-end mt-6'>
                                <button type="submit" className='px-6 md:px-8 bg-primary hover:bg-primary-hover rounded-[8px] smooth-transition py-3 md:py-3 shadow-md'>
                                    <p className='text-sm font-medium text-white font-athiti'>
                                        Upload Documents
                                    </p>
                                </button>
                            </div>
                        </div>
                    </form>
                </main>
            </div>

            {/* Mobile navigation */}
            <MobileNavigationTab />
        </div>
    )
}

export default AccountVerification