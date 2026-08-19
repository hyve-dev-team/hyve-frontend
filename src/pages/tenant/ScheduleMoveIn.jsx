import React, { useState } from 'react'
import Sidebar from './components/layout/Sidebar/Sidebar'
import Header from './components/layout/Dashboard/Header'
import MobileNavigationTab from './components/layout/MobileNavigation/MobileNavigationTab'
import { Link } from 'react-router-dom'

const ScheduleMoveIn = () => {
    const [moveInDate, setMoveInDate] = useState('')
    const [moveInTime, setMoveInTime] = useState('')
    const [dateError, setDateError] = useState(false)
    const [timeError, setTimeError] = useState(false)
    const [errorMsg, setErrorMsg] = useState({ isErrorMsg: false, message: "" });
    const [isMoveInDate, setIsMoveInData] = useState(false);


    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0]

    /* Validate that time and date are not empty and they are not in teh past */
    const validateDateTime = (date, time) => {
        if (!date || !time) return

        const now = new Date()
        const selectedDateTime = new Date(`${date}T${time}`)

        if (selectedDateTime < now) {
            setTimeError(true)
        } else {
            setTimeError(false)
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        // Reset errors
        setDateError(false)
        setTimeError(false)
        setErrorMsg({ isErrorMsg: false, message: "" })

        // Validate inputs
        let hasError = false

        if (!moveInDate && !moveInTime) {
            setDateError(true)
            setTimeError(true)
            hasError = true
        }

        if (!moveInDate) {
            setDateError(true)
            hasError = true
        }

        if (!moveInTime) {
            setTimeError(true)
            hasError = true
        }

        // Validate date and time are not in the past
        if (moveInDate && moveInTime) {
            const now = new Date()
            const selectedDateTime = new Date(`${moveInDate}T${moveInTime}`)

            if (selectedDateTime < now) {
                setTimeError(true)
                hasError = true;
                setErrorMsg({ isErrorMsg: true, message: "Cannot schedule MOVE-IN  in the past" })
            }
        }

        /* if error, break */
        if (hasError) {
            return
        }


        // Log the data
        console.log({
            date: moveInDate,
            time: moveInTime,
        })

        setIsMoveInData(true)
    }

    return (
        <div className='page-wrapper'>
            <div className='flex'>
                {/* dashboard sidebar*/}
                <Sidebar />

                {/* dashboard content area */}
                <main className='w-full h-[100svh] sm:w-[70%] lg:w-[80%] overflow-auto'>
                    <div className='px-3 sm:px-6 lg:px-8 min-h-[calc(100svh-1rem)] flex flex-col justify-center md:min-h-0 sm:mt-16 sm:pb-16 lg:mt-10'>
                        <div className='flex justify-center'>
                            <div className='w-full md:w-[90%] lg:w-[80%] sm:bg-[#F4F4F4] px-2 py-8 sm:px-6 md:px-10 md:py-16 lg:py-16 lg:px-10'>
                                <div className='w-full lg:w-[60%] mx-auto'>

                                    <div className='text-center'>
                                        <h2 className='text-[18px] font-bold uppercase font-poppins md:text-[24px] lg:text-[32px] leading-tight'>Schedule move in date</h2>
                                    </div>

                                    <form onSubmit={handleSubmit} className='mt-4'>
                                        {errorMsg.isErrorMsg &&
                                            <p className='text-xs text-[#FF0000] text-center'>{errorMsg.message}</p>
                                        }

                                        <div className='mt-10'>
                                            <label htmlFor="move-in-date" className='flex justify-center mb-2 text-sm font-medium md:text-[16px]'>Enter Move In Date</label>
                                            <input
                                                type="date"
                                                id="move-in-date"
                                                value={moveInDate}
                                                min={today}
                                                onChange={(e) => {
                                                    setMoveInDate(e.target.value)
                                                    validateDateTime(e.target.value, moveInTime)
                                                }}
                                                className={`w-full px-4 py-3 text-sm text-center border rounded-full outline-none md:py-4 ${dateError ? 'border-[#FF0000]' : ''}`} />
                                        </div>

                                        <div className='mt-4'>
                                            <label htmlFor="move-in-time" className='flex justify-center mb-2 text-sm font-medium md:text-base'>Time</label>
                                            <input
                                                type="time"
                                                id="move-in-time"
                                                value={moveInTime}
                                                onChange={(e) => {
                                                    setMoveInTime(e.target.value)
                                                    validateDateTime(moveInDate, e.target.value)
                                                }}
                                                className={`w-full px-4 py-3 text-sm text-center border rounded-full outline-none md:py-4 ${timeError ? 'border-[#FF0000]' : ''}`} />
                                        </div>


                                        <button type='submit' className='relative w-full py-3 mt-8 text-sm text-center text-white rounded-full lg:py-4 bg-primary lg:hover:bg-primary-hover smooth-transition'>Schedule Move In Date</button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Mobile navigation */}
            <MobileNavigationTab />

            {/* Payment disbursal confirmed Modal */}
            <div className={`fixed top-0 bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm offset ${isMoveInDate ? 'block' : 'hidden'}`}>
                <div className='centralizeContent'>
                    <div className='bg-white w-[90%] sm:w-[60%] lg:w-[35%] desktop-lg:w-[30%] py-10 px-4 lg:py-14 lg:px-10 rounded-[30px] lg:rounded-[40px] flex items-center flex-col shadow-md'>

                        <div className='text-center'>
                            <h3 className='font-bold leading-none uppercase font-poppins text-base lg:text-[28px] w-[60%]  mx-auto'>MOVE IN  Date  confirmed</h3>
                        </div>

                        <Link to={`/user/apartment/manage`} className="relative w-[90%] lg:w-[80%] py-3 lg:py-4 mt-12 text-center text-white rounded-full  bg-primary hover:bg-primary-hover smooth-transition">
                            <button className='text-sm '>Download Receipt</button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ScheduleMoveIn