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
import { RiSearch2Line, RiCloseLine } from 'react-icons/ri'
import { BiFilterAlt } from 'react-icons/bi'
import { HiOutlineHome, HiOutlineLocationMarker } from 'react-icons/hi'
import { IoBedOutline } from 'react-icons/io5'

const SORT_OPTIONS = {
    "": "Default Sorting",
    nearby: "📍 Nearest to me (GPS)",
    lowest: "Lowest price",
    highest: "Highest price",
    newest: "Newest listings",
    oldest: "Oldest listings",
}

const PROPERTY_TYPES = [
    { value: "", label: "All Types" },
    { value: "STUDIO", label: "Studio / Self-Contain" },
    { value: "APARTMENT", label: "Flat / Apartment" },
    { value: "ROOM", label: "Single Room" },
    { value: "HOUSE", label: "Entire House" },
]

const BEDROOM_OPTIONS = [
    { value: "", label: "Any Bedrooms" },
    { value: "1", label: "1 Bedroom" },
    { value: "2", label: "2 Bedrooms" },
    { value: "3", label: "3+ Bedrooms" },
]

const COMMUNITY_OPTIONS = [
    { value: "", label: "All Communities" },
    { value: "Akoka", label: "Akoka" },
    { value: "Yaba", label: "Yaba" },
    { value: "Surulere", label: "Surulere" },
    { value: "Bariga", label: "Bariga" },
    { value: "Gbagada", label: "Gbagada" },
    { value: "Ikeja", label: "Ikeja" },
    { value: "Lekki", label: "Lekki" },
    { value: "Victoria Island", label: "Victoria Island" },
]

const BUDGET_OPTIONS = [
    { value: "", label: "Any Budget" },
    { value: "250000", label: "Up to ₦250,000" },
    { value: "400000", label: "Up to ₦400,000" },
    { value: "600000", label: "Up to ₦600,000" },
    { value: "1000000", label: "Up to ₦1,000,000" },
    { value: "1500000", label: "Up to ₦1,500,000" },
]

/**
 * Normalizes text so that word numbers, hyphenated terms, and synonyms match.
 * e.g., "two bedroom" -> "2 bedroom", "self-con" -> "self-contain", "beds" -> "bedroom"
 */
