import Sidebar from './components/layout/Sidebar/Sidebar'
import Header from './components/layout/Dashboard/Header'
import CurrentLodgeCard from './components/layout/Dashboard/CurrentLodgeCard'
import AllApartments from './components/layout/Dashboard/AllApartments'
import MobileNavigationTab from './components/layout/MobileNavigation/MobileNavigationTab'

const TenantDashboard = () => {
    return (
        <>
            <div className='page-wrapper'>
                <div className='flex'>
                    {/* dashboard sidebar*/}
                    <Sidebar currentPage={"home"}/>

                    {/* dashboard content area */}
                    <main className='w-full h-[100svh] sm:w-[70%] lg:w-[80%] overflow-auto'>
                        {/* dashboard header */}
                        <Header />

                        <div className='px-3 mt-8 pb-28 sm:pb-16 sm:px-6 lg:px-8 lg:mt-8'>
                            {/* Current Lodge component: Only visible if user has a current lodge status*/}
                            <CurrentLodgeCard />

                            {/* Available Lodges */}
                            <AllApartments />
                        </div>
                    </main>
                </div>
                
                {/* Mobile navigation */}
                <MobileNavigationTab currentTab={"home"}/>
            </div>
        </>
    )
}

export default TenantDashboard