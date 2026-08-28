
import { useState, useEffect } from 'react'
import Sidebar from './components/layout/Sidebar/Sidebar'
import Header from './components/layout/Dashboard/Header'
import CurrentLodgeCard from './components/layout/Dashboard/CurrentLodgeCard'
import AllApartments from './components/layout/Dashboard/AllApartments'
import MobileNavigationTab from './components/layout/MobileNavigation/MobileNavigationTab'
import { getProperties } from '../../utils/propertiesApi'
import { mapProperties } from '../../utils/mapProperty'
import useSavedPropertyIds from '../../hooks/useSavedPropertyIds'
import { hyveError } from '../../utils/hyveToast'

const TenantDashboard = () => {
    const [lodges, setLodges] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { savedIds, applyOptimisticChange } = useSavedPropertyIds();

    useEffect(() => {
        let cancelled = false;
        getProperties({ page: 0, size: 20 })
            .then((data) => {
                if (cancelled) return;
                setLodges(mapProperties(data.content));
            })
            .catch((err) => {
                console.error("Failed to load properties:", err);
                hyveError("Couldn't load listings", "Please refresh and try again.");
            })
            .finally(() => !cancelled && setIsLoading(false));
        return () => { cancelled = true; };
    }, []);

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
                            {isLoading ? (
                                <p className='py-12 text-sm text-center text-[#AAAAAA]'>Loading listings...</p>
                            ) : (
                                <AllApartments
                                    lodges={lodges}
                                    savedIds={savedIds}
                                    onSavedChange={applyOptimisticChange}
                                    emptyMessage="No listings available right now."
                                />
                            )}
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
