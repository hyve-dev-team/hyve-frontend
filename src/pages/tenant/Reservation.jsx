
import Sidebar from './components/layout/Sidebar/Sidebar'
import Header from './components/layout/Dashboard/Header'
import MobileNavigationTab from './components/layout/MobileNavigation/MobileNavigationTab'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import defaultApartmentImage from '../../assets/images/apartments/apartment-image-2.png'
import useFetchApartment from '../../hooks/useFetchApartment'
import { setCurrentLodge } from '../../utils/currentLodge'
import { createLease } from '../../utils/leaseApi'
import { getPropertyQueueApi, commitAndPayRentApi } from '../../utils/queueApi'
import { BsShieldCheck } from 'react-icons/bs'
import { IoCheckmarkCircle, IoKeyOutline } from 'react-icons/io5'
import { hyveSuccess } from '../../utils/hyveToast'

const Reservation = () => {
    const { apartmentID } = useParams();
    const [isPaymentSuccessful, setIsPaymentSuccessful] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [hasAgreedTerms, setHasAgreedTerms] = useState(false);
    const [hasAgreedPolicy, setHasAgreedPolicy] = useState(false);

    const isReadyToPay = hasAgreedTerms && hasAgreedPolicy;

    const { apartment: lodge, isLoading: isApartmentLoading } = useFetchApartment(apartmentID);

    const handlePayment = (e) => {
        e.preventDefault();
        if (!isReadyToPay || isProcessing) return;

        setIsProcessing(true);

        setTimeout(async () => {
            // Calculate rent expiry (1 year from now)
            const rentExpiry = new Date();
            rentExpiry.setFullYear(rentExpiry.getFullYear() + 1);

            // Attempt to persist the lease to the backend database
            try {
                const lease = await createLease({
                    propertyId: Number(apartmentID),
                    durationMonths: 12,
                });
                if (lease?.property) {
                    setCurrentLodge({
                        apartmentId: Number(apartmentID),
                        name: lease.property.title || (lodge ? lodge.lodgeDesc : "Your Apartment"),
                        rentExpiryDate: lease.rentExpiryDate || rentExpiry.toISOString(),
                        leaseId: lease.id,
                    });
                } else {
                    setCurrentLodge({
                        apartmentId: Number(apartmentID),
                        name: lodge ? lodge.lodgeDesc : "Your Apartment",
                        rentExpiryDate: rentExpiry.toISOString(),
                    });
                }
            } catch (err) {
                console.warn("Notice: Could not persist lease to backend directly, saving locally:", err?.message);
                setCurrentLodge({
                    apartmentId: Number(apartmentID),
                    name: lodge ? lodge.lodgeDesc : "Your Apartment",
                    rentExpiryDate: rentExpiry.toISOString(),
                });
            }

            // If tenant joined the queue for this apartment, close/commit that queue via API
            try {
                const propertyQueue = await getPropertyQueueApi(apartmentID);
                if (propertyQueue?.id) {
                    await commitAndPayRentApi(propertyQueue.id);
                }
            } catch (queueErr) {
                console.warn("Queue commit notice:", queueErr?.message);
            }

            setIsProcessing(false);
            setIsPaymentSuccessful(true);
            hyveSuccess("Payment Received!", "Your rent has been safely placed in HYVE Escrow.");
        }, 800);
    }

    return (
        <div className='page-wrapper'>
            <div className='flex'>
                {/* dashboard sidebar*/}
                <Sidebar />

                {/* dashboard content area */}
                <main className='w-full h-[100svh] sm:w-[70%] lg:w-[80%] overflow-auto'>
                    {/* dashboard header */}
                    <Header />

                    <div className='px-3 mt-8 pb-28 sm:pb-16 sm:px-6 lg:px-8 lg:mt-8'>
                        <div className='mb-4'>
                            <p className='text-sm text-[#9B9B9B]'>Apartment Reservations</p>
                            <h2 className='text-xl sm:text-2xl font-bold font-montserrat text-gray-900 mt-1'>
                                Finalize Rent & Escrow Protection
                            </h2>
                        </div>

                        {/* Property summary banner */}
                        {lodge && (
                            <div className='bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm'>
                                <div className='flex items-center gap-4'>
                                    <img
                                        src={lodge.lodgeImage || lodge.image || (lodge.images && lodge.images[0]) || defaultApartmentImage}
                                        alt={lodge.lodgeDesc || "Apartment"}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = defaultApartmentImage;
                                        }}
                                        className='w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover shrink-0'
                                    />
                                    <div>
                                        <div className='flex items-center gap-2'>
                                            <span className='px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#1B784D]/10 text-[#1B784D] inline-flex items-center gap-1'>
                                                <BsShieldCheck size={12} /> HYVE Escrow Protected
                                            </span>
                                        </div>
                                        <h3 className='font-bold text-gray-900 text-base sm:text-lg mt-1'>{lodge.lodgeDesc}</h3>
                                        <p className='text-xs text-gray-500'>{lodge.nearbyDistance || lodge.location || lodge.lodgeLocation || "Lagos, Nigeria"}</p>
                                    </div>
                                </div>
                                <div className='sm:text-right w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0'>
                                    <p className='text-xs text-gray-400'>Annual Rent</p>
                                    <p className='text-xl sm:text-2xl font-bold text-primary font-montserrat'>
                                        ₦ {Number(lodge.lodgePrice || lodge.price || 0).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handlePayment} method='POST'>
                            <div className='flex flex-col gap-6 lg:mt-4 lg:flex-row'>
                                <div className='w-full'>
                                    <div className='bg-[#F4F4F4] rounded-[14px] py-6 lg:py-8 px-4 lg:px-10'>
                                        <h4 className='font-semibold text-sm lg:text-[18px] text-center font-poppins text-gray-900'>
                                            Escrow Terms & Key Handover
                                        </h4>

                                        <p className='text-[#2D2D2D] mt-4 text-xs sm:text-sm font-light leading-relaxed text-justify'>
                                            Your annual rent payment will be deposited into HYVE Escrow. Funds are never disbursed directly to the landlord or agent until you have conducted your physical key handover and verified that the apartment matches the agreed condition. If any discrepancy occurs, HYVE Escrow guarantees a prompt dispute review and resolution.
                                        </p>

                                        <div className='flex items-center gap-2.5 mt-6'>
                                            <input
                                                type="checkbox"
                                                id="terms"
                                                checked={hasAgreedTerms}
                                                onChange={(e) => setHasAgreedTerms(e.target.checked)}
                                                className='w-4 h-4 accent-primary cursor-pointer'
                                                required
                                            />
                                            <label htmlFor="terms" className='font-medium text-[#2D2D2D] text-xs sm:text-sm cursor-pointer'>
                                                I agree to HYVE Escrow protection terms and rental conditions
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className='w-full'>
                                    <div className='bg-[#F4F4F4] rounded-[14px] py-6 lg:py-8 px-4 lg:px-10'>
                                        <h4 className='font-semibold text-center font-poppins text-sm lg:text-[18px] text-gray-900'>
                                            Cancellation & Queue Policy
                                        </h4>

                                        <p className='text-[#2D2D2D] mt-4 text-xs sm:text-sm font-light leading-relaxed text-justify'>
                                            By completing this payment, your 24-hour exclusive queue lock concludes and the property is officially reserved under your account. Other waiting queue applicants will be notified that the apartment is taken. You will receive immediate access to the landlord's verified move-in checklist and key handover schedule.
                                        </p>

                                        <div className='flex items-center gap-2.5 mt-6'>
                                            <input
                                                type="checkbox"
                                                id="policy"
                                                checked={hasAgreedPolicy}
                                                onChange={(e) => setHasAgreedPolicy(e.target.checked)}
                                                className='w-4 h-4 accent-primary cursor-pointer'
                                                required
                                            />
                                            <label htmlFor="policy" className='font-medium text-[#2D2D2D] text-xs sm:text-sm cursor-pointer'>
                                                I agree to HYVE cancellation and fair queue reservation policy
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className='flex justify-center mt-6'>
                                <button
                                    type='submit'
                                    disabled={!isReadyToPay || isProcessing}
                                    className={`w-full lg:w-[45%] text-center font-semibold text-sm sm:text-base rounded-xl py-3.5 sm:py-4 transition-all flex items-center justify-center gap-2 ${
                                        isReadyToPay && !isProcessing
                                            ? 'text-white bg-primary hover:bg-primary-hover cursor-pointer shadow-lg shadow-primary/20'
                                            : 'text-white bg-primary/50 cursor-not-allowed shadow-none'
                                    }`}
                                >
                                    {isProcessing ? (
                                        <>
                                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            <span>Processing Escrow Payment...</span>
                                        </>
                                    ) : (
                                        "Proceed to Make Escrow Payment"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </main>
            </div>

            {/* Mobile navigation */}
            <MobileNavigationTab />

            {/* Payment confirmation Modal */}
            <div className={`fixed top-0 bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm ${isPaymentSuccessful ? 'flex' : 'hidden'} items-center justify-center p-4`}>
                <div className='bg-white w-full max-w-lg p-6 sm:p-8 rounded-3xl flex items-center flex-col shadow-2xl animate-in fade-in zoom-in duration-200'>
                    <div className='w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4'>
                        <IoCheckmarkCircle size={44} />
                    </div>

                    <div className='text-center'>
                        <span className='inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#1B784D]/10 text-[#1B784D] mb-2'>
                            <BsShieldCheck size={13} /> Escrow Protected
                        </span>
                        <h3 className='font-bold text-gray-900 font-montserrat text-xl sm:text-2xl mt-1'>
                            Payment Received & Apartment Secured!
                        </h3>
                        <p className='mt-3 text-xs sm:text-sm text-gray-600 leading-relaxed max-w-md'>
                            Congratulations! Your rent is safely deposited into HYVE Escrow. The listing queue has been closed and the apartment is yours. Next step is key collection and move-in!
                        </p>
                    </div>

                    <div className='w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 my-6 flex items-center gap-3 text-left'>
                        <div className='w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0'>
                            <IoKeyOutline size={22} />
                        </div>
                        <div>
                            <p className='text-xs font-bold text-gray-900'>Move-in & Key Pickup</p>
                            <p className='text-[11px] text-gray-500'>Your landlord has been notified. Funds remain in escrow until key confirmation.</p>
                        </div>
                    </div>

                    <div className='w-full flex flex-col sm:flex-row gap-3'>
                        <Link
                            to='/user/apartment/my-apartment'
                            className="flex-1 py-3 sm:py-3.5 text-center text-white rounded-xl bg-primary hover:bg-primary-hover font-semibold text-xs sm:text-sm shadow-md shadow-primary/20 transition-all"
                        >
                            View My Apartment
                        </Link>
                        <Link
                            to='/user/dashboard'
                            className="py-3 sm:py-3.5 px-6 text-center text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold text-xs sm:text-sm transition-all"
                        >
                            Go to Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Reservation
