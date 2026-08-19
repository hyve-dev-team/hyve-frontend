import defaultProfile from "../../assets/images/shared-images/user-1.png"
import MobileNavigationTab from "./components/layout/MobileNavigation/MobileNavigationTab";
import Sidebar from "./components/layout/Sidebar/Sidebar";

import useFetchReviews from "../../hooks/useFetchReviews.jsx";

import { MdStarRate } from "react-icons/md";
import { useParams } from "react-router-dom";
import { BiErrorCircle } from "react-icons/bi";


const LandordApartmentReviews = ({ overallRating = 5 }) => {
    // Get apartment Id and fetch apartment details using the id
    const { apartmentID } = useParams();

    // Call useFetchReviews to fetch apartment reviews
    const { apartment, isLoading, error } = useFetchReviews(apartmentID)

    // Helper to get initial for avatar if user has no profile image
    const getInitial = (name) => {
        return name ? name.charAt(0).toUpperCase() : '';
    };
    return (
        <>
            <div className='page-wrapper'>
                <div className='flex'>
                    {/* Dashboard sidebar*/}
                    <Sidebar  />

                    {/* Dashboard content area */}
                    <main className='w-full h-[100svh] sm:w-[70%] lg:w-[80%] overflow-auto'>
                        {
                            isLoading ?
                                <>
                                    <div className="flex flex-col items-center justify-center h-full">
                                        <div className="spinner w-[30px] h-[30px]"></div>
                                    </div>
                                </>
                                :
                                /* check for any error after loading */
                                error ?

                                    <>
                                        <div className="flex flex-col items-center justify-center h-full">
                                            <BiErrorCircle className="text-[30px] text-primary" />
                                            <small className="mt-4 text-[#AAAAAA]">{error}</small>
                                        </div>
                                    </>
                                    :

                                    apartment.reviews.length === 0 ?
                                        <>
                                            <div className="flex flex-col items-center justify-center h-full">
                                                <small className="mt-4 text-[#AAAAAA]">No reviews found for this apartment.</small>
                                            </div>
                                        </>
                                        :
                                        <>
                                            <div className='px-3 pt-10 pb-28 sm:pb-16 sm:px-6 lg:px-8 lg:pt-20'>
                                                <div className="flex flex-col items-center">
                                                    {/* Title and Overall Rating */}
                                                    <div>
                                                        <h4 className="text-sm sm:text-[18px] font-medium font-poppins text-gray-800 text-center">
                                                            {apartment.lodgeDesc}
                                                        </h4>
                                                        <div className="flex items-center justify-center pt-2">
                                                            <p className="mr-2 font-semibold text-sm sm:text-[16px] leading-none">{overallRating.toFixed(1)}</p>
                                                            {Array.from({ length: 5 }).map((_, i) => (
                                                                <MdStarRate
                                                                    key={i}
                                                                    className={`
                                                    ${i < Math.round(overallRating) ? 'text-[#E67136]' : 'text-[#E3E3E3]'} 
                                                    text-lg
                                                `}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/*  */}
                                                    <div className="relative w-full mt-14 sm:mt-20">
                                                        <div className="flex items-center justify-center overflow-hidden">
                                                            {/* Review Cards Container*/}
                                                            <div className="grid w-full grid-cols-1 gap-8 lg:grid-cols-2 md:px-4">
                                                                {apartment.reviews.map((review) => (
                                                                    <div
                                                                        key={review.id}
                                                                        // Ensure reviews are visually spaced and take up equal space
                                                                        className="flex-1 md:min-w-[300px] p-4 md:p-6  border border-[#0000000D]"
                                                                    >
                                                                        <div className="flex items-center mb-4">
                                                                            {/* Avatar / Initial Display */}
                                                                            {review.profileImage ? (
                                                                                <div className='w-10 mr-2 overflow-hidden rounded-full md:w-16 sm:mr-4'>
                                                                                    <img
                                                                                        src={review.profileImage}
                                                                                        alt={review.author}
                                                                                        className="object-cover w-full h-full"
                                                                                    />
                                                                                </div>
                                                                            ) : (
                                                                                <div className="flex items-center justify-center w-10 h-10 mr-2 text-lg font-bold text-white rounded-full md:w-16 md:h-16 bg-primary sm:mr-4">
                                                                                    {getInitial(review.author)}
                                                                                </div>
                                                                            )}

                                                                            <div>
                                                                                <p className="font-poppins font-medium text-sm sm:text-[16px]">{review.author}</p>
                                                                                {/* Individual Review Stars */}
                                                                                <div className="flex mt-1">
                                                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                                                        <MdStarRate
                                                                                            key={i}
                                                                                            className={`
                                                                            ${i < review.rating ? 'text-orange-500' : 'text-[#E3E3E3]'} 
                                                                            text-sm sm:text-[18px]
                                                                        `}
                                                                                        />
                                                                                    ))}
                                                                                </div>
                                                                            </div>

                                                                        </div>
                                                                        <p className="text-[#3E3E3E] leading-loose text-sm font-normal">
                                                                            "{review.review}"
                                                                        </p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                        }
                    </main>
                </div>
                {/* Mobile navigation */}
                <MobileNavigationTab />
            </div>
        </>
    );
}

export default LandordApartmentReviews;