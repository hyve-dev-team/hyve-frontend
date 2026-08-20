import React, { useEffect, useState } from 'react'
import Sidebar from './components/layout/Sidebar/Sidebar'
import Header from './components/layout/Dashboard/Header'
import MobileNavigationTab from './components/layout/MobileNavigation/MobileNavigationTab'
import { Link } from 'react-router-dom'
import ConfirmPayment from './components/layout/Reservation/ConfirmPayment'
import ReversePayment from './components/layout/Reservation/ReversePayment'
import PostScheduleTour from './components/layout/Reservation/PostScheduleTour'
import TourSchedule from './components/layout/Reservation/TourSchedule'

const ScheduleTour = () => {
    const [tourDate, setTourDate] = useState('')
    const [tourTime, setTourTime] = useState('')
    const [dateError, setDateError] = useState(false)
    const [timeError, setTimeError] = useState(false)
    const [errorMsg, setErrorMsg] = useState({ isErrorMsg: false, message: "" });
    const [isScheduled, setIsScheduled] = useState(false)
    const [countdown, setCountdown] = useState({ days: 0, hours: 0, mins: 0, seconds: 0 })
    const [countdownElapsed, setCountdownElapsed] = useState(false);
    const [isConfirmPayment, setIsConfirmPayment] = useState(false)
    const [isReversePayment, setIsReversePayment] = useState(false)

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

    useEffect(() => {
        if (isScheduled && tourDate && tourTime) {
            const timer = setInterval(() => {
                const now = new Date().getTime()
                const scheduledDateTime = new Date(`${tourDate}T${tourTime}`).getTime()
                const distance = scheduledDateTime - now

                /* if countdown timer has ended*/
                if (distance < 0) {
                    clearInterval(timer)
                    setCountdown({ days: 0, hours: 0, mins: 0, seconds: 0 })

                    /*  */
                    setCountdownElapsed(true)
                } else {
                    const days = Math.floor(distance / (1000 * 60 * 60 * 24))
                    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
                    const mins = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
                    const seconds = Math.floor((distance % (1000 * 60)) / 1000)

                    setCountdown({ days, hours, mins, seconds })
                }
            }, 1000)

            return () => clearInterval(timer)
        }
    }, [isScheduled, tourDate, tourTime])

    const handleSubmit = (e) => {
        e.preventDefault()

        // Reset errors
        setDateError(false)
        setTimeError(false)
        setErrorMsg({ isErrorMsg: false, message: "" })

        // Validate inputs
        let hasError = false

        if (!tourDate && !tourTime) {
            setDateError(true)
            setTimeError(true)
            hasError = true
        }

        if (!tourDate) {
            setDateError(true)
            hasError = true
        }

        if (!tourTime) {
            setTimeError(true)
            hasError = true
        }

        // Validate date and time are not in the past
        if (tourDate && tourTime) {
            const now = new Date()
            const selectedDateTime = new Date(`${tourDate}T${tourTime}`)

            if (selectedDateTime < now) {
                setTimeError(true)
                hasError = true;
                setErrorMsg({ isErrorMsg: true, message: "Cannot schedule tour in the past" })
            }
        }

        if (hasError) {
            return
        }

        // Log the data
        console.log({
            date: tourDate,
            time: tourTime,
            scheduledDateTime: `${tourDate}T${tourTime}`
        })

        // Show scheduled component
        setIsScheduled(true)
    }


    const handleReversePayment = (e) => {
        e.preventDefault();

        setIsReversePayment(true)
    }
    const handleConfirmPayment = (e) => {
        e.preventDefault();

        setIsConfirmPayment(true)
    }

    const handleCancel = () => {
        setIsScheduled(false)
        setTourDate('')
        setTourTime('')
        setDateError(false)
        setTimeError(false)
        setErrorMsg({ isErrorMsg: false, message: "" })
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

                    <div className='px-3 sm:px-6 lg:px-8 min-h-[calc(100svh-8rem)] flex flex-col justify-center sm:min-h-0 sm:mt-8 sm:pb-16 lg:mt-8'>
                        <div className='flex justify-center lg:pt-3 '>
                            {!isScheduled ?
                                <>
                                    {/* schedule tour component*/}
                                    <div className='w-full md:w-[70%] lg:w-[50%] sm:bg-[#F4F4F4] px-2 py-10 md:p-6 lg:py-12 lg:px-16 rounded-[30px] lg:rounded-[40px] '>
                                        <form onSubmit={handleSubmit}>

                                            {errorMsg.isErrorMsg &&
                                                <p className='text-xs text-[#FF0000] text-center'>{errorMsg.message}</p>
                                            }

                                            <div>
                                                <label htmlFor="tour-date" className='flex justify-center mb-2 text-sm font-medium md:text-[16px] pt-4 lg:pt-2'>Enter date for apartment visit</label>
                                                <input
                                                    id="tour-date"
                                                    type="date"
                                                    value={tourDate}
                                                    min={today}
                                                    onChange={(e) => {
                                                        setTourDate(e.target.value)
                                                        validateDateTime(e.target.value, tourTime)
                                                    }}
                                                    className={`w-full px-4 py-3 text-sm text-center border rounded-full outline-none md:py-4 ${dateError ? 'border-[#FF0000]' : ''}`} />
                                            </div>

                                            <div className='mt-4'>
                                                <label htmlFor="tour-time" className='flex justify-center mb-2 text-sm font-medium md:text-base'>Time</label>
                                                <input
                                                    id="tour-time"
                                                    type="time"
                                                    value={tourTime}
                                                    onChange={(e) => {
                                                        setTourTime(e.target.value)
                                                        validateDateTime(tourDate, e.target.value)
                                                    }}
                                                    className={`w-full px-4 py-3 text-sm text-center border rounded-full outline-none md:py-4 ${timeError ? 'border-[#FF0000]' : ''}`} />
                                            </div>


                                            <button type='submit' className='relative w-full py-3 mt-8 text-sm text-center text-white rounded-full lg:py-4 bg-primary lg:hover:bg-primary-hover smooth-transition'>Schedule Tour</button>
                                        </form>
                                    </div>
                                </>
                                :
                                <>
                                    {
                                        !countdownElapsed ?
                                            <>
                                                {/* Scheduled component */}
                                                <TourSchedule daysRemaining={countdown.days} hoursRemaining={countdown.hours} minutesRemaining={countdown.mins} secondsRemaining={countdown.seconds} />
                                            </>
                                            :
                                            <>
                                                {/* Reverse or Confirm payment component after Tour: This component is displayed After a Scheduled Tour Data has elapsed. (after the countdown has ended) */}
                                                <PostScheduleTour reversePayOnSubmit={handleReversePayment} confirmPayOnSubmit={handleConfirmPayment} />
                                            </>
                                    }
                                </>
                            }
                        </div>
                    </div>
                </main>
            </div>

            {/* Mobile navigation */}
            <MobileNavigationTab />

            {/* FEEDBACK MODALS */}
            {/* Reverse Payment Modal */}
            <ReversePayment redirect={`/user/dashboard`} isReversePayment={isReversePayment} />

            {/* Payment Confirmed Modal */}
            <ConfirmPayment redirect={`/user/apartment/schedule-move-in/${1}`} isConfirmPayment={isConfirmPayment} />
        </div>
    )
}

export default ScheduleTour