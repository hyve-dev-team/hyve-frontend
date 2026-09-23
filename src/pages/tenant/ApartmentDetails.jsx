"use client"
import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import defaultProfile from "../../assets/images/shared-images/user-1.png";
import useFetchApartment from "../../hooks/useFetchApartment";
import { createOrGetChatRoom } from "../../utils/chatApi";
import { saveProperty, unsaveProperty } from "../../utils/propertiesApi";
import { getPropertyQueueApi, getPropertyQueueSummaryApi, mapBackendQueue } from "../../utils/queueApi";
import useSavedPropertyIds from "../../hooks/useSavedPropertyIds";
import { hyveError, hyveSuccess } from "../../utils/hyveToast";
import Header from "./components/layout/Dashboard/Header";
import Sidebar from "./components/layout/Sidebar/Sidebar";
import MobileNavigationTab from "./components/layout/MobileNavigation/MobileNavigationTab";
import useQueueStore from "../../hooks/useQueueStore";
import JoinQueueModal from "../../components/queue/JoinQueueModal";
import UpgradeTierModal from "../../components/queue/UpgradeTierModal";

import { 
    Users, 
    ShieldCheck, 
    ArrowLeft, 
    Share2, 
    CheckCircle2, 
    ChevronLeft, 
    ChevronRight,
    Sparkles,
    Calendar,
    Ruler,
    ImageOff,
    Clock
} from "lucide-react";
import { BiErrorCircle, BiChat } from "react-icons/bi";
import { BsHeart, BsHeartFill } from "react-icons/bs";
import { IoStarSharp } from "react-icons/io5";
import { RxCaretDown, RxCaretUp } from "react-icons/rx";
import { HiOutlineHome, HiOutlineLocationMarker } from "react-icons/hi";

