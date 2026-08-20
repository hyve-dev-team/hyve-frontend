import Sidebar from './components/layout/Sidebar/Sidebar'
import Header from './components/layout/Dashboard/Header'
import MobileNavigationTab from './components/layout/MobileNavigation/MobileNavigationTab'
import { useState } from 'react'
import { Link } from 'react-router-dom'

const Reservation = () => {
    const [isPaymentSuccessful, setIsPaymentSuccessful] = useState(false);

    const handlePayment = (e) => {
        e.preventDefault()

        setIsPaymentSuccessful(true)
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
                        </div>

                        <form onSubmit={handlePayment} method='POST'>
                            <div className='flex flex-col gap-6 lg:mt-4 lg:flex-row'>
                                <div className='w-full'>
                                    <div className='bg-[#F4F4F4] rounded-[14px] py-6 lg:py-10 px-4 lg:px-16'>
                                        <h4 className='font-medium text-sm lg:text-[18px] text-center font-poppins '>
                                            Terms and Condition
                                        </h4>

                                        <p className='text-[#2D2D2D] mt-4 text-sm font-light leading-loose text-justify'>HYVE is the modern housing platform that makes finding, renting, and managing properties safer, smarter, andstress-free. By combining technology, verified data, and a strong sense of community, the platform eliminates scams, reduces agent fees, and makes housing more accessible. Whether for students seeking affordable campus accommodation, young professionals looking for verified house listings.</p>

                                        <div className='flex items-center gap-2 mt-8'>
                                            <input type="checkbox" name="" id="terms" className='w-4 h-4' required />
                                            <label htmlFor="terms" className='font-light text-[#2D2D2D] text-sm lg:text-[16px]'>I agree to Hyve terms and conditions</label>
                                        </div>
                                    </div>
                                </div>


                                <div className='w-full'>
                                    <div className='bg-[#F4F4F4] rounded-[14px] py-6 lg:py-10 px-4 lg:px-16'>
                                        <h4 className='font-medium text-center font-poppins text-sm lg:text-[18px]'>
                                            Policies
                                        </h4>

                                        <p className='text-[#2D2D2D] mt-4 text-sm font-light leading-loose text-justify'>HYVE is the modern housing platform that makes finding, renting, and managing properties safer, smarter, andstress-free. By combining technology, verified data, and a strong sense of community, the platform eliminates scams, reduces agent fees, and makes housing more accessible. Whether for students seeking affordable campus accommodation, young professionals looking for verified house listings.</p>


                                        <div className='flex items-center gap-2 mt-8'>
                                            <input type="checkbox" name="" id="policy" className='w-4 h-4' required />
                                            <label htmlFor="policy" className='font-light text-[#2D2D2D] text-sm lg:text-[16px]'>I agree to Hyve terms and conditions</label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className='flex justify-center mt-4'>
                                <button type='submit' className='w-full lg:w-[40%] mt-6 lg:mt-6 text-center text-white bg-primary rounded-[14px] py-3 lg:py-4 cursor-pointer lg:hover:bg-primary-hover smooth-transition'>Proceed to make Booking Payment</button>
                            </div>

                        </form>
                    </div>
                </main>
            </div>

            {/* Mobile navigation */}
            <MobileNavigationTab />

            {/* Payment confirmation Modal */}
            <div className={`fixed top-0 bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm offset ${isPaymentSuccessful ? 'block' : 'hidden'}`}>
                <div className='centralizeContent'>
                    <div className='bg-white w-[90%] sm:w-[60%] lg:w-[35%] desktop-lg:w-[30%] py-10 px-4 lg:py-14 lg:px-10 rounded-[30px] lg:rounded-[40px] flex items-center flex-col shadow-md'>

                        <div className='text-center'>
                            <h3 className='font-bold leading-none uppercase font-poppins text-base lg:text-[30px]'>Payment <br /> Received</h3>
                            <p className='px-4 mt-6 text-xs font-light md:text-sm'>Schedule Tour to Inspect the Apartment</p>
                        </div>

                        <Link to={`/user/apartment/schedule-tour/${1}`} className="relative w-[90%] lg:w-[80%] py-3 lg:py-4 mt-8 text-center text-white rounded-full  bg-primary hover:bg-primary-hover smooth-transition">
                            <button className='text-sm '>Schedule Tour</button>
                        </Link>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default Reservation