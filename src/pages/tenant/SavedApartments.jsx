
import { useState, useEffect } from 'react'
import { getSavedProperties } from '../../utils/propertiesApi'
import { mapProperties } from '../../utils/mapProperty'
import { hyveError } from '../../utils/hyveToast'

import Sidebar from './components/layout/Sidebar/Sidebar'
import MobileNavigationTab from './components/layout/MobileNavigation/MobileNavigationTab'
import AllApartments from './components/layout/Dashboard/AllApartments'
import Header from './components/layout/Dashboard/Header'

const SavedApartments = () => {
    const [savedLodges, setSavedLodges] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadSaved = () => {
        setIsLoading(true);
        getSavedProperties()
            .then((properties) => setSavedLodges(mapProperties(properties)))
            .catch((err) => {
                console.error("Failed to load saved properties:", err);
                hyveError("Couldn't load saved apartments", "Please refresh and try again.");
            })
            .finally(() => setIsLoading(false));
    };

    useEffect(() => {
        loadSaved();
    }, []);

    // Real saved-ids set to keep the heart icon accurate, and re-fetch the list on
    // unsave so an item disappears from this page immediately.
    const savedIds = new Set(savedLodges.map((l) => l.id));
    const handleSavedChange = (id, isNowSaved) => {
        if (!isNowSaved) {
            setSavedLodges((prev) => prev.filter((l) => l.id !== id));
        }
    };

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
                                    <p className='text-sm text-[#AAAAAA]'>
                                        {isLoading ? "Loading..." : `${savedLodges.length} Apartments Saved`}
                                    </p>
                                </div>

                                {!isLoading && (
                                    <AllApartments
                                        lodges={savedLodges}
                                        savedIds={savedIds}
                                        onSavedChange={handleSavedChange}
                                        emptyMessage="You haven't saved any apartments yet. Tap the heart icon on a listing to save it."
                                    />
                                )}
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
