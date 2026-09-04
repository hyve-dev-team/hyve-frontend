import { useState, useEffect, useCallback } from 'react'
import Sidebar from './components/layout/Sidebar/Sidebar'
import Header from './components/layout/Dashboard/Header'
import TotalPropertiesCard from './components/layout/Dashboard/TotalPropertiesCard'
import MobileNavigationTab from './components/layout/MobileNavigation/MobileNavigationTab'
import AllProperties from './components/layout/Dashboard/AllProperties'
import { getLandlordProperties } from '../../utils/landlordPropertiesApi'
import { mapProperties } from '../../utils/mapProperty'
import { hyveError } from '../../utils/hyveToast'

const LandlordDashboard = () => {
  const [properties, setProperties] = useState([]);
  const [overallRating, setOverallRating] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLandlordData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const rawList = await getLandlordProperties();
      const mapped = mapProperties(rawList);
      setProperties(mapped);

      // Compute average rating across all reviews of landlord's properties
      const allReviews = mapped.flatMap((p) => p.reviews || []);
      const avg = allReviews.length
        ? allReviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / allReviews.length
        : 0;
      setOverallRating(avg);
    } catch (err) {
      console.error("Failed to load landlord properties:", err);
      const msg = err?.message || "Could not load properties. Please try again.";
      setError(msg);
      hyveError("Error loading properties", msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLandlordData();
  }, [fetchLandlordData]);

  return (
    <div className='page-wrapper'>
      <div className='flex'>
        {/* dashboard sidebar*/}
        <Sidebar currentPage={"home"} />

        {/* dashboard content area */}
        <main className='w-full h-[100svh] sm:w-[70%] lg:w-[80%] overflow-auto'>
          {/* dashboard header */}
          <Header />

          <div className='px-3 mt-8 pb-28 sm:pb-16 sm:px-6 lg:px-8 lg:mt-8'>
            {/* Total properties component*/}
            <TotalPropertiesCard
              totalCount={properties.length}
              overallRating={overallRating}
              isLoading={isLoading}
            />

            {/* All listed Properties */}
            <AllProperties
              properties={properties}
              isLoading={isLoading}
              error={error}
              onRetry={fetchLandlordData}
            />
          </div>
        </main>
      </div>

      {/* Mobile navigation */}
      <MobileNavigationTab currentTab={"home"} />
    </div>
  )
}

export default LandlordDashboard