const ApartmentDetails = () => {
    const { apartmentID } = useParams();
    const navigate = useNavigate();

    // Redirect my-apartment or manage aliases to /user/apartment/manage
    useEffect(() => {
        if (apartmentID === "my-apartment" || apartmentID === "manage") {
            navigate("/user/apartment/manage", { replace: true });
        }
    }, [apartmentID, navigate]);

    // Fetch real apartment data from backend
    const { apartment, isLoading, error } = useFetchApartment(apartmentID);

    // Queue system hooks & state
    const { capacity, joinQueue, upgradeTier, getQueueForApartment } = useQueueStore();
    const [propertyQueue, setPropertyQueue] = useState(null);
    const [queueSummary, setQueueSummary] = useState({ totalInQueue: 0, estimatedWaitHours: 0, nextPosition: 1 });
    const [isLoadingQueue, setIsLoadingQueue] = useState(true);

    const fetchPropertyQueueStatus = async () => {
        if (!apartmentID || isNaN(Number(apartmentID))) {
            setIsLoadingQueue(false);
            return;
        }
        setIsLoadingQueue(true);
        try {
            const [data, summary] = await Promise.all([
                getPropertyQueueApi(apartmentID).catch(() => null),
                getPropertyQueueSummaryApi(apartmentID).catch(() => ({ totalInQueue: 0, estimatedWaitHours: 0, nextPosition: 1 }))
            ]);
            setPropertyQueue(data ? mapBackendQueue(data) : null);
            if (summary) setQueueSummary(summary);
        } catch {
            setPropertyQueue(null);
        } finally {
            setIsLoadingQueue(false);
        }
    };

    useEffect(() => {
        if (apartmentID && !isNaN(Number(apartmentID))) {
            fetchPropertyQueueStatus();
        }

        const handleQueueUpdate = () => {
            if (apartmentID && !isNaN(Number(apartmentID))) {
                fetchPropertyQueueStatus();
            }
        };

        window.addEventListener("hyve_queue_updated", handleQueueUpdate);
        return () => {
            window.removeEventListener("hyve_queue_updated", handleQueueUpdate);
        };
    }, [apartmentID]);

    const existingQueue = propertyQueue || getQueueForApartment(apartmentID);

    const handleJoinQueue = async (params) => {
        const res = await joinQueue(params);
        if (res?.success && res.queue) {
            setPropertyQueue(res.queue);
        }
        return res;
    };

    const [showJoinQueueModal, setShowJoinQueueModal] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    // Save/Wishlist state
    const { savedIds, applyOptimisticChange } = useSavedPropertyIds();
    const isSaved = apartment ? savedIds.has(apartment.id) : false;
    const [isSaving, setIsSaving] = useState(false);

    // Landlord Chat state
    const [isOpeningChat, setIsOpeningChat] = useState(false);

    // Gallery state
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    // Description expand state
    const [isExpanded, setIsExpanded] = useState(false);

    const handleToggleSave = async () => {
        if (!apartment?.id || isSaving) return;
        setIsSaving(true);
        const nextState = !isSaved;
        try {
            if (nextState) {
                await saveProperty(apartment.id);
                hyveSuccess("Saved to Wishlist", "Apartment added to your saved listings.");
            } else {
                await unsaveProperty(apartment.id);
            }
            applyOptimisticChange?.(apartment.id, nextState);
        } catch (err) {
            hyveError("Action Failed", err.message || "Could not update wishlist.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleChatWithLandlord = async () => {
        if (!apartment?.landlord?.id) {
            hyveError("Can't start chat", "This listing has no landlord on record.");
            return;
        }
        setIsOpeningChat(true);
        try {
            const room = await createOrGetChatRoom(apartment.landlord.id);
            navigate(`/user/conversation/${room.id}`);
        } catch (err) {
            hyveError("Couldn't open chat", err.message || "Please try again.");
        } finally {
            setIsOpeningChat(false);
        }
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: apartment?.lodgeDesc || "Hyve Haven Apartment",
                    text: `Check out this verified listing on Hyve Haven: ${apartment?.lodgeDesc}`,
                    url: window.location.href,
                });
            } catch {
                // User dismissed share dialog
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
            hyveSuccess("Link Copied!", "Apartment link copied to your clipboard.");
        }
    };

    // Prepare real image gallery (strictly genuine uploaded property photos)
    const images = (apartment?.images && apartment.images.length > 0)
        ? apartment.images.filter((img) => img && typeof img === "string" && !img.includes("apartment-image-1.png"))
        : [];
    const currentMainImage = images[selectedImageIndex] || images[0] || null;

    // Format Property Type dynamically
    const formatPropertyType = (type) => {
        if (!type) return "Apartment";
        switch (type.toUpperCase()) {
            case "STUDIO":
                return "Studio / Self-Contain";
            case "APARTMENT":
                return "Flat / Apartment";
            case "ROOM":
                return "Single Room";
            case "HOUSE":
                return "Entire House";
            default:
                return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
        }
    };

    // Real amenities array
    const realAmenities = (apartment?.amenitiesList && apartment.amenitiesList.length > 0)
        ? apartment.amenitiesList
        : (apartment?.amenities && apartment.amenities !== "No amenities listed"
            ? apartment.amenities.split(",").map(a => a.trim())
            : []);

    return (
        <div className="page-wrapper bg-[#FAFAFA] min-h-screen">
            <div className="flex">
                {/* Dashboard Sidebar */}
                <Sidebar currentPage="search" />

                {/* Dashboard Main Content */}
                <main className="w-full h-[100svh] sm:w-[70%] lg:w-[80%] overflow-auto">
                    {/* Top Header */}
                    <Header />

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
                            <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                            <p className="text-xs text-gray-500 font-medium">Loading apartment details...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
                            <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center text-3xl mb-3 shadow-xs">
                                <BiErrorCircle />
                            </div>
                            <h3 className="text-base font-bold text-gray-900 mb-1">Could not load apartment</h3>
                            <p className="text-xs text-gray-500 max-w-sm mb-6">{error}</p>
                            <Link
                                to="/user/apartment/search"
                                className="px-5 py-2.5 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary-hover smooth-transition shadow-sm shadow-primary/20"
                            >
                                Back to All Apartments
                            </Link>
                        </div>
                    ) : (
                        <div className="px-3 pt-5 pb-32 sm:pb-20 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                            {/* Navigation Bar / Breadcrumbs */}
                            <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-gray-200">
                                <button
                                    onClick={() => navigate(-1)}
                                    className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-600 hover:text-primary transition-colors cursor-pointer group"
                                >
                                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                    <span>Back to Listings</span>
                                </button>

                                <div className="flex items-center gap-2">
                                    {/* Share Button */}
                                    <button
                                        type="button"
                                        onClick={handleShare}
                                        className="p-2 sm:px-3 sm:py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-medium flex items-center gap-1.5 shadow-xs transition-colors"
                                        title="Share Listing"
                                    >
                                        <Share2 className="w-3.5 h-3.5" />
                                        <span className="hidden sm:inline">Share</span>
                                    </button>

                                    {/* Save Button */}
                                    <button
                                        type="button"
                                        onClick={handleToggleSave}
                                        disabled={isSaving}
                                        className="p-2 sm:px-3 sm:py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-medium flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-50"
                                        title={isSaved ? "Remove from wishlist" : "Save to wishlist"}
                                    >
                                        {isSaved ? (
                                            <BsHeartFill className="text-primary text-sm" />
                                        ) : (
                                            <BsHeart className="text-gray-500 text-sm" />
                                        )}
                                        <span className="hidden sm:inline">{isSaved ? "Saved" : "Save"}</span>
                                    </button>
                                </div>
                            </div>

                            {/* Property Title & Header Meta */}
                            <div className="mb-6">
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1B784D] bg-[#DDFFE7] px-2.5 py-0.5 rounded-md">
                                        <ShieldCheck className="w-3.5 h-3.5" />
                                        Verified Property
                                    </span>

                                    <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-md capitalize ${
                                        apartment.status === "open"
                                            ? "bg-[#FF630018] text-[#FF6300] border border-[#FF630030]"
                                            : "bg-gray-100 text-gray-600"
                                    }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${
                                            apartment.status === "open" ? "bg-[#FF6300] animate-pulse" : "bg-gray-400"
                                        }`}></span>
                                        {apartment.status === "open" ? "Vacant • Open to Apply" : "Occupied"}
                                    </span>

                                    {apartment.distanceKm != null && (
                                        <span className="inline-flex items-center gap-1 bg-[#EEF2FF] text-[#4F46E5] text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-[#C7D2FE]">
                                            📍 {apartment.distanceKm < 1 ? `${Math.round(apartment.distanceKm * 1000)}m away` : `${apartment.distanceKm.toFixed(1)} km away`}
                                        </span>
                                    )}
                                </div>

                                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 tracking-tight font-poppins">
                                    {apartment.lodgeDesc}
                                </h1>

                                <div className="flex flex-wrap items-center gap-4 mt-2 text-xs sm:text-sm text-gray-600">
                                    <p className="flex items-center gap-1 text-gray-600 font-medium">
                                        <HiOutlineLocationMarker className="text-primary text-base" />
                                        <span>{apartment.nearbyDistance || "Lagos, Nigeria"}</span>
                                    </p>

                                    <div className="flex items-center gap-1">
                                        <IoStarSharp className="text-[#F6D100] text-base" />
                                        <span className="font-bold text-gray-900">{apartment.starRating}</span>
                                        <Link
                                            to={`/user/apartment/review/${apartment.id}`}
                                            className="text-gray-500 hover:text-primary underline ml-0.5"
                                        >
                                            ({apartment.totalReviews} {apartment.totalReviews === 1 ? "review" : "reviews"})
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {/* Main Grid: Gallery & Details (Left) vs Sticky Booking Card (Right) */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                                {/* Left Column: Photo Gallery, Key Highlights, Description, Amenities */}
                                <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
                                    {/* High-Resolution Photo Gallery */}
                                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
                                        {/* Main Featured Photo */}
                                        {currentMainImage ? (
                                            <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full bg-gray-100 overflow-hidden group">
                                                <img
                                                    src={currentMainImage}
                                                    alt={apartment.lodgeDesc}
                                                    className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-102"
                                                    onError={(e) => { e.target.style.display = 'none'; }}
                                                />

                                                {/* Photo Counter Pill */}
                                                {images.length > 1 && (
                                                    <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg">
                                                        📷 {selectedImageIndex + 1} / {images.length}
                                                    </div>
                                                )}

                                                {/* Previous / Next Arrow Controls */}
                                                {images.length > 1 && (
                                                    <>
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                                                            className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-gray-800 flex items-center justify-center shadow-md transition-all active:scale-95 cursor-pointer"
                                                            aria-label="Previous photo"
                                                        >
                                                            <ChevronLeft className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                                                            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-gray-800 flex items-center justify-center shadow-md transition-all active:scale-95 cursor-pointer"
                                                            aria-label="Next photo"
                                                        >
                                                            <ChevronRight className="w-5 h-5" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full bg-gray-50 flex flex-col items-center justify-center text-center p-6">
                                                <ImageOff className="w-12 h-12 text-gray-300 mb-2" />
                                                <p className="text-sm font-medium text-gray-600 font-poppins">No property photos uploaded</p>
                                                <p className="text-xs text-gray-400 mt-1">Photos will appear here once uploaded by the landlord</p>
                                            </div>
                                        )}

                                        {/* Thumbnail Strip */}
                                        {images.length > 1 && (
                                            <div className="p-3 bg-gray-50 flex items-center gap-2 overflow-x-auto border-t border-gray-100">
                                                {images.map((img, idx) => (
                                                    <button
                                                        key={idx}
                                                        type="button"
                                                        onClick={() => setSelectedImageIndex(idx)}
                                                        className={`relative shrink-0 w-16 sm:w-20 aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                                                            selectedImageIndex === idx
                                                                ? "border-primary ring-2 ring-primary/20 scale-95"
                                                                : "border-transparent opacity-70 hover:opacity-100"
                                                        }`}
                                                    >
                                                        <img
                                                            src={img}
                                                            alt={`Thumbnail ${idx + 1}`}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => { e.target.style.display = 'none'; }}
                                                        />
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Key Property Highlights Card */}
                                    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
                                        <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                            <Sparkles className="w-4 h-4 text-primary" />
                                            Key Property Highlights
                                        </h3>

                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                            {/* Property Type */}
                                            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                                <p className="text-[11px] font-medium text-gray-500">Property Type</p>
                                                <p className="text-xs sm:text-sm font-bold text-gray-900 mt-0.5 capitalize">
                                                    {formatPropertyType(apartment.propertyType)}
                                                </p>
                                            </div>

                                            {/* Community Location */}
                                            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                                <p className="text-[11px] font-medium text-gray-500">Location</p>
                                                <p className="text-xs sm:text-sm font-bold text-gray-900 mt-0.5 truncate" title={apartment.nearbyDistance}>
                                                    {apartment.nearbyDistance || "Verified Community"}
                                                </p>
                                            </div>

                                            {/* Rental Cycle */}
                                            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                                <p className="text-[11px] font-medium text-gray-500">Payment Plan</p>
                                                <p className="text-xs sm:text-sm font-bold text-gray-900 mt-0.5">
                                                    {apartment.minimumRentalPeriod ? `${apartment.minimumRentalPeriod} Months Min` : "Monthly / Annual"}
                                                </p>
                                            </div>

                                            {/* Verified Status */}
                                            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                                <p className="text-[11px] font-medium text-gray-500">Inspection</p>
                                                <p className="text-xs sm:text-sm font-bold text-[#1B784D] mt-0.5">
                                                    Fair Queue
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Real Landlord Description */}
                                    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
                                        <h3 className="text-sm font-bold text-gray-900 mb-2">About this space</h3>
                                        
                                        {apartment.description ? (
                                            <div>
                                                <p className={`text-xs sm:text-sm leading-relaxed text-gray-700 whitespace-pre-wrap ${
                                                    isExpanded ? "" : "line-clamp-4"
                                                }`}>
                                                    {apartment.description}
                                                </p>

                                                {apartment.description.length > 200 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsExpanded(!isExpanded)}
                                                        className="inline-flex items-center gap-1 mt-2 text-xs font-bold text-primary hover:text-primary-hover transition-colors cursor-pointer"
                                                    >
                                                        <span>{isExpanded ? "Show less" : "Read full description"}</span>
                                                        {isExpanded ? <RxCaretUp className="text-lg" /> : <RxCaretDown className="text-lg" />}
                                                    </button>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-xs sm:text-sm text-gray-500 italic">
                                                The landlord has not provided an extended description for this apartment. All core amenities and verified specs are detailed below.
                                            </p>
                                        )}
                                    </div>

                                    {/* Real Amenities & Features */}
                                    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
                                        <h3 className="text-sm font-bold text-gray-900 mb-3">Amenities & Features</h3>

                                        {realAmenities.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {realAmenities.map((amenity, index) => (
                                                    <div
                                                        key={index}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-800"
                                                    >
                                                        <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                                                        <span>{amenity}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-xs text-gray-500">
                                                Standard verified housing features included. Inquire during inspection tour.
                                            </p>
                                        )}
                                    </div>

                                    {/* Verified Landlord Profile Card */}
                                    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-primary/20 bg-primary/10">
                                                <img
                                                    src={apartment.landlord?.profilePictureUrl || defaultProfile}
                                                    alt="Landlord"
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => { e.target.src = defaultProfile; }}
                                                />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-1.5">
                                                    <h4 className="text-sm font-bold text-gray-900 truncate font-poppins">
                                                        {`${apartment.landlord?.firstName || ""} ${apartment.landlord?.lastName || ""}`.trim() || "Landlord Host"}
                                                    </h4>
                                                    {apartment.landlord?.kycStatus === 'VERIFIED' && (
                                                        <ShieldCheck className="w-4 h-4 text-[#10B981] shrink-0" title="Identity & Title Verified" />
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-500">
                                                    {apartment.landlord?.kycStatus === 'VERIFIED'
                                                        ? "Property Host • Verified on Hyve Haven"
                                                        : "Property Host • Pending Document Review"}
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={handleChatWithLandlord}
                                            disabled={isOpeningChat}
                                            className="px-3.5 py-2 rounded-xl border border-primary/40 hover:border-primary text-primary hover:bg-primary/5 text-xs font-bold inline-flex items-center gap-1.5 smooth-transition cursor-pointer disabled:opacity-50 shrink-0"
                                        >
                                            <BiChat className="text-base" />
                                            <span>{isOpeningChat ? "Opening..." : "Chat Host"}</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Right Column: Sticky Booking & Queue Action Card (Desktop) */}
                                <div className="lg:col-span-5 xl:col-span-4 sticky top-24">
                                    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col gap-5">
                                        {/* Pricing Block */}
                                        <div className="pb-4 border-b border-gray-100">
                                            <div className="flex items-baseline justify-between">
                                                <div>
                                                    <p className="text-2xl sm:text-3xl font-extrabold text-primary font-poppins">
                                                        ₦ {Number(apartment.priceAnnually || (apartment.price ? apartment.price * 12 : 0)).toLocaleString()}
                                                    </p>
                                                    <p className="text-xs text-gray-500 font-medium">per year (annual rent)</p>
                                                </div>
                                                {(apartment.price || apartment.priceAnnually) && (
                                                    <div className="text-right">
                                                        <p className="text-xs font-semibold text-gray-700">
                                                            ₦ {Number(apartment.price || Math.round(apartment.priceAnnually / 12)).toLocaleString()}
                                                        </p>
                                                        <p className="text-[10px] text-gray-400">per month</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Action Buttons Container */}
                                        <div className="flex flex-col gap-3">
                                            {/* Fair Queue Wait & Position Transparency Banner */}
                                            {apartment.rawStatus === "ACTIVE" && (
                                                <div className="p-3.5 rounded-xl border bg-orange-50/70 border-orange-200/80 text-xs">
                                                    <div className="flex items-center gap-1.5 font-bold text-gray-900 mb-1">
                                                        <Users className="w-4 h-4 text-primary shrink-0" />
                                                        <span>Fair Queue Transparency</span>
                                                    </div>
                                                    {existingQueue ? (
                                                        existingQueue.status === "ACTIVE" ? (
                                                            <p className="text-green-700 font-semibold flex items-center gap-1">
                                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                                <span>It's your turn! You're Position #1 to inspect and pay.</span>
                                                            </p>
                                                        ) : (
                                                            <p className="text-gray-700">
                                                                You hold <strong>Position #{existingQueue.position}</strong> of {existingQueue.total}.{" "}
                                                                {existingQueue.peopleAhead === 1
                                                                    ? "1 person ahead (~24 hours until you can inspect)."
                                                                    : `${existingQueue.peopleAhead} people ahead (~${existingQueue.peopleAhead * 24} hours until you can inspect).`}
                                                            </p>
                                                        )
                                                    ) : (
                                                        <div>
                                                            {queueSummary.totalInQueue === 0 ? (
                                                                <p className="text-green-700 font-semibold">
                                                                    🎉 0 people in queue — You'll be first to inspect and pay!
                                                                </p>
                                                            ) : queueSummary.totalInQueue === 1 ? (
                                                                <p className="text-gray-700">
                                                                    ⏱️ <strong className="text-gray-900">1 person ahead</strong> — 24 hours until you can inspect.
                                                                </p>
                                                            ) : (
                                                                <p className="text-gray-700">
                                                                    ⏱️ <strong className="text-gray-900">{queueSummary.totalInQueue} people ahead</strong> — {queueSummary.totalInQueue * 24} hours until you can inspect.
                                                                </p>
                                                            )}
                                                            <p className="text-[11px] text-gray-500 mt-1">
                                                                Joining is free. Inspection fee is paid only when your 24h turn arrives.
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {apartment.rawStatus !== "ACTIVE" ? (
                                                // Apartment is RENTED or INACTIVE — no queue allowed
                                                <div className="w-full py-3.5 bg-gray-100 border border-gray-200 rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm font-bold text-gray-500 cursor-not-allowed select-none">
                                                    <Users className="w-4 h-4" />
                                                    <span>Apartment Taken</span>
                                                </div>
                                            ) : existingQueue ? (
                                                <button
                                                    type="button"
                                                    onClick={() => navigate(`/user/apartment/${apartment.id}/queue`)}
                                                    className="w-full py-3.5 text-white rounded-xl shadow-md bg-[#1B784D] hover:bg-[#15603d] active:scale-[0.99] smooth-transition text-xs sm:text-sm font-bold text-center flex items-center justify-center gap-2 cursor-pointer"
                                                >
                                                    <Users className="w-4 h-4" />
                                                    <span>In Queue (Position #{existingQueue.position}) — View</span>
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => setShowJoinQueueModal(true)}
                                                    className="w-full py-3.5 text-white rounded-xl shadow-md bg-primary hover:bg-primary-hover active:scale-[0.99] smooth-transition text-xs sm:text-sm font-bold text-center flex items-center justify-center gap-2 cursor-pointer"
                                                >
                                                    <Users className="w-4 h-4" />
                                                    <span>Join Queue</span>
                                                </button>
                                            )}

                                            <Link
                                                to={`/user/apartment/review/${apartment.id}`}
                                                className="w-full py-2.5 text-gray-800 bg-transparent border border-gray-300 hover:border-gray-400 hover:bg-gray-50 rounded-xl smooth-transition text-xs sm:text-sm text-center font-semibold"
                                            >
                                                Check Reviews ({apartment.totalReviews})
                                            </Link>
                                        </div>

                                        {/* Trust & Guarantee Perks */}
                                        <div className="bg-[#FFF9F5] border border-[#FF630015] rounded-xl p-3.5 text-xs text-gray-700 space-y-2">
                                            <div className="flex items-start gap-2">
                                                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                                <p><strong className="text-gray-900">Zero Agent Bidding Wars:</strong> Strict first-come, first-served queue policy.</p>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                                <p><strong className="text-gray-900">24-Hour Decision Lock:</strong> Full private inspection window before anyone else.</p>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                                <p><strong className="text-gray-900">100% Escrow Protection:</strong> Funds held safe until keys and tenancy are verified.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* Mobile Navigation Tab */}
            <MobileNavigationTab currentTab="search" />

            {/* Mobile Fixed Sticky Bottom Action Bar */}
            {apartment && (
                <div className="sm:hidden fixed bottom-14 left-0 right-0 z-20 bg-white/95 backdrop-blur-md border-t border-gray-200 px-4 py-3 shadow-lg flex items-center justify-between gap-3">
                    <div>
                        <p className="text-lg font-extrabold text-primary leading-tight font-poppins">
                            ₦ {Number(apartment.priceAnnually || (apartment.price ? apartment.price * 12 : 0)).toLocaleString()}
                        </p>
                        <p className="text-[10px] text-gray-500 font-medium">per year</p>
                    </div>

                    {apartment.rawStatus !== "ACTIVE" ? (
                        <div className="px-4 py-2.5 bg-gray-100 text-gray-400 text-xs font-bold rounded-xl">
                            Taken
                        </div>
                    ) : existingQueue ? (
                        <button
                            type="button"
                            onClick={() => navigate(`/user/apartment/${apartment.id}/queue`)}
                            className="px-5 py-2.5 bg-[#1B784D] text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 shrink-0"
                        >
                            <Users className="w-4 h-4" />
                            <span>In Queue (#{existingQueue.position})</span>
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setShowJoinQueueModal(true)}
                            className="px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl shadow-sm shadow-primary/20 flex items-center gap-1.5 shrink-0 active:scale-95"
                        >
                            <Users className="w-4 h-4" />
                            <span>Join Queue {queueSummary.totalInQueue > 0 ? `(${queueSummary.totalInQueue} ahead)` : "(First)"}</span>
                        </button>
                    )}
                </div>
            )}

            {/* Queue Booking Modals */}
            <JoinQueueModal
                isOpen={showJoinQueueModal}
                onClose={() => setShowJoinQueueModal(false)}
                apartment={apartment}
                capacity={capacity}
                existingQueue={existingQueue}
                onJoin={handleJoinQueue}
                onOpenUpgrade={() => setShowUpgradeModal(true)}
                onViewExistingQueue={(qId) => navigate(`/user/apartment/${apartment?.id}/queue`)}
            />

            <UpgradeTierModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                currentTier={capacity.tier}
                onUpgrade={upgradeTier}
            />
        </div>
    );
};

export default ApartmentDetails;
