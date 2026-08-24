
import { useState, useEffect, useMemo } from 'react'
import featuredLodges from '../../utils/featuredLodges'
import { getSavedIds, subscribeToSavedChanges } from '../../utils/savedLodges'

import Sidebar from './components/layout/Sidebar/Sidebar'
import MobileNavigationTab from './components/layout/MobileNavigation/MobileNavigationTab'
import AllApartments from './components/layout/Dashboard/AllApartments'
import Header from './components/layout/Dashboard/Header'

const SavedApartments = () => {
    // Reads real saved ids from localStorage (see utils/savedLodges.js) instead of
    // showing the full static list. Swap getSavedIds() for a real API call once
    // GET /saved-apartments exists on the backend.
    const [savedIds, setSavedIds] = useState(() => getSavedIds());

    useEffect(() => {
        const sync = () => setSavedIds(getSavedIds());
        const unsubscribe = subscribeToSavedChanges(sync);
        return unsubscribe;
    }, []);

    const savedLodges = useMemo(
        () => featuredLodges.filter((lodge) => savedIds.includes(lodge.id)),
        [savedIds]
    );

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
                                    <p className='text-sm text-[#AAAAAA]'>{savedLodges.length} Apartments Saved</p>
                                </div>

                                <AllApartments
                                    lodges={savedLodges}
                                    emptyMessage="You haven't saved any apartments yet. Tap the heart icon on a listing to save it."
                                />
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
