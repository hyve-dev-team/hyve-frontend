import { Link } from 'react-router-dom'
import featuredLodges from '../../utils/featuredLodges'

import { LuUserRoundCog } from 'react-icons/lu'
import Sidebar from './components/layout/Sidebar/Sidebar'
import MobileNavigationTab from './components/layout/MobileNavigation/MobileNavigationTab'

import { BsHeartFill } from "react-icons/bs";
import { IoStarSharp } from 'react-icons/io5'
import Header from './components/layout/Dashboard/Header'

const SavedApartments = () => {
    return (
        <>
            <div className='page-wrapper'>
                <div className='flex'>
                    {/* dashboard sidebar*/}
                    <Sidebar currentPage={"saved"} />

                    {/* dashboard content area */}
                    <main className='w-full h-[100svh] sm:w-[70%] lg:w-[80%] overflow-auto'>
                        {/* dashboard header */}
                        <Header />
                        <div className='px-3 mt-8 pb-28 sm:pb-16 sm:px-6 lg:px-8 lg:mt-8'>
                            <section className='mt-6'>
                                <div className='mb-4'>
                                    <p className='text-sm text-[#AAAAAA]'>12 Apartments Saved</p>
                                </div>
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-1 md:gap-6 lg:grid-cols-2">
                                    {featuredLodges.map((lodge) => (
                                        <div key={lodge.id} className='border border-[#FF630033] rounded-[8px] p-2 md:mb-4 md:p-0 sm:border-0 '>
                                            {/* lodge image */}
                                            <div className="rounded-[6px] relative overflow-hidden w-full h-[280px] sm:h-[300px] sm:rounded-[16px]">
                                                <Link to={`/user/apartment/${lodge.id}`}>
                                                    <img src={lodge.lodgeImage} alt="featured lodge" className='object-cover w-full h-full' />
                                                </Link>

                                                {/* save apartment button */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        console.log('Lodge unsaved:', lodge.id);
                                                    }}
                                                    className='absolute z-10 p-2 bg-white rounded-full shadow-sm cursor-pointer right-3 top-3 md:right-6 md:top-6'
                                                >
                                                    <BsHeartFill className='text-primary sm:text-[16px] md:text-[20px]' />
                                                </button>
                                            </div>


                                            {/* lodge details */}
                                            <div>
                                                {/* Price (Visible only on smaller screens) */}
                                                <div className="mt-4 sm:hidden">
                                                    <p className="text-sm font-normal text-[#FF6300]">
                                                        ₦ {lodge.price}
                                                    </p>
                                                </div>
                                                <div className="flex items-start justify-between gap-3 mb-1 sm:mt-4">
                                                    <Link to={`/user/apartment/${lodge.id}`} className="flex-1 min-w-0">
                                                        <h3 className="font-poppins text-[14px] md:text-[16px] font-medium line-clamp-2">
                                                            {lodge.lodgeDesc}
                                                        </h3>
                                                    </Link>
                                                    <div className="flex-shrink-0 hidden sm:block">
                                                        <p className="text-sm font-normal text-primary md:text-[16px] whitespace-nowrap">
                                                            ₦ {lodge.price}
                                                        </p>
                                                        <p className="text-[10px] md:text-[12px] font-light capitalize text-right">
                                                            per year
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* lodge location estimation */}
                                            <div className="flex flex-wrap items-center gap-2 mt-1 md:mt-2" >
                                                <p className="text-[12px] md:text-sm mr-2 text-[#AAAAAA] sm:text-black">2.1 km from Unilag</p>
                                                <span className="hidden bg-[#DDFFE7] text-[#1B784D] text-[10px] md:text-[10px] px-4 rounded-sm md:rounded-md md:py-[.2rem] py-[.15rem] sm:block">
                                                    Verified
                                                </span>
                                                <span className="hidden bg-[#FF630038] text-[#FF6300] text-[10px] md:text-[10px] px-4 rounded-sm md:rounded-md md:py-[.2rem] py-[.15rem] capitalize sm:block">
                                                    {lodge.status}
                                                </span>
                                            </div>

                                            <div className="flex flex-wrap items-center justify-between mt-2 md:mt-3 ">
                                                <div className="flex-wrap items-center hidden sm:flex">
                                                    <span className="relative top-[-1.5px] text-[#F6D100] text-[20px] pr-1"><IoStarSharp /></span>
                                                    <span className="pr-3">
                                                        <p className="pb-0 mb-0 text-sm font-bold">{lodge.starRating}</p>
                                                    </span>

                                                    <span><p className="text-[12px] font-light">{lodge.totalReviews} reviews</p></span>
                                                </div>

                                                {/* Amenities */}
                                                <div className='hidden sm:block'>
                                                    <p className="text-[12px] font-light">{lodge.amenities}</p>
                                                </div>

                                                {/* verified id tag, only visible on mobile screens */}
                                                <div className="flex items-center gap-2 sm:hidden">
                                                    <span className="flex items-center gap-1 text-sm text-[#FF6300] border border-[#FF6300] bg-white px-2 py-1 rounded-md">
                                                        <LuUserRoundCog />
                                                        <p className="leading-none text-[10px]">Verified ID</p>
                                                    </span>
                                                </div>
                                            </div>

                                            {/* CTA */}
                                            <div className="hidden gap-4 mt-4 sm:flex sm:mt-6">
                                                <Link to={`/user/apartment/${lodge.id}`} className='w-1/2 py-2 text-white rounded-lg shadow-md bg-primary hover:bg-primary-hover smooth-transition text-[12px] sm:text-[14px] text-center'>
                                                    <button type='button'>
                                                        Explore Property
                                                    </button>
                                                </Link>

                                                <Link to={``} className="w-1/2 py-2 text-black bg-transparent border-2 rounded-lg shadow-md border-primary hover:bg-gray smooth-transition text-[12px] sm:text-[14px] text-center">
                                                    <button type='button'>
                                                        Message Owner
                                                    </button>
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div >
                            </section >
                        </div>
                    </main>
                </div>
                {/* Mobile navigation */}
                <MobileNavigationTab currentTab={"saved"} />
            </div>
        </>
    )
}

export default SavedApartments