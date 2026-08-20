import React from 'react'
import Sidebar from './components/layout/Sidebar/Sidebar'
import Header from './components/layout/Dashboard/Header'
import AllApartments from './components/layout/Dashboard/AllApartments'
import MobileNavigationTab from './components/layout/MobileNavigation/MobileNavigationTab'
import { RiSearch2Line } from 'react-icons/ri'

const Search = () => {
    return (
        <div className='page-wrapper'>
            <div className='flex'>
                {/* dashboard sidebar*/}
                <Sidebar currentPage={"search"} />

                {/* dashboard content area */}
                <main className='w-full h-[100svh] sm:w-[70%] lg:w-[80%] overflow-auto'>
                    {/* dashboard header */}
                    <Header />

                    <div className='px-3 mt-6 pb-28 sm:pb-16 sm:px-6 lg:px-8 lg:mt-8'>

                        <div className='w-full sm:hidden'>
                            <div className='group flex flex-shrink items-center border border-[#AAAAAA] rounded-full overflow-hidden px-3 lg:px-5 shadow-sm'>
                                <span className='mr-3'><RiSearch2Line className='text-[#AAAAAA] text-[16px] lg:text-[20px]' /></span>

                                {/* This search input will use Debouncing: search result page:- /user/apartment/search */}
                                <input type="search" name='search-properties' id='search-properties' className='outline-none w-full text-black py-2 lg:py-3 text-sm placeholder:font-light placeholder:text-[#AAAAAA]' placeholder='I am looking for...' />
                            </div>
                        </div>
                        
                        <div className='flex items-center justify-between mt-8'>
                            <h4 className="text-sm font-normal rounded-lg font-poppins">13 ads found</h4>

                            <div>
                                <label htmlFor="filter" className='text-sm'>Filter:</label>
                                <select name="" id="" className='ml-2 border border-[#FFB88B] rounded-md text-xs outline-none py-1 px-2'>
                                    <option value="">All</option>
                                    <option value="">Newest</option>
                                    <option value="">Oldest</option>
                                    <option value="">Lowest price</option>
                                    <option value="">Highest price</option>
                                </select>
                            </div>
                        </div>

                        {/* Available Lodges */}
                        <AllApartments />
                    </div>
                </main>
            </div>

            {/* Mobile navigation */}
            <MobileNavigationTab currentTab={"search"} />
        </div>
    )
}

export default Search