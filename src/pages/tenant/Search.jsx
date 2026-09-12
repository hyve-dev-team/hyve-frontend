import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import Sidebar from './components/layout/Sidebar/Sidebar'
import Header from './components/layout/Dashboard/Header'
import AllApartments from './components/layout/Dashboard/AllApartments'
import MobileNavigationTab from './components/layout/MobileNavigation/MobileNavigationTab'
import { getProperties, searchPropertiesApi } from '../../utils/propertiesApi'
import { mapProperties, calculateDistanceKm } from '../../utils/mapProperty'
import useSavedPropertyIds from '../../hooks/useSavedPropertyIds'
import { hyveError, hyveSuccess } from '../../utils/hyveToast'
import PropertyFilterBar from '../../components/search/PropertyFilterBar'
import {
    normalizeSearchText,
    detectBedrooms,
    PROPERTY_TYPES,
    BEDROOM_OPTIONS,
    COMMUNITY_OPTIONS,
    BUDGET_OPTIONS,
    SORT_OPTIONS
} from '../../utils/searchHelpers'

const Search = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const urlQuery = searchParams.get("q") || "";

    const [allLodges, setAllLodges] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [query, setQuery] = useState(urlQuery);
    const [selectedType, setSelectedType] = useState("");
    const [selectedBedrooms, setSelectedBedrooms] = useState("");
    const [selectedArea, setSelectedArea] = useState("");
    const [maxBudget, setMaxBudget] = useState("");
    const [sort, setSort] = useState("");
    const [userCoords, setUserCoords] = useState(() => {
        try {
            const saved = sessionStorage.getItem("hyve_user_coords");
            return saved ? JSON.parse(saved) : null;
        } catch {
            return null;
        }
    });
    const [isLocating, setIsLocating] = useState(false);
    const { savedIds, applyOptimisticChange } = useSavedPropertyIds();

    // Sync query when URL search param changes
    useEffect(() => {
        if (urlQuery !== query) {
            setQuery(urlQuery);
        }
    }, [urlQuery]);

    useEffect(() => {
        let cancelled = false;
        setIsLoading(true);

        const apiFilters = {
            query: query.trim() || undefined,
            propertyType: selectedType || undefined,
            location: selectedArea || undefined,
            maxPrice: maxBudget ? Number(maxBudget) : undefined,
            sortBy: sort === "lowest" ? "lowestPrice" : sort === "highest" ? "highestPrice" : sort || undefined,
            page: 0,
            size: 100,
        };

        // Attempt API-level search endpoint first
        searchPropertiesApi(apiFilters)
            .then((data) => {
                if (cancelled) return;
                setAllLodges(mapProperties(data.content));
            })
            .catch(() => {
                // If API-level search fails (e.g. 404 while Railway is redeploying backend),
                // fall back to getProperties with client-side filtering
                getProperties({ page: 0, size: 100 })
                    .then((data) => {
                        if (cancelled) return;
                        setAllLodges(mapProperties(data.content));
                    })
                    .catch((err) => {
                        console.error("Failed to load properties:", err);
                        hyveError("Couldn't load listings", "Please refresh and try again.");
                    });
            })
            .finally(() => {
                if (!cancelled) setIsLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [query, selectedType, selectedArea, maxBudget, sort]);

    const requestLocationAndSort = () => {
        if (!navigator.geolocation) {
            hyveError("GPS Not Supported", "Your browser does not support geolocation.");
            return;
        }
        setIsLocating(true);
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
                setIsLocating(false);
                setSort("nearby");
                hyveSuccess("Location Detected!", "Sorting apartments nearest to you.");
            },
            (err) => {
                setIsLocating(false);
                hyveError("Location Denied", err.message || "Could not retrieve your location.");
                setSort("");
            },
            { enableHighAccuracy: true, timeout: 8000 }
        );
    };

    const handleSortChange = (newSort) => {
        if (newSort === "nearby") {
            if (!userCoords) {
                requestLocationAndSort();
                return;
            }
        }
        setSort(newSort);
    };

    const handleQueryChange = (val) => {
        setQuery(val);
        if (val.trim()) {
            setSearchParams({ q: val.trim() }, { replace: true });
        } else {
            setSearchParams({}, { replace: true });
        }
    };

    const clearAllFilters = () => {
        setQuery("");
        setSelectedType("");
        setSelectedBedrooms("");
        setSelectedArea("");
        setMaxBudget("");
        setSort("");
        setSearchParams({}, { replace: true });
    };

    const hasActiveFilters = Boolean(
        query.trim() || selectedType || selectedBedrooms || selectedArea || maxBudget || sort
    );

    const results = useMemo(() => {
        let list = allLodges;

        // 0. Only show ACTIVE (vacant) apartments — hide RENTED, INACTIVE, SOLD
        list = list.filter((lodge) => lodge.rawStatus === "ACTIVE");

        // 1. Text Query Filter (Checks full description, title, propertyType, location, and amenities with normalization)
        if (query.trim()) {
            const normalizedQ = normalizeSearchText(query);
            const queryTokens = normalizedQ.split(" ").filter(Boolean);

            list = list.filter((lodge) => {
                const combinedCorpus = normalizeSearchText(
                    `${lodge.lodgeDesc || ""} ${lodge.description || ""} ${lodge.propertyType || ""} ${lodge.nearbyDistance || ""} ${lodge.amenities || ""}`
                );

                // Check if all or any tokens match
                return queryTokens.every((token) => combinedCorpus.includes(token));
            });
        }

        // 2. Property Type Filter
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

        // 3. Bedroom Filter
        if (selectedBedrooms) {
            const reqBeds = Number(selectedBedrooms);
            list = list.filter((lodge) => {
                const beds = detectBedrooms(lodge);
                if (beds == null) return true; // If indeterminate, don't strictly exclude
                if (selectedBedrooms === "3") {
                    return beds >= 3;
                }
                return beds === reqBeds;
            });
        }

        // 4. Area / Community Filter
        if (selectedArea) {
            const targetArea = selectedArea.toLowerCase();
            list = list.filter((lodge) => {
                const loc = (lodge.nearbyDistance || "").toLowerCase();
                const title = (lodge.lodgeDesc || "").toLowerCase();
                const desc = (lodge.description || "").toLowerCase();
                return loc.includes(targetArea) || title.includes(targetArea) || desc.includes(targetArea);
            });
        }

        // 5. Max Budget Filter
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
                <Sidebar currentPage={"search"} />

                {/* dashboard content area */}
                <main className='w-full h-[100svh] sm:w-[70%] lg:w-[80%] overflow-auto'>
                    {/* dashboard header */}
                    <Header searchValue={query} onSearchChange={handleQueryChange} />

                    <div className='px-3 mt-6 pb-28 sm:pb-16 sm:px-6 lg:px-8 lg:mt-6'>
                        {/* Search & Filter Bar */}
                        <PropertyFilterBar
                            query={query}
                            onQueryChange={handleQueryChange}
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
                            totalCount={results.length}
                            isLoading={isLoading}
                            onClearAll={clearAllFilters}
                            hasActiveFilters={hasActiveFilters}
                        />

                        {/* Section Heading: Apartments in your community */}
                        <div className="flex items-center justify-between mb-4 mt-6">
                            <div>
                                <h2 className="text-lg sm:text-xl font-bold text-gray-900 font-montserrat">
                                    Apartments in your community
                                </h2>
                                <p className="text-xs sm:text-sm text-gray-500">
                                    Explore verified student and residential apartments near you
                                </p>
                            </div>
                            <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                                {results.length} {results.length === 1 ? "apartment" : "apartments"}
                            </span>
                        </div>

                        {/* Available Lodges */}
                        {isLoading ? (
                            <p className='py-12 text-sm text-center text-[#AAAAAA]'>Loading listings...</p>
                        ) : results.length > 0 ? (
                            <AllApartments
                                lodges={results}
                                savedIds={savedIds}
                                onSavedChange={applyOptimisticChange}
                                emptyMessage='No apartments match your search.'
                            />
                        ) : (
                            <div className='py-14 px-4 text-center bg-white border border-dashed border-[#D1D5DB] rounded-2xl max-w-lg mx-auto my-6'>
                                <div className='w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3 text-2xl'>
                                    🔍
                                </div>
                                <h3 className='text-base font-semibold text-gray-800 mb-1'>No listings match your search</h3>
                                <p className='text-xs text-gray-500 mb-4'>
                                    Try broadening your filters, checking different communities, or resetting your criteria.
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
            <MobileNavigationTab currentTab={"search"} />
        </div>
    );
};

export default Search;
