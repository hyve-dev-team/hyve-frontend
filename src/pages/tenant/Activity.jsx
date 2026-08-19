import Header from "./components/layout/Dashboard/Header"
import MobileNavigationTab from "./components/layout/MobileNavigation/MobileNavigationTab"
import Sidebar from "./components/layout/Sidebar/Sidebar"

const Activity = () => {
    return (
        <>
            <div className='page-wrapper'>
                <div className='flex'>
                    {/* dashboard sidebar*/}
                    <Sidebar  />

                    {/* dashboard content area */}
                    <main className='w-full h-[100svh] sm:w-[70%] lg:w-[80%] overflow-auto'>
                        {/* dashboard header */}
                        <Header />

                        <div className='px-3 mt-8 pb-28 sm:pb-16 sm:px-6 lg:px-8 lg:mt-8'>
                            <div className="flex flex-col gap-4 md:flex-row">
                                <div className="bg-[#FFF0E6] rounded-lg w-full py-3 md:py-4 px-4 md:px-8">
                                    <h3 className="font-poppins text-sm md:text-[18px] font-medium">Completed Bookings</h3>
                                    <p className="text-xs font-light md:text-sm">2 days ago</p>
                                </div>

                                <div className="bg-[#FFF0E6] rounded-lg w-full py-3 md:py-4 px-4 md:px-8">
                                    <h3 className="font-poppins text-sm md:text-[18px] font-medium">NGN 134,423</h3>
                                    <p className="text-xs font-light md:text-sm">Total Spent</p>
                                </div>
                            </div>

                            <div className="mt-8">
                                <h4 className="font-poppins font-light border border-[#FFB88B] px-6 md:px-10 py-2 rounded-lg text-sm md:text-[16px] inline">All Activity</h4>

                                <div className="flex flex-col mt-6 divide-y divide-[#0000000D]">
                                    <div className="flex items-center justify-between py-4">
                                        <div>
                                            <h4 className="font-normal font-poppins text-[14px]">Completed Booking at Lorem Apartment</h4>
                                            <p className="mt-1 text-xs font-light">2 days ago</p>
                                        </div>
                                        <div className="hidden md:block">
                                            <p className="text-xs font-light">32 SEP</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between py-4">
                                        <div>
                                            <h4 className="font-normal font-poppins text-[14px]">Completed Booking at Lorem Apartment</h4>
                                            <p className="mt-1 text-xs font-light">2 days ago</p>
                                        </div>
                                        <div className="hidden md:block">
                                            <p className="text-xs font-light">32 SEP</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between py-4">
                                        <div>
                                            <h4 className="font-normal font-poppins text-[14px]">Cancelled Booking at Swift Lodge</h4>
                                            <p className="mt-1 text-xs font-light">2 days ago</p>
                                        </div>
                                        <div className="hidden md:block">
                                            <p className="text-xs font-light">32 SEP</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
                {/* Mobile navigation */}
                <MobileNavigationTab />
            </div>
        </>
    )
}

export default Activity