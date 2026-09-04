"use client"
import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Sidebar from "./components/layout/Sidebar/Sidebar";
import Header from "./components/layout/Dashboard/Header";
import MobileNavigationTab from "./components/layout/MobileNavigation/MobileNavigationTab";
import { getLandlordPropertyById, deleteLandlordProperty } from "../../utils/landlordPropertiesApi";
import { getPropertyById } from "../../utils/propertiesApi";
import { mapProperty } from "../../utils/mapProperty";
import placeholderImage from "../../assets/images/apartments/apartment-image-1.png";

import { BiErrorCircle } from "react-icons/bi";
import { RxCaretDown, RxCaretUp } from "react-icons/rx";
import { MdOutlineEdit } from "react-icons/md";
import { AiOutlineDelete } from "react-icons/ai";
import { IoArrowBack, IoLocationOutline, IoStarSharp, IoCheckmarkCircleOutline, IoLogInOutline } from "react-icons/io5";
import { MdOutlineRateReview } from "react-icons/md";

const ManageProperty = () => {
    const { apartmentID } = useParams();
    const navigate = useNavigate();

    const [apartment, setApartment] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAuthError, setIsAuthError] = useState(false);

    // State to handle show more/less of apartment description
    const [isExpanded, setIsExpanded] = useState(false);

    // State to track the currently displayed main image
    const [mainImage, setMainImage] = useState(null);

    // State for delete modal & loading
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState(null);

    // Fetch landlord property data (with automatic dual-endpoint fallback)
    const fetchProperty = async () => {
        if (!apartmentID) {
            setError("No property ID found in URL.");
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);
        setIsAuthError(false);

        try {
            let raw = null;
            // 1. Try landlord endpoint first
            try {
                raw = await getLandlordPropertyById(apartmentID);
            } catch (landlordErr) {
                console.warn("Landlord endpoint error, trying fallback user endpoint:", landlordErr);
                // 2. If landlord endpoint fails (e.g. 403 role mismatch or student user), try property endpoint
                try {
                    raw = await getPropertyById(apartmentID);
                } catch {
                    throw landlordErr;
                }
            }

            if (!raw) {
                throw new Error("Property details could not be found.");
            }

            const mapped = mapProperty(raw);
            setApartment(mapped);
            setMainImage(mapped?.lodgeImage || (mapped?.images && mapped.images[0]) || placeholderImage);
        } catch (err) {
            console.error("Error fetching property:", err);
            const errMsg = String(err?.message || "");
            const is403 = errMsg.includes("403") || err?.status === 403;
            if (is403) {
                setIsAuthError(true);
                setError("Your login session may have expired or does not have landlord permissions. Please log in again to renew your access token.");
            } else {
                setError(err?.message || "Failed to load property details. Please try again.");
            }
            setApartment(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProperty();
    }, [apartmentID]);

    const handleReLogin = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("userRole");
        navigate("/auth/signin/landlord");
    };

    // Handle show more/less functionality
    const toggleDescription = () => {
        setIsExpanded(prev => !prev);
    };

    // Thumbnails array
    const lodgeThumbnails = (apartment?.images && apartment.images.length > 0)
        ? apartment.images.map((img, index) => ({ id: index, image: img }))
        : [];

    const handleThumbnailClick = (thumbnailImage) => {
        setMainImage(thumbnailImage);
    };

    const displayedImage = mainImage || apartment?.lodgeImage || placeholderImage;

    // Handle delete action
    const handleDelete = async () => {
        setIsDeleting(true);
        setDeleteError(null);
        try {
            await deleteLandlordProperty(apartmentID);
            setShowDeleteModal(false);
            navigate("/landlord/dashboard");
        } catch (err) {
            console.error("Failed to delete property:", err);
            setDeleteError(err?.message || "Failed to delete property. Please try again.");
            setIsDeleting(false);
        }
    };

    return (
        <>
            <div className='page-wrapper'>
                <div className='flex'>
                    {/* Dashboard sidebar */}
                    <Sidebar />

                    {/* Dashboard content area */}
                    <main className='w-full h-[100svh] sm:w-[70%] lg:w-[80%] overflow-auto'>
                        {/* Navbar */}
                        <Header />

                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)]">
                                <div className="spinner w-[34px] h-[34px]"></div>
                                <p className="mt-4 text-sm text-[#888888] font-poppins">Loading property details...</p>
                            </div>
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)] px-4">
                                <div className="p-8 max-w-md w-full bg-red-50/60 border border-red-200 rounded-2xl text-center">
                                    <BiErrorCircle className="text-[38px] text-primary mx-auto mb-3" />
                                    <h4 className="font-poppins font-semibold text-[#3D3129] text-base mb-1">
                                        Unable to Load Property
                                    </h4>
                                    <p className="text-xs text-red-600 mb-5">{error}</p>
                                    <div className="flex flex-wrap items-center justify-center gap-3">
                                        {isAuthError ? (
                                            <button
                                                type="button"
                                                onClick={handleReLogin}
                                                className="px-4 py-2 text-xs font-medium text-white bg-primary hover:bg-primary-hover rounded-xl shadow smooth-transition flex items-center gap-1.5"
                                            >
                                                <IoLogInOutline className="text-base" />
                                                <span>Log In Again</span>
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={fetchProperty}
                                                className="px-4 py-2 text-xs font-medium text-white bg-primary hover:bg-primary-hover rounded-xl shadow smooth-transition"
                                            >
                                                Retry
                                            </button>
                                        )}
                                        <Link
                                            to="/landlord/dashboard"
                                            className="px-4 py-2 text-xs font-medium text-[#3D3129] border border-black/15 hover:bg-black/5 rounded-xl smooth-transition"
                                        >
                                            Back to Dashboard
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ) : apartment ? (
                            <div className='px-3 pt-4 pb-28 sm:pb-16 sm:px-6 lg:px-8 lg:pt-6'>
                                {/* Top navigation breadcrumb */}
                                <div className="flex items-center justify-between mb-4">
                                    <Link
                                        to="/landlord/dashboard"
                                        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#3D3129]/70 hover:text-primary smooth-transition"
                                    >
                                        <IoArrowBack className="text-base" />
                                        <span>Back to Properties</span>
                                    </Link>

                                    <div className="flex items-center gap-2">
                                        <span className={`text-[11px] font-medium px-3 py-1 rounded-full ${
                                            apartment.status === 'open' || apartment.status === 'ACTIVE'
                                                ? 'bg-[#DDFFE7] text-[#1B784D]'
                                                : 'bg-black/10 text-[#3D3129]'
                                        }`}>
                                            {apartment.status === 'open' || apartment.status === 'ACTIVE' ? 'Listing Active' : 'Listing Inactive'}
                                        </span>
                                    </div>
                                </div>

                                {/* Title, Price, and Location */}
                                <div className="bg-white border border-[#FF630026] rounded-2xl p-4 sm:p-6 shadow-sm mb-6">
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                        <div>
                                            <h2 className="font-poppins text-lg sm:text-2xl font-semibold text-[#3D3129]">
                                                {apartment.lodgeDesc}
                                            </h2>
                                            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs sm:text-sm text-[#777777]">
                                                <span className="flex items-center gap-1">
                                                    <IoLocationOutline className="text-primary text-base" />
                                                    {apartment.nearbyDistance || "Location on inquiry"}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <IoStarSharp className="text-[#F6D100] text-sm" />
                                                    <span className="font-semibold text-[#3D3129]">{apartment.starRating}</span>
                                                    <span>({apartment.totalReviews || 0} reviews)</span>
                                                </span>
                                            </div>
                                        </div>

                                        <div className="text-left md:text-right pt-2 md:pt-0 border-t md:border-t-0 border-black/5">
                                            <p className="text-xl sm:text-2xl font-bold text-primary font-poppins">
                                                ₦ {Number(apartment.price || 0).toLocaleString()}
                                                <span className="text-xs font-normal text-[#888888] ml-1">/ month</span>
                                            </p>
                                            {apartment.price ? (
                                                <p className="text-xs text-[#888888] mt-0.5">
                                                    ₦ {Number(apartment.price * 12).toLocaleString()} / year
                                                </p>
                                            ) : null}
                                        </div>
                                    </div>
                                </div>

                                {/* Main Content Columns */}
                                <div className="flex flex-col items-start gap-8 lg:gap-10 lg:flex-row">
                                    {/* Left Column: Image Gallery & Delete Action */}
                                    <div className="w-full lg:w-[50%] bg-[#FFFBF9] border border-[#FF63001F] rounded-2xl flex flex-col justify-center items-center px-4 sm:px-6 py-6 shadow-sm">
                                        <div className="w-full">
                                            {/* Main Image Container */}
                                            <div className="relative mb-4">
                                                <div className="w-full overflow-hidden shadow-sm aspect-square sm:aspect-[4/3] rounded-xl bg-black/5">
                                                    <img
                                                        src={displayedImage}
                                                        alt={apartment.lodgeDesc}
                                                        className="object-cover w-full h-full transition-all duration-300"
                                                        onError={(e) => { e.target.src = placeholderImage; }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Thumbnails Section */}
                                            {lodgeThumbnails.length > 1 && (
                                                <div className="flex items-center justify-start gap-2 overflow-x-auto pb-2 scrollbar-thin">
                                                    {lodgeThumbnails.map((thumbnail, index) => (
                                                        <div
                                                            key={thumbnail.id}
                                                            onClick={() => handleThumbnailClick(thumbnail.image)}
                                                            className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 aspect-square overflow-hidden rounded-lg cursor-pointer border-2 smooth-transition ${
                                                                displayedImage === thumbnail.image
                                                                    ? 'border-primary ring-2 ring-primary/20 shadow-sm'
                                                                    : 'border-transparent hover:border-primary/40 opacity-75 hover:opacity-100'
                                                            }`}
                                                        >
                                                            <img
                                                                src={thumbnail.image}
                                                                alt={`Thumbnail view ${index + 1}`}
                                                                className="object-cover w-full h-full"
                                                                onError={(e) => { e.target.src = placeholderImage; }}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Action Btns for Desktop */}
                                            <div className="flex flex-col sm:flex-row items-center gap-3 mt-6 pt-4 border-t border-black/5 w-full">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowDeleteModal(true)}
                                                    className="w-full sm:w-1/2 py-3 px-4 text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl smooth-transition text-xs sm:text-sm font-medium flex items-center justify-center gap-2 shadow-sm"
                                                >
                                                    <AiOutlineDelete size={18} />
                                                    <span>Delete Property</span>
                                                </button>

                                                <Link
                                                    to={`/landlord/property/${apartmentID}/reviews`}
                                                    className="w-full sm:w-1/2 py-3 px-4 text-[#3D3129] bg-white hover:bg-[#FFF0E6] border border-primary/30 rounded-xl smooth-transition text-xs sm:text-sm font-medium flex items-center justify-center gap-2 shadow-sm text-center"
                                                >
                                                    <MdOutlineRateReview size={18} className="text-primary" />
                                                    <span>View Reviews</span>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column: Details, Amenities & Description */}
                                    <div className="w-full lg:w-[50%] flex flex-col gap-6">
                                        {/* Edit Property Button */}
                                        <Link to={`/landlord/property/${apartmentID}/update`}>
                                            <div className="flex items-center justify-between px-6 py-3.5 text-white cursor-pointer rounded-xl bg-primary hover:bg-primary-hover smooth-transition shadow-md font-medium text-sm sm:text-base">
                                                <span>Edit Property Details</span>
                                                <MdOutlineEdit className="text-xl" />
                                            </div>
                                        </Link>

                                        {/* Property Specifications Card */}
                                        <div className="bg-white border border-[#FF630026] rounded-xl p-5 sm:p-6 shadow-sm">
                                            <h4 className="font-poppins font-semibold text-[#3D3129] text-sm sm:text-base mb-4">
                                                Property Overview
                                            </h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-3 bg-[#FFFBF9] rounded-lg border border-[#FF63001F]">
                                                    <p className="text-[11px] uppercase tracking-wider text-[#888888] font-medium">Location</p>
                                                    <h5 className="font-medium text-sm text-[#3D3129] mt-0.5 truncate">
                                                        {apartment.nearbyDistance || "Not specified"}
                                                    </h5>
                                                </div>

                                                <div className="p-3 bg-[#FFFBF9] rounded-lg border border-[#FF63001F]">
                                                    <p className="text-[11px] uppercase tracking-wider text-[#888888] font-medium">Status</p>
                                                    <h5 className="font-medium text-sm text-[#1B784D] mt-0.5">
                                                        {apartment.status === 'open' || apartment.status === 'ACTIVE' ? 'Available' : 'Occupied'}
                                                    </h5>
                                                </div>

                                                <div className="p-3 bg-[#FFFBF9] rounded-lg border border-[#FF63001F]">
                                                    <p className="text-[11px] uppercase tracking-wider text-[#888888] font-medium">Property Type</p>
                                                    <h5 className="font-medium text-sm text-[#3D3129] mt-0.5 capitalize">
                                                        {apartment.propertyType || "Apartment"}
                                                    </h5>
                                                </div>

                                                <div className="p-3 bg-[#FFFBF9] rounded-lg border border-[#FF63001F]">
                                                    <p className="text-[11px] uppercase tracking-wider text-[#888888] font-medium">Listing ID</p>
                                                    <h5 className="font-medium text-sm text-[#3D3129] mt-0.5">
                                                        #{apartmentID}
                                                    </h5>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Amenities Section */}
                                        <div className="bg-white border border-[#FF630026] rounded-xl p-5 sm:p-6 shadow-sm">
                                            <h4 className="font-poppins font-semibold text-[#3D3129] text-sm sm:text-base mb-3">
                                                Amenities & Features
                                            </h4>
                                            {apartment.amenitiesList && apartment.amenitiesList.length > 0 ? (
                                                <div className="flex flex-wrap gap-2">
                                                    {apartment.amenitiesList.map((amenity, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#FFF0E6] text-primary border border-primary/20 rounded-lg text-xs font-medium"
                                                        >
                                                            <IoCheckmarkCircleOutline className="text-sm" />
                                                            {amenity}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-xs sm:text-sm text-[#888888]">
                                                    {apartment.amenities || "No amenities listed for this property."}
                                                </p>
                                            )}
                                        </div>

                                        {/* Description Section */}
                                        <div className="bg-white border border-[#FF630026] rounded-xl p-5 sm:p-6 shadow-sm">
                                            <h4 className="font-poppins font-semibold text-[#3D3129] text-sm sm:text-base mb-2">
                                                Description
                                            </h4>
                                            <div
                                                className={`
                                                    overflow-hidden 
                                                    ${isExpanded ? 'max-h-[800px]' : 'max-h-[4.5rem]'}
                                                    transition-all duration-500 ease-in-out
                                                `}
                                            >
                                                <p className="text-xs sm:text-sm font-light leading-relaxed text-gray-700 whitespace-pre-wrap">
                                                    {apartment.description || "No description provided for this listing."}
                                                </p>
                                            </div>

                                            {apartment.description && apartment.description.length > 150 && (
                                                <button
                                                    type="button"
                                                    onClick={toggleDescription}
                                                    className="flex items-center gap-1 mt-3 text-xs sm:text-sm font-medium text-primary hover:underline"
                                                >
                                                    <span>{isExpanded ? 'Show less' : 'Show more'}</span>
                                                    {isExpanded ? <RxCaretUp size={20} /> : <RxCaretDown size={20} />}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </main>
                </div>

                {/* Mobile navigation */}
                <MobileNavigationTab />
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
                    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 border border-black/10">
                        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4 text-2xl">
                            <AiOutlineDelete />
                        </div>
                        <h3 className="font-poppins font-semibold text-lg text-center text-[#3D3129]">
                            Delete Property Listing?
                        </h3>
                        <p className="text-xs sm:text-sm text-center text-[#666666] mt-2">
                            Are you sure you want to delete <span className="font-medium text-[#3D3129]">"{apartment?.lodgeDesc}"</span>? This listing will be permanently removed from your dashboard and user searches.
                        </p>

                        {deleteError && (
                            <div className="mt-3 p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 text-center">
                                {deleteError}
                            </div>
                        )}

                        <div className="flex items-center gap-3 mt-6">
                            <button
                                type="button"
                                disabled={isDeleting}
                                onClick={() => setShowDeleteModal(false)}
                                className="w-1/2 py-2.5 px-4 text-xs sm:text-sm font-medium text-[#3D3129] border border-black/15 hover:bg-black/5 rounded-xl smooth-transition disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={isDeleting}
                                onClick={handleDelete}
                                className="w-1/2 py-2.5 px-4 text-xs sm:text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md smooth-transition flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isDeleting ? (
                                    <>
                                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Deleting...</span>
                                    </>
                                ) : (
                                    <span>Yes, Delete</span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ManageProperty;