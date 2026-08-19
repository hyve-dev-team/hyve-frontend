
/* TourScedule: This Component displays the Countdown Timer for an apartment Inspection date schedule*/
const TourSchedule = ({daysRemaining, hoursRemaining, minutesRemaining, secondsRemaining}) => {
    return (
        <div className='w-full md:w-[70%] lg:w-[60%] sm:bg-[#F4F4F4] px-4 py-10 md:p-6 lg:py-16 lg:px-16 rounded-[30px] lg:rounded-[40px] '>
            <div className='text-center'>
                <h2 className='text-[18px] font-bold uppercase font-poppins md:text-[24px] lg:text-[32px]'>Scheduled</h2>
                <p className='mt-2 text-sm font-light md:mt-4 lg:text-base' >You can Reverse or Disburse your payment after Apartment inspection</p>
            </div>


            <div className='flex items-start justify-center w-full gap-2 mt-10 lg:mt-14 lg:gap-6'>

                <div className='flex flex-col items-center'>
                    <p className='text-primary text-[24px] lg:text-[32px]'>
                        {String(daysRemaining).padStart(2, '0')}
                    </p>
                    <span className='text-sm font-light lg:text-base'>Days</span>
                </div>

                <span className='relative  text-primary text-[20px] lg:text-[28px]'>
                    :
                </span>

                <div className='flex flex-col items-center'>
                    <p className='text-primary text-[24px] lg:text-[32px]'>
                        {String(hoursRemaining).padStart(2, '0')}
                    </p>
                    <span className='text-sm font-light lg:text-base'>Hours</span>
                </div>

                <span className='relative  text-primary text-[20px] lg:text-[28px]'>
                    :
                </span>

                <div className='flex flex-col items-center'>
                    <p className='text-primary text-[24px] lg:text-[32px]'>
                        {String(minutesRemaining).padStart(2, '0')}
                    </p>
                    <span className='text-sm font-light lg:text-base'>Mins</span>
                </div>

                <span className='relative  text-primary text-[20px] lg:text-[28px]'>
                    :
                </span>

                <div className='flex flex-col items-center'>
                    <p className='text-primary text-[24px] lg:text-[32px]'>
                        {String(secondsRemaining).padStart(2, '0')}
                    </p>
                    <span className='text-sm font-light lg:text-base'>Seconds</span>
                </div>

            </div>
        </div>
    )
}

export default TourSchedule