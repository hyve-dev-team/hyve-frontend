import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import MobileNavigationTab from "./components/layout/MobileNavigation/MobileNavigationTab";
import Sidebar from "./components/layout/Sidebar/Sidebar";
import Header from "./components/layout/Dashboard/Header";
import { getLandlordPropertyById } from "../../utils/landlordPropertiesApi";
import { getPropertyById } from "../../utils/propertiesApi";
import { mapProperty } from "../../utils/mapProperty";

import { MdStarRate } from "react-icons/md";
import { BiErrorCircle } from "react-icons/bi";
import { IoArrowBack } from "react-icons/io5";

const LandordApartmentReviews = () => {
    const { apartmentID } = useParams();

    const [apartment, setApartment] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;
        const fetchReviews = async () => {
            if (!apartmentID) {
                setError("No property ID provided.");
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            setError(null);
            try {
                let raw = null;
                try {
                    raw = await getLandlordPropertyById(apartmentID);
                } catch (landlordErr) {
                    try {
                        raw = await getPropertyById(apartmentID);
                    } catch {
                        throw landlordErr;
                    }
                }
                if (!cancelled) {
                    setApartment(mapProperty(raw));
                }
            } catch (err) {
                if (!cancelled) {
                    console.error("Error fetching apartment reviews:", err);
                    setError(err?.message || "Failed to load apartment reviews.");
                    setApartment(null);
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        };

        fetchReviews();
        return () => { cancelled = true; };
    }, [apartmentID]);

    // Helper to get initial for avatar if user has no profile image
    const getInitial = (name) => {
        return name ? name.charAt(0).toUpperCase() : 'A';
    };

    const reviews = apartment?.reviews || [];
    const ratingValue = apartment?.starRating && apartment.starRating !== "New" ? Number(apartment.starRating) : 5.0;

    return (
        <div className='page-wrapper'>
            <div className='flex'>
                {/* Dashboard sidebar*/}
                <Sidebar />

                {/* Dashboard content area */}
                <main className='w-full h-[100svh] sm:w-[70%] lg:w-[80%] overflow-auto'>
                    <Header />

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)]">
                            <div className="spinner w-[30px] h-[30px]"></div>
                            <p className="mt-3 text-xs text-[#888888] font-poppins">Loading reviews...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)] px-4">
                            <div className="p-6 max-w-sm w-full bg-red-50 border border-red-200 rounded-2xl text-center">
                                <BiErrorCircle className="text-[34px] text-primary mx-auto mb-2" />
                                <p className="text-xs text-red-600 mb-4">{error}</p>
                                <Link
                                    to={`/landlord/property/${apartmentID}/manage`}
                                    className="px-4 py-2 text-xs font-medium text-white bg-primary hover:bg-primary-hover rounded-xl shadow smooth-transition inline-block"
                                >
                                    Back to Property
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className='px-3 pt-6 pb-28 sm:pb-16 sm:px-6 lg:px-8 lg:pt-8'>
                            <div className="mb-4">
                                <Link
                                    to={`/landlord/property/${apartmentID}/manage`}
                                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#3D3129]/70 hover:text-primary smooth-transition"
                                >
                                    <IoArrowBack className="text-base" />
                                    <span>Back to Property Management</span>
                                </Link>
                            </div>

                            <div className="flex flex-col items-center">
                                {/* Title and Overall Rating */}
                                <div className="text-center bg-white border border-[#FF630026] rounded-2xl p-6 shadow-sm w-full max-w-xl">
                                    <h4 className="text-base sm:text-xl font-semibold font-poppins text-[#3D3129]">
                                        {apartment?.lodgeDesc}
                                    </h4>
                                    <div className="flex items-center justify-center pt-2 gap-2">
                                        <p className="font-bold text-base text-[#3D3129]">
                                            {apartment?.starRating || "New"}
                                        </p>
                                        <div className="flex">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <MdStarRate
                                                    key={i}
                                                    className={`
                                                        ${i < Math.round(ratingValue) ? 'text-[#FF6300]' : 'text-[#E3E3E3]'} 
                                                        text-lg
                                                    `}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-xs text-[#888888]">
                                            ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                                        </span>
                                    </div>
                                </div>

                                {reviews.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16 text-center">
                                        <p className="text-sm text-[#888888]">No user reviews submitted for this property yet.</p>
                                    </div>
                                ) : (
                                    <div className="w-full mt-8">
                                        <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-2">
                                            {reviews.map((review) => (
                                                <div
                                                    key={review.id}
                                                    className="p-5 bg-white rounded-2xl border border-[#FF630026] shadow-sm flex flex-col justify-between"
                                                >
                                                    <div>
                                                        <div className="flex items-center mb-3">
                                                            {review.profileImage ? (
                                                                <div className='w-11 h-11 mr-3 overflow-hidden rounded-full'>
                                                                    <img
                                                                        src={review.profileImage}
                                                                        alt={review.author}
                                                                        className="object-cover w-full h-full"
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center justify-center w-11 h-11 mr-3 text-sm font-bold text-white rounded-full bg-primary flex-shrink-0">
                                                                    {getInitial(review.author)}
                                                                </div>
                                                            )}

                                                            <div>
                                                                <p className="font-poppins font-medium text-sm text-[#3D3129]">
                                                                    {review.author}
                                                                </p>
                                                                <div className="flex mt-0.5">
                                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                                        <MdStarRate
                                                                            key={i}
                                                                            className={`
                                                                                ${i < review.rating ? 'text-[#FF6300]' : 'text-[#E3E3E3]'} 
                                                                                text-sm
                                                                            `}
                                                                        />
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <p className="text-[#555555] leading-relaxed text-xs sm:text-sm italic">
                                                            "{review.review}"
                                                        </p>
                                                    </div>

                                                    {review.createdAt && (
                                                        <p className="text-[10px] text-[#AAAAAA] mt-3 pt-2 border-t border-black/5 text-right">
                                                            {new Date(review.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </main>
            </div>
            <MobileNavigationTab />
        </div>
    );
};

export default LandordApartmentReviews;