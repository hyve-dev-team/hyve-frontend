import React, { useState, useEffect } from 'react';
import { RiSearch2Line, RiCloseLine } from 'react-icons/ri';
import { BiFilterAlt } from 'react-icons/bi';
import { SlidersHorizontal, X, Check, RotateCcw } from 'lucide-react';
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
    const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

    // Prevent body scroll when mobile filter sheet is open
    useEffect(() => {
        if (isMobileDrawerOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isMobileDrawerOpen]);

    const activeCriteriaCount = [
        Boolean(selectedType),
        Boolean(selectedBedrooms),
        Boolean(selectedArea),
        Boolean(maxBudget),
        Boolean(sort),
    ].filter(Boolean).length;

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
        <div className="w-full mb-5">
            {/* Search Input + Mobile Filter Button Row */}
            <div className="flex items-center gap-2 mb-3">
                <div className="flex-1 group flex items-center bg-white border border-[#D1D5DB] focus-within:border-primary focus-within:ring-3 focus-within:ring-primary/10 rounded-2xl px-3.5 py-2.5 shadow-xs transition-all">
                    <RiSearch2Line className="text-gray-400 group-focus-within:text-primary text-lg mr-2.5 transition-colors shrink-0" />
                    <input
                        type="search"
                        value={query}
                        onChange={(e) => onQueryChange?.(e.target.value)}
                        placeholder="Search by community, bedroom, studio, street..."
                        className="w-full bg-transparent text-xs sm:text-sm text-gray-900 outline-none placeholder:text-gray-400 font-medium"
                    />
                    {query && (
                        <button
                            type="button"
                            onClick={() => onQueryChange?.("")}
                            className="p-1 text-gray-400 hover:text-gray-700 transition-colors shrink-0 cursor-pointer"
                            title="Clear search"
                        >
                            <RiCloseLine className="text-lg" />
                        </button>
                    )}
                </div>

                {/* Mobile Filter Trigger Button (Hidden on Desktop) */}
                <button
                    type="button"
                    onClick={() => setIsMobileDrawerOpen(true)}
                    className={`sm:hidden flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl border text-xs font-bold shrink-0 transition-all active:scale-95 shadow-xs cursor-pointer ${
                        activeCriteriaCount > 0
                            ? "bg-primary text-white border-primary shadow-sm shadow-primary/25"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                    aria-label="Open Filters"
                >
                    <SlidersHorizontal className="w-4 h-4" />
                    <span>Filters</span>
                    {activeCriteriaCount > 0 && (
                        <span className="w-4 h-4 rounded-full bg-white text-primary text-[10px] font-extrabold flex items-center justify-center ml-0.5">
                            {activeCriteriaCount}
                        </span>
                    )}
                </button>
            </div>

            {/* Quick Filter Horizontal Chips (Swipeable on Mobile) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none mb-2.5 -mx-1 px-1">
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
                            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer select-none ${
                                isActive
                                    ? "bg-primary text-white shadow-xs scale-102"
                                    : "bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 active:scale-98"
                            }`}
                        >
                            {qf.label}
                        </button>
                    );
                })}
            </div>

            {/* Active Filter Tags Row (Compact & Dismissible) */}
            {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-1.5 mb-3 pt-1">
                    <span className="text-[10px] uppercase font-bold text-gray-400 mr-1 shrink-0">
                        Active:
                    </span>
                    {query && (
                        <span className="inline-flex items-center gap-1 text-[11px] bg-primary/10 text-primary font-semibold px-2.5 py-0.5 rounded-full border border-primary/20">
                            "{query}"
                            <button onClick={() => onQueryChange?.("")} className="hover:text-black cursor-pointer">✕</button>
                        </span>
                    )}
                    {selectedType && (
                        <span className="inline-flex items-center gap-1 text-[11px] bg-gray-100 text-gray-800 font-medium px-2.5 py-0.5 rounded-full border border-gray-200">
                            {PROPERTY_TYPES.find((t) => t.value === selectedType)?.label || selectedType}
                            <button onClick={() => onTypeChange?.("")} className="hover:text-black cursor-pointer">✕</button>
                        </span>
                    )}
                    {selectedBedrooms && (
                        <span className="inline-flex items-center gap-1 text-[11px] bg-gray-100 text-gray-800 font-medium px-2.5 py-0.5 rounded-full border border-gray-200">
                            {selectedBedrooms === "3" ? "3+ Beds" : `${selectedBedrooms} Bed`}
                            <button onClick={() => onBedroomsChange?.("")} className="hover:text-black cursor-pointer">✕</button>
                        </span>
                    )}
                    {selectedArea && (
                        <span className="inline-flex items-center gap-1 text-[11px] bg-gray-100 text-gray-800 font-medium px-2.5 py-0.5 rounded-full border border-gray-200">
                            📍 {selectedArea}
                            <button onClick={() => onAreaChange?.("")} className="hover:text-black cursor-pointer">✕</button>
                        </span>
                    )}
                    {maxBudget && (
                        <span className="inline-flex items-center gap-1 text-[11px] bg-gray-100 text-gray-800 font-medium px-2.5 py-0.5 rounded-full border border-gray-200">
                            ≤ ₦{Number(maxBudget).toLocaleString()}
                            <button onClick={() => onBudgetChange?.("")} className="hover:text-black cursor-pointer">✕</button>
                        </span>
                    )}
                    {sort && (
                        <span className="inline-flex items-center gap-1 text-[11px] bg-primary/10 text-primary font-semibold px-2.5 py-0.5 rounded-full border border-primary/20">
                            {SORT_OPTIONS[sort] || sort}
                            <button onClick={() => onSortChange?.("")} className="hover:text-black cursor-pointer">✕</button>
                        </span>
                    )}
                    <button
                        type="button"
                        onClick={onClearAll}
                        className="text-[11px] font-bold text-primary hover:underline ml-1 cursor-pointer"
                    >
                        Reset
                    </button>
                </div>
            )}

            {/* Desktop Structured Criteria Dropdowns (Hidden on Mobile) */}
            <div className="hidden sm:block bg-white border border-gray-200 rounded-2xl p-3.5 sm:p-4 shadow-xs">
                <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-gray-800">
                        <BiFilterAlt className="text-primary text-base" />
                        <span>Filter By Criteria</span>
                    </div>

                    {hasActiveFilters && (
                        <button
                            type="button"
                            onClick={onClearAll}
                            className="text-xs font-semibold text-primary hover:text-primary-hover hover:underline transition-all cursor-pointer"
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
            </div>

            {/* Results Header Count */}
            <div className="flex items-center justify-between mt-3">
                <p className="text-xs sm:text-sm font-semibold text-gray-800 font-poppins">
                    {isLoading
                        ? "Searching listings..."
                        : `${totalCount} verified ${totalCount === 1 ? "apartment" : "apartments"} available`}
                </p>
                {hasActiveFilters && !isLoading && (
                    <span className="text-[11px] text-gray-500 font-medium">matching selected criteria</span>
                )}
            </div>

            {/* Mobile Filter Slide-Up Bottom Sheet Modal */}
            {isMobileDrawerOpen && (
                <div className="sm:hidden fixed inset-0 z-[500] flex flex-col justify-end">
                    {/* Dark Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-fadeIn"
                        onClick={() => setIsMobileDrawerOpen(false)}
                    />

                    {/* Bottom Sheet Card */}
                    <div className="relative bg-white rounded-t-3xl shadow-2xl z-10 max-h-[88vh] flex flex-col overflow-hidden animate-slideUp">
                        {/* Drag Notch Indicator */}
                        <div className="w-full pt-3 pb-1 flex justify-center">
                            <div className="w-10 h-1.5 bg-gray-200 rounded-full" />
                        </div>

                        {/* Sheet Header */}
                        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <h3 className="text-base font-bold text-gray-900 font-montserrat">
                                    Filter Apartments
                                </h3>
                                {activeCriteriaCount > 0 && (
                                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
                                        {activeCriteriaCount} active
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-3">
                                {hasActiveFilters && (
                                    <button
                                        type="button"
                                        onClick={onClearAll}
                                        className="text-xs font-semibold text-gray-500 hover:text-primary flex items-center gap-1 cursor-pointer"
                                    >
                                        <RotateCcw className="w-3.5 h-3.5" />
                                        <span>Reset</span>
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => setIsMobileDrawerOpen(false)}
                                    className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 cursor-pointer"
                                    aria-label="Close"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Sheet Scrollable Body */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-5">
                            {/* 1. Apartment Type */}
                            <div>
                                <label className="block text-xs font-bold text-gray-800 mb-2">
                                    Apartment Type
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {PROPERTY_TYPES.map((t) => {
                                        const isSelected = selectedType === t.value;
                                        return (
                                            <button
                                                key={t.value || "all"}
                                                type="button"
                                                onClick={() => onTypeChange?.(isSelected ? "" : t.value)}
                                                className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                                                    isSelected
                                                        ? "bg-primary text-white border-primary shadow-xs"
                                                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                                                }`}
                                            >
                                                {isSelected && <Check className="w-3.5 h-3.5" />}
                                                <span>{t.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* 2. Bedrooms */}
                            <div>
                                <label className="block text-xs font-bold text-gray-800 mb-2">
                                    Bedrooms
                                </label>
                                <div className="grid grid-cols-4 gap-2">
                                    {BEDROOM_OPTIONS.map((b) => {
                                        const isSelected = selectedBedrooms === b.value;
                                        return (
                                            <button
                                                key={b.value || "all"}
                                                type="button"
                                                onClick={() => onBedroomsChange?.(isSelected ? "" : b.value)}
                                                className={`py-2 rounded-xl text-xs font-semibold border text-center transition-all cursor-pointer ${
                                                    isSelected
                                                        ? "bg-primary text-white border-primary shadow-xs"
                                                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                                                }`}
                                            >
                                                {b.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* 3. Community / Area */}
                            <div>
                                <label className="block text-xs font-bold text-gray-800 mb-2">
                                    Community / Neighborhood
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {COMMUNITY_OPTIONS.map((c) => {
                                        const isSelected = selectedArea === c.value;
                                        return (
                                            <button
                                                key={c.value || "all"}
                                                type="button"
                                                onClick={() => onAreaChange?.(isSelected ? "" : c.value)}
                                                className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                                                    isSelected
                                                        ? "bg-primary text-white border-primary shadow-xs"
                                                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                                                }`}
                                            >
                                                {c.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* 4. Max Monthly Budget */}
                            <div>
                                <label className="block text-xs font-bold text-gray-800 mb-2">
                                    Max Monthly Budget
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {BUDGET_OPTIONS.map((bg) => {
                                        const isSelected = maxBudget === bg.value;
                                        return (
                                            <button
                                                key={bg.value || "all"}
                                                type="button"
                                                onClick={() => onBudgetChange?.(isSelected ? "" : bg.value)}
                                                className={`py-2.5 px-3 rounded-xl text-xs font-semibold border text-center transition-all cursor-pointer ${
                                                    isSelected
                                                        ? "bg-primary text-white border-primary shadow-xs"
                                                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                                                }`}
                                            >
                                                {bg.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* 5. Sort By */}
                            <div>
                                <label className="block text-xs font-bold text-gray-800 mb-2">
                                    Sort By
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {Object.entries(SORT_OPTIONS).map(([val, label]) => {
                                        const isSelected = sort === val;
                                        return (
                                            <button
                                                key={val || "default"}
                                                type="button"
                                                onClick={() => onSortChange?.(isSelected ? "" : val)}
                                                className={`py-2 px-3 rounded-xl text-xs font-semibold border text-center transition-all cursor-pointer ${
                                                    isSelected
                                                        ? "bg-primary text-white border-primary shadow-xs"
                                                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                                                }`}
                                            >
                                                {label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Sheet Sticky Footer */}
                        <div className="p-4 border-t border-gray-100 bg-white/95 backdrop-blur-xs flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setIsMobileDrawerOpen(false)}
                                className="w-full py-3 bg-primary hover:bg-primary-hover active:scale-[0.99] text-white rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-primary/20 transition-all cursor-pointer text-center"
                            >
                                Show {totalCount} {totalCount === 1 ? "Apartment" : "Apartments"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PropertyFilterBar;
