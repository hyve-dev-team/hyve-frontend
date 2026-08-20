import { Link } from 'react-router-dom'
import { IoMdAdd } from "react-icons/io";
import { MdStarRate } from 'react-icons/md';

const TotalPropertiesCard = ({ overallRating = 3 }) => {
    return (
        <>
            <div className='w-full bg-primary rounded-[8px] sm:rounded-[16px] p-4 lg:p-6'>
                <div className='pt-2 pb-0 lg:pt-3 lg:pb-2'>

                    <div className='text-white'>
                        <p className='font-medium leading-none text-[12px] sm:text-sm'>Total properties</p>
                        <h2 className='font-bold text-[32px] lg:text-[36px] font-poppins'>9</h2>
                    </div>

                    <div className='relative flex flex-col mt-2 lg:justify-between lg:items-end lg:mr-7 lg:-mt-6 lg:flex-row'>
                        <div className="flex items-center pt-2">
                            <p className="mr-2 font-medium text-sm sm:text-[16px] leading-none text-white">Rating:</p>
                            {Array.from({ length: 5 }).map((_, i) => (
                                <MdStarRate
                                    key={i}
                                    className={`${i < Math.round(overallRating) ? 'text-[#FFFFFF]' : 'text-[#FFFFFF]/30'} text-lg `}
                                />
                            ))}
                        </div>

                        <Link to="/landlord/property/add" className='bg-white hover:bg-gray smooth-transition mt-3 rounded-full py-2 shadow-sm w-full flex items-center gap-2 justify-center font-normal sm:w-[70%] lg:w-[25%] lg:py-2'>
                            <button className='flex items-center gap-2 sm:py-1 justify-center font-normal text-sm md:text-[16px]'>
                                Add Property
                                <IoMdAdd className='text-[26px] lg:text-[30px] text-primary' />
                            </button>
                        </Link>
                    </div>

                </div>
            </div>
        </>
    )
}

export default TotalPropertiesCard