
import { useState, useEffect } from 'react'
import Sidebar from './components/layout/Sidebar/Sidebar'
import Header from './components/layout/Dashboard/Header'
import CurrentLodgeCard from './components/layout/Dashboard/CurrentLodgeCard'
import AllApartments from './components/layout/Dashboard/AllApartments'
import MobileNavigationTab from './components/layout/MobileNavigation/MobileNavigationTab'
import { getProperties, getNearbyProperties } from '../../utils/propertiesApi'
import { mapProperties } from '../../utils/mapProperty'
import useSavedPropertyIds from '../../hooks/useSavedPropertyIds'
import { hyveError, hyveSuccess } from '../../utils/hyveToast'
import { IoNavigateOutline } from 'react-icons/io5'

const TenantDashboard = () => {
    const [lodges, setLodges] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLocatingGps, setIsLocatingGps] = useState(false);
    const [isGpsMode, setIsGpsMode] = useState(false);
    const [userCoords, setUserCoords] = useState(() => {
        try {
            const saved = sessionStorage.getItem("hyve_user_coords");
            return saved ? JSON.parse(saved) : null;
        } catch {
            return null;
        }
    });
    const { savedIds, applyOptimisticChange } = useSavedPropertyIds();

    const fetchAllProperties = () => {
        setIsLoading(true);
        getProperties({ page: 0, size: 20 })
            .then((data) => {
                setLodges(mapProperties(data.content));
                setIsGpsMode(false);
            })
            .catch((err) => {
                console.error("Failed to load properties:", err);
                hyveError("Couldn't load listings", "Please refresh and try again.");
            })
            .finally(() => setIsLoading(false));
    };

    useEffect(() => {
        fetchAllProperties();
    }, []);

    const fetchNearby = async (lat, lng) => {
        setIsLoading(true);
        try {
            const nearbyItems = await getNearbyProperties({ lat, lng, radiusKm: 50 });
            const mapped = mapProperties(nearbyItems);
            setLodges(mapped);
            setIsGpsMode(true);
            hyveSuccess("Nearby Lodges Found!", `Showing ${mapped.length} verified apartments near your location.`);
        } catch (err) {
            console.error("Failed to load nearby properties:", err);
            hyveError("Location Search Failed", err.message || "Could not load nearby apartments.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleActivateGps = () => {
        if (!navigator.geolocation) {
            hyveError("GPS Not Supported", "Your browser does not support geolocation.");
            return;
        }

        if (userCoords) {
            fetchNearby(userCoords.lat, userCoords.lng);
            return;
        }

        setIsLocatingGps(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const coords = {
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                };
                setUserCoords(coords);
                try {
                    sessionStorage.setItem("hyve_user_coords", JSON.stringify(coords));
                } catch {
                    // Ignore storage errors
                }
                setIsLocatingGps(false);
                fetchNearby(coords.lat, coords.lng);
            },
            (err) => {
                setIsLocatingGps(false);
                hyveError("Location Denied", err.message || "Could not retrieve your phone location.");
            },
            { enableHighAccuracy: true, timeout: 8000 }
        );
    };

    const handleClearGps = () => {
        fetchAllProperties();
    };

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

                            {/* GPS Proximity Recommendations Banner */}
                            <div className="my-6 p-4.5 rounded-2xl bg-gradient-to-r from-primary/10 via-[#FFF9F5] to-primary/5 border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                                <div className="flex items-center gap-3.5">
                                    <div className="w-11 h-11 rounded-2xl bg-primary text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-sm shadow-primary/20">
                                        <IoNavigateOutline className={isLocatingGps ? "animate-spin" : ""} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-sm sm:text-base font-bold text-[#1F2937]">
                                                {isGpsMode ? "Lodges Near Your Phone Location" : "Apartment Recommendations Near You"}
                                            </h3>
                                            {isGpsMode && (
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
                                                    GPS Active
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-[#6B7280] mt-0.5">
                                            {isGpsMode
                                                ? "Showing verified apartments closest to your GPS coordinates first."
                                                : "Discover verified community lodges closest to your current location using device GPS."}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                                    {isGpsMode ? (
                                        <button
                                            type="button"
                                            onClick={handleClearGps}
                                            className="px-4 py-2 rounded-xl text-xs font-semibold text-[#4B5563] bg-white hover:bg-gray-50 border border-[#D1D5DB] smooth-transition cursor-pointer shadow-xs"
                                        >
                                            Reset / Show All
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={handleActivateGps}
                                            disabled={isLocatingGps}
                                            className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-hover active:scale-95 smooth-transition shadow-sm shadow-primary/20 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                                        >
                                            <IoNavigateOutline className={`text-sm ${isLocatingGps ? "animate-spin" : ""}`} />
                                            <span>{isLocatingGps ? "Locating..." : "Recommend Near Me"}</span>
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Available Lodges */}
                            {isLoading ? (
                                <p className='py-12 text-sm text-center text-[#AAAAAA]'>Loading listings...</p>
                            ) : (
                                <AllApartments
                                    lodges={lodges}
                                    savedIds={savedIds}
                                    onSavedChange={applyOptimisticChange}
                                    emptyMessage={isGpsMode ? "No verified apartments found within your immediate radius." : "No listings available right now."}
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
