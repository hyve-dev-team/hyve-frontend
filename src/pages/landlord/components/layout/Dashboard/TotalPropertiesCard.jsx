import { Link } from 'react-router-dom'
import { IoMdAdd } from "react-icons/io";
import { MdStarRate } from 'react-icons/md';

const TotalPropertiesCard = ({ overallRating = 0, totalCount = 0, isLoading = false }) => {
    const numericRating = Number(overallRating) || 0;

    return (
        <div className='w-full bg-primary rounded-[8px] sm:rounded-[16px] p-4 lg:p-6 shadow-sm'>
            <div className='pt-2 pb-0 lg:pt-3 lg:pb-2'>
                <div className='text-white'>
                    <p className='font-medium leading-none text-[12px] sm:text-sm text-white/90'>Total properties</p>
                    <h2 className='font-bold text-[32px] lg:text-[36px] font-poppins mt-1'>
                        {isLoading ? (
                            <span className='inline-block w-8 h-8 rounded bg-white/20 animate-pulse' />
                        ) : (
                            totalCount
                        )}
                    </h2>
                </div>

                <div className='relative flex flex-col mt-2 lg:justify-between lg:items-end lg:mr-7 lg:-mt-6 lg:flex-row'>
                    <div className="flex items-center pt-2">
                        <p className="mr-2 font-medium text-sm sm:text-[16px] leading-none text-white">Rating:</p>
                        <div className="flex items-center">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <MdStarRate
                                    key={i}
                                    className={`${i < Math.round(numericRating) ? 'text-[#FFFFFF]' : 'text-[#FFFFFF]/30'} text-lg `}
                                />
                            ))}
                        </div>
                        {numericRating > 0 ? (
                            <span className="ml-2 text-xs font-medium text-white/90">
                                {numericRating.toFixed(1)}
                            </span>
                        ) : (
                            <span className="ml-2 text-xs font-normal text-white/70">
                                {isLoading ? "Loading..." : "No reviews yet"}
                            </span>
                        )}
                    </div>

                    <Link to="/landlord/property/add" className='bg-white hover:bg-gray smooth-transition mt-3 rounded-full py-2 shadow-sm w-full flex items-center gap-2 justify-center font-normal sm:w-[70%] lg:w-[25%] lg:py-2'>
                        <span className='flex items-center gap-2 sm:py-1 justify-center font-medium text-sm md:text-[16px] text-primary'>
                            Add Property
                            <IoMdAdd className='text-[24px] lg:text-[28px] text-primary' />
                        </span>
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default TotalPropertiesCard