function normalizeSearchText(text) {
    if (!text) return "";
    return text
        .toLowerCase()
        .replace(/\btwo\b/g, "2")
        .replace(/\bthree\b/g, "3")
        .replace(/\bfour\b/g, "4")
        .replace(/\bone\b/g, "1")
        .replace(/\bself-con\b/g, "self-contain")
        .replace(/\bself con\b/g, "self-contain")
        .replace(/\bselfcon\b/g, "self-contain")
        .replace(/\bbeds\b/g, "bedroom")
        .replace(/\bbed\b/g, "bedroom")
        .replace(/[-_]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

/**
 * Detects the number of bedrooms from property title, description, and type.
 */
function detectBedrooms(lodge) {
    if (!lodge) return null;
    const text = normalizeSearchText(
        `${lodge.lodgeDesc || ""} ${lodge.description || ""} ${lodge.propertyType || ""}`
    );

    if (
        lodge.propertyType === "STUDIO" ||
        text.includes("studio") ||
        text.includes("self contain")
    ) {
        return 1;
    }
    if (text.includes("3 bedroom") || text.includes("3 bedroom") || text.includes("4 bedroom")) {
        return 3;
    }
    if (text.includes("2 bedroom")) {
        return 2;
    }
    if (text.includes("1 bedroom") || text.includes("single room") || text.includes("1 room")) {
        return 1;
    }
    return null;
}

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
                    <Header />

                    <div className='px-3 mt-6 pb-28 sm:pb-16 sm:px-6 lg:px-8 lg:mt-8'>
                        {/* Search Input on Mobile & Tablet */}
                        <div className='w-full mb-4 sm:mb-6'>
                            <div className='group flex items-center border border-[#D1D5DB] focus-within:border-primary rounded-full overflow-hidden px-4 py-1.5 shadow-xs bg-white transition-all'>
                                <span className='mr-3 text-[#9CA3AF] group-focus-within:text-primary transition-colors'>
                                    <RiSearch2Line className='text-lg' />
                                </span>

                                <input
                                    type='search'
                                    name='search-properties'
                                    id='search-properties'
                                    value={query}
                                    onChange={(e) => handleQueryChange(e.target.value)}
                                    className='outline-none w-full text-black py-1.5 text-sm placeholder:font-light placeholder:text-[#9CA3AF]'
                                    placeholder='Search by location, "two bedroom", "studio", amenities...'
                                />

                                {query && (
                                    <button
                                        type='button'
                                        onClick={() => handleQueryChange("")}
                                        className='text-[#9CA3AF] hover:text-black p-1 transition-colors'
                                        title='Clear search'
                                    >
                                        <RiCloseLine className='text-lg' />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Criteria-Based Filter Bar */}
                        <div className='bg-[#FBFBFC] border border-[#E5E7EB] rounded-2xl p-3.5 sm:p-4 mb-6 shadow-xs'>
                            <div className='flex items-center justify-between gap-2 mb-3'>
                                <div className='flex items-center gap-2'>
                                    <BiFilterAlt className='text-primary text-base' />
                                    <span className='text-xs sm:text-sm font-semibold text-[#374151]'>
                                        Filter By Criteria
                                    </span>
                                </div>

                                {hasActiveFilters && (
                                    <button
                                        type='button'
                                        onClick={clearAllFilters}
                                        className='text-xs font-medium text-primary hover:text-primary-hover hover:underline transition-all'
                                    >
                                        Clear All Filters
                                    </button>
                                )}
                            </div>

                            {/* Criteria Controls Grid */}
                            <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3'>
                                {/* Type Selector */}
                                <div>
                                    <label className='block text-[11px] font-medium text-[#6B7280] mb-1'>
                                        Apartment Type
                                    </label>
                                    <div className='relative'>
                                        <select
                                            value={selectedType}
                                            onChange={(e) => setSelectedType(e.target.value)}
                                            className='w-full bg-white border border-[#D1D5DB] rounded-xl text-xs py-2 px-2.5 outline-none focus:border-primary text-[#1F2937] cursor-pointer'
                                        >
                                            {PROPERTY_TYPES.map((t) => (
                                                <option key={t.value || "all"} value={t.value}>
                                                    {t.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Bedrooms Selector */}
                                <div>
                                    <label className='block text-[11px] font-medium text-[#6B7280] mb-1'>
                                        Bedrooms
                                    </label>
                                    <div className='relative'>
                                        <select
                                            value={selectedBedrooms}
                                            onChange={(e) => setSelectedBedrooms(e.target.value)}
                                            className='w-full bg-white border border-[#D1D5DB] rounded-xl text-xs py-2 px-2.5 outline-none focus:border-primary text-[#1F2937] cursor-pointer'
                                        >
                                            {BEDROOM_OPTIONS.map((b) => (
                                                <option key={b.value || "all"} value={b.value}>
                                                    {b.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Community / Area */}
                                <div>
                                    <label className='block text-[11px] font-medium text-[#6B7280] mb-1'>
                                        Community
                                    </label>
                                    <div className='relative'>
                                        <select
                                            value={selectedArea}
                                            onChange={(e) => setSelectedArea(e.target.value)}
                                            className='w-full bg-white border border-[#D1D5DB] rounded-xl text-xs py-2 px-2.5 outline-none focus:border-primary text-[#1F2937] cursor-pointer'
                                        >
                                            {COMMUNITY_OPTIONS.map((c) => (
                                                <option key={c.value || "all"} value={c.value}>
                                                    {c.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Max Budget */}
                                <div>
                                    <label className='block text-[11px] font-medium text-[#6B7280] mb-1'>
                                        Max Monthly Budget
                                    </label>
                                    <div className='relative'>
                                        <select
                                            value={maxBudget}
                                            onChange={(e) => setMaxBudget(e.target.value)}
                                            className='w-full bg-white border border-[#D1D5DB] rounded-xl text-xs py-2 px-2.5 outline-none focus:border-primary text-[#1F2937] cursor-pointer'
                                        >
                                            {BUDGET_OPTIONS.map((bg) => (
                                                <option key={bg.value || "all"} value={bg.value}>
                                                    {bg.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Sort Order */}
                                <div className='col-span-2 sm:col-span-1'>
                                    <label className='block text-[11px] font-medium text-[#6B7280] mb-1'>
                                        Sort By
                                    </label>
                                    <div className='relative'>
                                        <select
                                            value={sort}
                                            onChange={(e) => handleSortChange(e.target.value)}
                                            className='w-full bg-white border border-[#D1D5DB] rounded-xl text-xs py-2 px-2.5 outline-none focus:border-primary text-[#1F2937] cursor-pointer font-medium'
                                        >
                                            {Object.entries(SORT_OPTIONS).map(([value, label]) => (
                                                <option key={value || "default"} value={value}>
                                                    {label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Active Filters Pill Row */}
                            {hasActiveFilters && (
                                <div className='flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-[#E5E7EB]'>
                                    <span className='text-[10px] uppercase font-bold text-[#9CA3AF] mr-1'>
                                        Active:
                                    </span>
                                    {query && (
                                        <span className='inline-flex items-center gap-1 text-[11px] bg-white border border-primary/30 text-primary font-medium px-2 py-0.5 rounded-full'>
                                            "{query}"
                                            <button onClick={() => handleQueryChange("")} className='hover:text-black'>
                                                ✕
                                            </button>
                                        </span>
                                    )}
                                    {selectedType && (
                                        <span className='inline-flex items-center gap-1 text-[11px] bg-white border border-gray-300 text-gray-700 px-2 py-0.5 rounded-full'>
                                            Type: {PROPERTY_TYPES.find((t) => t.value === selectedType)?.label}
                                            <button onClick={() => setSelectedType("")} className='hover:text-black'>
                                                ✕
                                            </button>
                                        </span>
                                    )}
                                    {selectedBedrooms && (
                                        <span className='inline-flex items-center gap-1 text-[11px] bg-white border border-gray-300 text-gray-700 px-2 py-0.5 rounded-full'>
                                            {selectedBedrooms === "3" ? "3+ Beds" : `${selectedBedrooms} Bed`}
                                            <button onClick={() => setSelectedBedrooms("")} className='hover:text-black'>
                                                ✕
                                            </button>
                                        </span>
                                    )}
                                    {selectedArea && (
                                        <span className='inline-flex items-center gap-1 text-[11px] bg-white border border-gray-300 text-gray-700 px-2 py-0.5 rounded-full'>
                                            📍 {selectedArea}
                                            <button onClick={() => setSelectedArea("")} className='hover:text-black'>
                                                ✕
                                            </button>
                                        </span>
                                    )}
                                    {maxBudget && (
                                        <span className='inline-flex items-center gap-1 text-[11px] bg-white border border-gray-300 text-gray-700 px-2 py-0.5 rounded-full'>
                                            ≤ ₦{Number(maxBudget).toLocaleString()}
                                            <button onClick={() => setMaxBudget("")} className='hover:text-black'>
                                                ✕
                                            </button>
                                        </span>
                                    )}
                                    {sort && (
                                        <span className='inline-flex items-center gap-1 text-[11px] bg-primary/10 border border-primary/20 text-primary px-2 py-0.5 rounded-full font-medium'>
                                            {SORT_OPTIONS[sort]}
                                            <button onClick={() => setSort("")} className='hover:text-black'>
                                                ✕
                                            </button>
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Search Results Summary Header */}
                        <div className='flex items-center justify-between mb-4'>
                            <div className='flex items-center gap-2'>
                                <h4 className='text-sm font-semibold text-[#1F2937] font-poppins'>
                                    {isLoading
                                        ? "Searching listings..."
                                        : `${results.length} verified ${
                                              results.length === 1 ? "apartment" : "apartments"
                                          } found`}
                                </h4>
                                {hasActiveFilters && !isLoading && (
                                    <span className='text-xs text-[#6B7280]'>matching your criteria</span>
                                )}
                            </div>
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
