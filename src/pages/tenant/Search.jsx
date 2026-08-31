
import { useState, useEffect, useMemo } from 'react'
import Sidebar from './components/layout/Sidebar/Sidebar'
import Header from './components/layout/Dashboard/Header'
import AllApartments from './components/layout/Dashboard/AllApartments'
import MobileNavigationTab from './components/layout/MobileNavigation/MobileNavigationTab'
import { getProperties } from '../../utils/propertiesApi'
import { mapProperties } from '../../utils/mapProperty'
import useSavedPropertyIds from '../../hooks/useSavedPropertyIds'
import { hyveError } from '../../utils/hyveToast'
import { RiSearch2Line } from 'react-icons/ri'

const SORT_OPTIONS = {
    "": "All",
    newest: "Newest",
    oldest: "Oldest",
    lowest: "Lowest price",
    highest: "Highest price",
}

const Search = () => {
    const [allLodges, setAllLodges] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [query, setQuery] = useState("");
    const [sort, setSort] = useState("");
    const { savedIds, applyOptimisticChange } = useSavedPropertyIds();

    useEffect(() => {
        let cancelled = false;
        // Fetch a large page and filter/sort client-side — the exact Spring Data
        // sortBy string format wasn't confirmed against a live call, so this avoids
        // sending a malformed param that silently gets ignored or errors.
        getProperties({ page: 0, size: 100 })
            .then((data) => {
                if (cancelled) return;
                setAllLodges(mapProperties(data.content));
            })
            .catch((err) => {
                console.error("Failed to load properties:", err);
                hyveError("Couldn't load listings", "Please refresh and try again.");
            })
            .finally(() => !cancelled && setIsLoading(false));
        return () => { cancelled = true; };
    }, []);

    const results = useMemo(() => {
        let list = allLodges;

        if (query.trim()) {
            const q = query.trim().toLowerCase();
            list = list.filter((lodge) =>
                lodge.lodgeDesc.toLowerCase().includes(q) ||
                lodge.nearbyDistance.toLowerCase().includes(q) ||
                lodge.amenities.toLowerCase().includes(q)
            );
        }

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

        return list;
    }, [allLodges, query, sort]);

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

                        <div className='w-full sm:hidden'>
                            <div className='group flex flex-shrink items-center border border-[#AAAAAA] rounded-full overflow-hidden px-3 lg:px-5 shadow-sm'>
                                <span className='mr-3'><RiSearch2Line className='text-[#AAAAAA] text-[16px] lg:text-[20px]' /></span>

                                <input
                                    type="search"
                                    name='search-properties'
                                    id='search-properties'
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    className='outline-none w-full text-black py-2 lg:py-3 text-sm placeholder:font-light placeholder:text-[#AAAAAA]'
                                    placeholder='I am looking for...'
                                />
                            </div>
                        </div>
                        
                        <div className='flex items-center justify-between mt-8'>
                            <h4 className="text-sm font-normal rounded-lg font-poppins">{isLoading ? "Loading..." : `${results.length} ads found`}</h4>

                            <div>
                                <label htmlFor="filter" className='text-sm'>Filter:</label>
                                <select
                                    name="filter"
                                    id="filter"
                                    value={sort}
                                    onChange={(e) => setSort(e.target.value)}
                                    className='ml-2 border border-[#FFB88B] rounded-md text-xs outline-none py-1 px-2'
                                >
                                    {Object.entries(SORT_OPTIONS).map(([value, label]) => (
                                        <option key={value || "all"} value={value}>{label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Available Lodges */}
                        {!isLoading && (
                            <AllApartments
                                lodges={results}
                                savedIds={savedIds}
                                onSavedChange={applyOptimisticChange}
                                emptyMessage="No apartments match your search."
                            />
                        )}
                    </div>
                </main>
            </div>

            {/* Mobile navigation */}
            <MobileNavigationTab currentTab={"search"} />
        </div>
    )
}

export default Search
