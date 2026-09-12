import { useState, useEffect, useMemo } from 'react'
import Sidebar from './components/layout/Sidebar/Sidebar'
import Header from './components/layout/Dashboard/Header'
import CurrentLodgeCard from './components/layout/Dashboard/CurrentLodgeCard'
import AllApartments from './components/layout/Dashboard/AllApartments'
import MobileNavigationTab from './components/layout/MobileNavigation/MobileNavigationTab'
import PropertyFilterBar from '../../components/search/PropertyFilterBar'
import { getProperties, getNearbyProperties, searchPropertiesApi } from '../../utils/propertiesApi'
import { mapProperties, calculateDistanceKm } from '../../utils/mapProperty'
import { normalizeSearchText, detectBedrooms } from '../../utils/searchHelpers'
import useSavedPropertyIds from '../../hooks/useSavedPropertyIds'
import { hyveError, hyveSuccess } from '../../utils/hyveToast'
import { IoNavigateOutline } from 'react-icons/io5'

const TenantDashboard = () => {
    const [allLodges, setAllLodges] = useState([]);
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

    // Search and filter criteria states
    const [query, setQuery] = useState("");
    const [selectedType, setSelectedType] = useState("");
    const [selectedBedrooms, setSelectedBedrooms] = useState("");
    const [selectedArea, setSelectedArea] = useState("");
    const [maxBudget, setMaxBudget] = useState("");
    const [sort, setSort] = useState("");

    const { savedIds, applyOptimisticChange } = useSavedPropertyIds();

    const fetchAllProperties = () => {
        setIsLoading(true);
        getProperties({ page: 0, size: 100 })
            .then((data) => {
                setAllLodges(mapProperties(data.content));
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
            setAllLodges(mapped);
            setIsGpsMode(true);
            setSort("nearby");
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
        setSort("");
        fetchAllProperties();
    };

    const handleSortChange = (newSort) => {
        if (newSort === "nearby") {
            if (!userCoords) {
                handleActivateGps();
                return;
            }
        }
        setSort(newSort);
    };

    const clearAllFilters = () => {
        setQuery("");
        setSelectedType("");
        setSelectedBedrooms("");
        setSelectedArea("");
        setMaxBudget("");
        setSort("");
        if (isGpsMode) {
            setIsGpsMode(false);
            fetchAllProperties();
        }
    };

    const hasActiveFilters = Boolean(
        query.trim() || selectedType || selectedBedrooms || selectedArea || maxBudget || sort || isGpsMode
    );

    // Multi-criteria client-side filtering & sorting
    const filteredResults = useMemo(() => {
        let list = allLodges;

        // 1. Text Query (Checks title, description, propertyType, location, amenities with normalization)
        if (query.trim()) {
            const normalizedQ = normalizeSearchText(query);
            const queryTokens = normalizedQ.split(" ").filter(Boolean);

            list = list.filter((lodge) => {
                const combinedCorpus = normalizeSearchText(
                    `${lodge.lodgeDesc || ""} ${lodge.description || ""} ${lodge.propertyType || ""} ${lodge.nearbyDistance || ""} ${lodge.amenities || ""}`
                );
                return queryTokens.every((token) => combinedCorpus.includes(token));
            });
        }

        // 2. Property Type
        if (selectedType) {
            list = list.filter((lodge) => {
                const typeVal = (lodge.propertyType || "").toUpperCase();
                if (selectedType === "STUDIO") {
                    const desc = normalizeSearchText(`${lodge.lodgeDesc || ""} ${lodge.description || ""}`);
                    return typeVal === "STUDIO" || desc.includes("studio") || desc.includes("self contain");
                }
                if (selectedType === "APARTMENT") {
                    return typeVal === "APARTMENT" || !typeVal;
                }
                return typeVal === selectedType;
            });
        }

        // 3. Bedrooms
        if (selectedBedrooms) {
            const reqBeds = Number(selectedBedrooms);
            list = list.filter((lodge) => {
                const beds = detectBedrooms(lodge);
                if (beds == null) return true;
                if (selectedBedrooms === "3") return beds >= 3;
                return beds === reqBeds;
            });
        }

        // 4. Area / Community
        if (selectedArea) {
            const targetArea = selectedArea.toLowerCase();
            list = list.filter((lodge) => {
                const loc = (lodge.nearbyDistance || "").toLowerCase();
                const title = (lodge.lodgeDesc || "").toLowerCase();
                const desc = (lodge.description || "").toLowerCase();
                return loc.includes(targetArea) || title.includes(targetArea) || desc.includes(targetArea);
            });
        }

        // 5. Max Budget
        if (maxBudget) {
            const maxVal = Number(maxBudget);
            list = list.filter((lodge) => {
                const price = Number(lodge.price || 0);
                return price <= maxVal;
            });
        }

        // 6. Sorting
        if (sort === "nearby" && userCoords) {
            list = list.map((lodge) => {
                const dist =
                    lodge.latitude && lodge.longitude
                        ? calculateDistanceKm(userCoords.lat, userCoords.lng, lodge.latitude, lodge.longitude)
                        : lodge.distanceKm != null
                        ? lodge.distanceKm
                        : null;
                return { ...lodge, distanceKm: dist };
            });

            list = [...list].sort((a, b) => {
                if (a.distanceKm != null && b.distanceKm != null) return a.distanceKm - b.distanceKm;
                if (a.distanceKm != null) return -1;
                if (b.distanceKm != null) return 1;
                return 0;
            });
        } else {
            switch (sort) {
                case "lowest":
                    list = [...list].sort((a, b) => a.price - b.price);
                    break;
                case "highest":
                    list = [...list].sort((a, b) => b.price - a.price);
                    break;
                case "newest":
                    list = [...list].sort((a, b) => b.id - a.id);
                    break;
                case "oldest":
                    list = [...list].sort((a, b) => a.id - b.id);
                    break;
                default:
                    break;
            }
        }

        return list;
    }, [allLodges, query, selectedType, selectedBedrooms, selectedArea, maxBudget, sort, userCoords]);

    return (
        <div className='page-wrapper'>
            <div className='flex'>
                {/* dashboard sidebar*/}
                <Sidebar currentPage={"home"}/>

                {/* dashboard content area */}
                <main className='w-full h-[100svh] sm:w-[70%] lg:w-[80%] overflow-auto'>
                    {/* dashboard header */}
                    <Header searchValue={query} onSearchChange={setQuery} />

                    <div className='px-3 mt-6 pb-28 sm:pb-16 sm:px-6 lg:px-8 lg:mt-6'>
                        {/* Current Lodge component: Only visible if user has a current lodge status*/}
                        <CurrentLodgeCard />

                        {/* GPS Proximity Recommendations Banner */}
                        <div className="my-5 p-4 rounded-2xl bg-gradient-to-r from-primary/10 via-[#FFF9F5] to-primary/5 border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                            <div className="flex items-center gap-3.5">
                                <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-sm shadow-primary/20">
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

                        {/* Search & Filter Bar (Desktop & Mobile) */}
                        <PropertyFilterBar
                            query={query}
                            onQueryChange={setQuery}
                            selectedType={selectedType}
                            onTypeChange={setSelectedType}
                            selectedBedrooms={selectedBedrooms}
                            onBedroomsChange={setSelectedBedrooms}
                            selectedArea={selectedArea}
                            onAreaChange={setSelectedArea}
                            maxBudget={maxBudget}
                            onBudgetChange={setMaxBudget}
                            sort={sort}
                            onSortChange={handleSortChange}
                            totalCount={filteredResults.length}
                            isLoading={isLoading}
                            onClearAll={clearAllFilters}
                            hasActiveFilters={hasActiveFilters}
                        />

                        {/* Available Lodges */}
                        {isLoading ? (
                            <p className='py-12 text-sm text-center text-[#AAAAAA]'>Loading listings...</p>
                        ) : filteredResults.length > 0 ? (
                            <AllApartments
                                lodges={filteredResults}
                                savedIds={savedIds}
                                onSavedChange={applyOptimisticChange}
                                emptyMessage={isGpsMode ? "No verified apartments found within your immediate radius." : "No listings match your search criteria."}
                            />
                        ) : (
                            <div className='py-14 px-4 text-center bg-white border border-dashed border-[#D1D5DB] rounded-2xl max-w-lg mx-auto my-6'>
                                <div className='w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3 text-2xl'>
                                    🔍
                                </div>
                                <h3 className='text-base font-semibold text-gray-800 mb-1'>No listings match your criteria</h3>
                                <p className='text-xs text-gray-500 mb-4'>
                                    Try broadening your filters, checking different communities, or clearing active filters.
                                </p>
                                <button
                                    type='button'
                                    onClick={clearAllFilters}
                                    className='px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl smooth-transition'
                                >
                                    Clear All Filters
                                </button>
                            </div>
                        )}
                    </div>
                </main>
            </div>
            
            {/* Mobile navigation */}
            <MobileNavigationTab currentTab={"home"}/>
        </div>
    )
}

export default TenantDashboard
