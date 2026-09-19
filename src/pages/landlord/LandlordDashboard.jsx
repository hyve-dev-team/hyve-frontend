import { useState, useEffect, useCallback } from 'react'
import Sidebar from './components/layout/Sidebar/Sidebar'
import Header from './components/layout/Dashboard/Header'
import TotalPropertiesCard from './components/layout/Dashboard/TotalPropertiesCard'
import MobileNavigationTab from './components/layout/MobileNavigation/MobileNavigationTab'
import AllProperties from './components/layout/Dashboard/AllProperties'
import { getLandlordProperties } from '../../utils/landlordPropertiesApi'
import { mapProperties } from '../../utils/mapProperty'
import { hyveError } from '../../utils/hyveToast'
import AgentSetupSection from './components/AgentSetupSection'
import LandlordTourRequests from './components/LandlordTourRequests'

const LandlordDashboard = () => {
  const [properties, setProperties] = useState([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState(null);
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
            {/* Verification Status Banner */}
            {(() => {
              const userStr = localStorage.getItem('user');
              let kycStatus = 'PENDING';
              try {
                if (userStr) kycStatus = JSON.parse(userStr)?.kycStatus || 'PENDING';
              } catch {}

              if (kycStatus === 'VERIFIED') {
                return (
                  <div className="mb-6 p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-base shrink-0">
                        ✓
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-emerald-900">Verified Host Badge Active</p>
                        <p className="text-[11px] text-emerald-700">Your properties display the official Hyve verified tag for students.</p>
                      </div>
                    </div>
                    <a href="/landlord/verification" className="text-xs font-bold text-emerald-800 hover:underline shrink-0">
                      View Documents
                    </a>
                  </div>
                );
              } else if (kycStatus === 'PENDING') {
                return (
                  <div className="mb-6 p-4 rounded-2xl bg-[#FFF9F6] border border-orange-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-orange-100 text-primary flex items-center justify-center font-bold text-base shrink-0 animate-pulse">
                        ⏳
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-stone-900">Verification Application in Review</p>
                        <p className="text-[11px] text-stone-500">Hyve legal & compliance team is auditing your property titles.</p>
                      </div>
                    </div>
                    <a href="/landlord/verification" className="px-4 py-2 bg-white hover:bg-orange-50 text-primary border border-primary/30 rounded-xl text-xs font-bold text-center transition-colors shrink-0">
                      Check Status
                    </a>
                  </div>
                );
              } else {
                return (
                  <div className="mb-6 p-4 rounded-2xl bg-[#FFF9F6] border border-orange-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-orange-100 text-primary flex items-center justify-center font-bold text-base shrink-0">
                        🛡️
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-stone-900">Get Your Landlord Verified Badge</p>
                        <p className="text-[11px] text-stone-500">Upload your property titles and live photo to get 3x more bookings.</p>
                      </div>
                    </div>
                    <a href="/landlord/verification" className="px-5 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold text-center transition-colors shrink-0 shadow-sm">
                      Get Verified Now
                    </a>
                  </div>
                );
              }
            })()}

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

            {/* Incoming Tenant Tour Inspection Requests */}
            <LandlordTourRequests />

            {/* Caretaker & Agent Inspection Configuration */}
            {!isLoading && properties.length > 0 && (
              <div className="mt-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <h3 className="font-poppins text-lg font-semibold text-[#3D3129]">
                      Property Inspection Agents
                    </h3>
                    <p className="text-xs text-[#6B7280]">
                      Configure caretakers and agents who receive tenant viewing links and WhatsApp alerts.
                    </p>
                  </div>

                  {properties.length > 1 && (
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-medium text-[#4B5563]">Property:</label>
                      <select
                        value={selectedPropertyId || (properties[0]?.id ?? '')}
                        onChange={(e) => setSelectedPropertyId(Number(e.target.value))}
                        className="px-3.5 py-2 text-xs bg-white border border-[#D1D5DB] rounded-xl outline-none focus:border-primary font-medium"
                      >
                        {properties.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.lodgeDesc}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {(() => {
                  const activePropId = selectedPropertyId || properties[0]?.id;
                  const activeProp = properties.find((p) => p.id === activePropId) || properties[0];
                  if (!activeProp) return null;
                  return (
                    <AgentSetupSection
                      propertyId={activeProp.id}
                      propertyTitle={activeProp.lodgeDesc}
                      landlordPhone={activeProp.landlord?.phone}
                      landlordName={activeProp.landlord?.name}
                    />
                  );
                })()}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Mobile navigation */}
      <MobileNavigationTab currentTab={"home"} />
    </div>
  )
}

export default LandlordDashboard