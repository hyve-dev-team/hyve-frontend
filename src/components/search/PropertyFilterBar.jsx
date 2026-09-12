import React from 'react';
import { RiSearch2Line, RiCloseLine } from 'react-icons/ri';
import { BiFilterAlt } from 'react-icons/bi';
import { 
    PROPERTY_TYPES, 
    BEDROOM_OPTIONS, 
    COMMUNITY_OPTIONS, 
    BUDGET_OPTIONS, 
    SORT_OPTIONS 
} from '../../utils/searchHelpers';

const QUICK_FILTERS = [
    { label: "All", type: "all" },
    { label: "Studio", type: "propertyType", value: "STUDIO" },
    { label: "1 Bed", type: "bedrooms", value: "1" },
    { label: "2 Beds", type: "bedrooms", value: "2" },
    { label: "3+ Beds", type: "bedrooms", value: "3" },
    { label: "Under ₦350k", type: "maxBudget", value: "350000" },
    { label: "Under ₦600k", type: "maxBudget", value: "600000" },
    { label: "Akoka", type: "location", value: "Akoka" },
    { label: "Yaba", type: "location", value: "Yaba" },
];

const PropertyFilterBar = ({
    query = "",
    onQueryChange,
    selectedType = "",
    onTypeChange,
    selectedBedrooms = "",
    onBedroomsChange,
    selectedArea = "",
    onAreaChange,
    maxBudget = "",
    onBudgetChange,
    sort = "",
    onSortChange,
    totalCount = 0,
    isLoading = false,
    onClearAll,
    hasActiveFilters = false,
}) => {
    const handleQuickFilter = (qf) => {
        if (qf.type === "all") {
            onClearAll?.();
            return;
        }
        if (qf.type === "propertyType") {
            onTypeChange?.(selectedType === qf.value ? "" : qf.value);
        } else if (qf.type === "bedrooms") {
            onBedroomsChange?.(selectedBedrooms === qf.value ? "" : qf.value);
        } else if (qf.type === "maxBudget") {
            onBudgetChange?.(maxBudget === qf.value ? "" : qf.value);
        } else if (qf.type === "location") {
            onAreaChange?.(selectedArea === qf.value ? "" : qf.value);
        }
    };

    return (
        <div className="w-full mb-6">
            {/* Main Search Input */}
            <div className="relative mb-3">
                <div className="group flex items-center bg-white border border-[#D1D5DB] focus-within:border-primary focus-within:ring-3 focus-within:ring-primary/10 rounded-2xl px-4 py-2.5 shadow-xs transition-all">
                    <RiSearch2Line className="text-gray-400 group-focus-within:text-primary text-lg mr-3 transition-colors shrink-0" />
                    <input
                        type="search"
                        value={query}
                        onChange={(e) => onQueryChange?.(e.target.value)}
                        placeholder="Search by community, 2 bedroom, studio, street, amenities..."
                        className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 font-medium"
                    />
                    {query && (
                        <button
                            type="button"
                            onClick={() => onQueryChange?.("")}
                            className="p-1 text-gray-400 hover:text-gray-700 transition-colors shrink-0"
                            title="Clear search"
                        >
                            <RiCloseLine className="text-lg" />
                        </button>
                    )}
                </div>
            </div>

            {/* Quick Filter Horizontal Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none mb-3">
                {QUICK_FILTERS.map((qf, idx) => {
                    let isActive = false;
                    if (qf.type === "all") {
                        isActive = !hasActiveFilters;
                    } else if (qf.type === "propertyType") {
                        isActive = selectedType === qf.value;
                    } else if (qf.type === "bedrooms") {
                        isActive = selectedBedrooms === qf.value;
                    } else if (qf.type === "maxBudget") {
                        isActive = maxBudget === qf.value;
                    } else if (qf.type === "location") {
                        isActive = selectedArea === qf.value;
                    }

                    return (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => handleQuickFilter(qf)}
                            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                                isActive
                                    ? "bg-primary text-white shadow-xs scale-102"
                                    : "bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                            }`}
                        >
                            {qf.label}
                        </button>
                    );
                })}
            </div>

            {/* Structured Criteria Dropdowns Container */}
            <div className="bg-white border border-gray-200 rounded-2xl p-3.5 sm:p-4 shadow-xs">
                <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-gray-800">
                        <BiFilterAlt className="text-primary text-base" />
                        <span>Filter By Criteria</span>
                    </div>

                    {hasActiveFilters && (
                        <button
                            type="button"
                            onClick={onClearAll}
                            className="text-xs font-semibold text-primary hover:text-primary-hover hover:underline transition-all"
                        >
                            Clear All Filters
                        </button>
                    )}
                </div>

                {/* Dropdowns Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
                    {/* Property Type */}
                    <div>
                        <label className="block text-[11px] font-medium text-gray-500 mb-1">
                            Apartment Type
                        </label>
                        <select
                            value={selectedType}
                            onChange={(e) => onTypeChange?.(e.target.value)}
                            className="w-full bg-[#F9FAFB] hover:bg-white focus:bg-white border border-gray-200 focus:border-primary rounded-xl text-xs py-2 px-2.5 outline-none font-medium text-gray-800 transition-colors cursor-pointer"
                        >
                            {PROPERTY_TYPES.map((t) => (
                                <option key={t.value || "all"} value={t.value}>
                                    {t.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Bedrooms */}
                    <div>
                        <label className="block text-[11px] font-medium text-gray-500 mb-1">
                            Bedrooms
                        </label>
                        <select
                            value={selectedBedrooms}
                            onChange={(e) => onBedroomsChange?.(e.target.value)}
                            className="w-full bg-[#F9FAFB] hover:bg-white focus:bg-white border border-gray-200 focus:border-primary rounded-xl text-xs py-2 px-2.5 outline-none font-medium text-gray-800 transition-colors cursor-pointer"
                        >
                            {BEDROOM_OPTIONS.map((b) => (
                                <option key={b.value || "all"} value={b.value}>
                                    {b.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Community */}
                    <div>
                        <label className="block text-[11px] font-medium text-gray-500 mb-1">
                            Community
                        </label>
                        <select
                            value={selectedArea}
                            onChange={(e) => onAreaChange?.(e.target.value)}
                            className="w-full bg-[#F9FAFB] hover:bg-white focus:bg-white border border-gray-200 focus:border-primary rounded-xl text-xs py-2 px-2.5 outline-none font-medium text-gray-800 transition-colors cursor-pointer"
                        >
                            {COMMUNITY_OPTIONS.map((c) => (
                                <option key={c.value || "all"} value={c.value}>
                                    {c.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Max Budget */}
                    <div>
                        <label className="block text-[11px] font-medium text-gray-500 mb-1">
                            Max Monthly Budget
                        </label>
                        <select
                            value={maxBudget}
                            onChange={(e) => onBudgetChange?.(e.target.value)}
                            className="w-full bg-[#F9FAFB] hover:bg-white focus:bg-white border border-gray-200 focus:border-primary rounded-xl text-xs py-2 px-2.5 outline-none font-medium text-gray-800 transition-colors cursor-pointer"
                        >
                            {BUDGET_OPTIONS.map((bg) => (
                                <option key={bg.value || "all"} value={bg.value}>
                                    {bg.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Sorting */}
                    <div className="col-span-2 sm:col-span-1">
                        <label className="block text-[11px] font-medium text-gray-500 mb-1">
                            Sort By
                        </label>
                        <select
                            value={sort}
                            onChange={(e) => onSortChange?.(e.target.value)}
                            className="w-full bg-[#F9FAFB] hover:bg-white focus:bg-white border border-gray-200 focus:border-primary rounded-xl text-xs py-2 px-2.5 outline-none font-semibold text-gray-800 transition-colors cursor-pointer"
                        >
                            {Object.entries(SORT_OPTIONS).map(([val, label]) => (
                                <option key={val || "default"} value={val}>
                                    {label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Active Filter Tags Pill Row */}
                {hasActiveFilters && (
                    <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-gray-100">
                        <span className="text-[10px] uppercase font-bold text-gray-400 mr-1">
                            Active:
                        </span>
                        {query && (
                            <span className="inline-flex items-center gap-1 text-[11px] bg-primary/10 text-primary font-semibold px-2.5 py-0.5 rounded-full border border-primary/20">
                                "{query}"
                                <button onClick={() => onQueryChange?.("")} className="hover:text-black">
                                    ✕
                                </button>
                            </span>
                        )}
                        {selectedType && (
                            <span className="inline-flex items-center gap-1 text-[11px] bg-gray-100 text-gray-800 font-medium px-2.5 py-0.5 rounded-full border border-gray-200">
                                Type: {PROPERTY_TYPES.find((t) => t.value === selectedType)?.label}
                                <button onClick={() => onTypeChange?.("")} className="hover:text-black">
                                    ✕
                                </button>
                            </span>
                        )}
                        {selectedBedrooms && (
                            <span className="inline-flex items-center gap-1 text-[11px] bg-gray-100 text-gray-800 font-medium px-2.5 py-0.5 rounded-full border border-gray-200">
                                {selectedBedrooms === "3" ? "3+ Beds" : `${selectedBedrooms} Bed`}
                                <button onClick={() => onBedroomsChange?.("")} className="hover:text-black">
                                    ✕
                                </button>
                            </span>
                        )}
                        {selectedArea && (
                            <span className="inline-flex items-center gap-1 text-[11px] bg-gray-100 text-gray-800 font-medium px-2.5 py-0.5 rounded-full border border-gray-200">
                                📍 {selectedArea}
                                <button onClick={() => onAreaChange?.("")} className="hover:text-black">
                                    ✕
                                </button>
                            </span>
                        )}
                        {maxBudget && (
                            <span className="inline-flex items-center gap-1 text-[11px] bg-gray-100 text-gray-800 font-medium px-2.5 py-0.5 rounded-full border border-gray-200">
                                ≤ ₦{Number(maxBudget).toLocaleString()}
                                <button onClick={() => onBudgetChange?.("")} className="hover:text-black">
                                    ✕
                                </button>
                            </span>
                        )}
                        {sort && (
                            <span className="inline-flex items-center gap-1 text-[11px] bg-primary/10 text-primary font-semibold px-2.5 py-0.5 rounded-full border border-primary/20">
                                {SORT_OPTIONS[sort]}
                                <button onClick={() => onSortChange?.("")} className="hover:text-black">
                                    ✕
                                </button>
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Results Header Count */}
            <div className="flex items-center justify-between mt-4">
                <p className="text-xs sm:text-sm font-semibold text-gray-800 font-poppins">
                    {isLoading
                        ? "Searching listings..."
                        : `${totalCount} verified ${totalCount === 1 ? "apartment" : "apartments"} available`}
                </p>
                {hasActiveFilters && !isLoading && (
                    <span className="text-[11px] text-gray-500 font-medium">matching selected criteria</span>
                )}
            </div>
        </div>
    );
};

export default PropertyFilterBar;
