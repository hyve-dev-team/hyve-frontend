
{/* Reverse or Confirm payment component after Tour: This modal is displayed After a Scheduled Tour Data has elapsed. */}
const PostScheduleTour = ({reversePayOnSubmit, confirmPayOnSubmit}) => {
    return (
        <>
            <div className='w-full md:w-[70%] lg:w-[80%] sm:bg-[#FFF1E8] px-2 py-8 md:p-6 lg:py-16 lg:px-12'>
                <div className='flex flex-col justify-between gap-6 lg:gap-8 lg:flex-row'>

                    <div className='bg-[#FFF1E8] sm:bg-white rounded-[8px] px-6 py-8 lg:py-10 lg:px-6 w-full'>
                        <form onSubmit={reversePayOnSubmit} method='POST'>
                            <div className='flex items-start justify-between gap-2'>
                                <p className='text-[#555555] text-sm lg:text-base'>Dissatisfied with <br /> apartment after tour?</p>
                                <input type="checkbox" className='w-4 h-4 lg:w-6 lg:h-6' required />
                            </div>

                            <button type='submit' className='relative w-full py-3 mt-8 text-sm text-center text-white bg-black rounded-full lg:mt-10 lg:py-4 lg:hover:bg-black/80 smooth-transition'>
                                Reverse Payment
                            </button>
                        </form>
                    </div>

                    <div className='bg-[#FFF1E8] sm:bg-white rounded-[8px] px-6 py-8 lg:py-10 lg:px-6 w-full'>
                        <form onSubmit={confirmPayOnSubmit} method='POST'>
                            <div className='flex items-start justify-between gap-2'>
                                <p className='text-[#555555] text-sm lg:text-base'>Satisfied with <br /> apartment after tour?</p>
                                <input type="checkbox" className='w-4 h-4 lg:w-6 lg:h-6' required />
                            </div>

                            <button type='submit' className='relative w-full py-3 mt-8 text-sm text-center text-white rounded-full lg:mt-10 bg-primary lg:py-4 lg:hover:bg-primary-hover smooth-transition'>
                                Confirm Payment
                            </button>
                        </form>
                    </div>

                </div>
            </div>
        </>
    )
}

export default PostScheduleTour