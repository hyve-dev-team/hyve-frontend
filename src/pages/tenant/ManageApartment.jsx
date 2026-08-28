
import React, { useState } from 'react'
import defaultProfile from "../../assets/images/shared-images/user-1.png"
import apartmentImage from "../../assets/images/apartments/apartment-image-2.png"
import Sidebar from './components/layout/Sidebar/Sidebar'
import MobileNavigationTab from './components/layout/MobileNavigation/MobileNavigationTab'
import { RxCaretDown, RxCaretUp } from 'react-icons/rx'
import { LuUserRoundCog } from 'react-icons/lu'
import { Link } from 'react-router-dom'
import Header from './components/layout/Dashboard/Header'
import { BiChat } from 'react-icons/bi'
import { hyveSuccess, hyveError } from '../../utils/hyveToast'
import { addReview } from '../../utils/propertiesApi'
import { getCurrentLodge } from '../../utils/currentLodge'

const ManageApartment = () => {
    // State to handle show more/less of apartment description
    const [isExpanded, setIsExpanded] = useState(false);

    // State to track the currently displayed main image
    const [mainImage, setMainImage] = useState(null);

    // Review form state — the "Submit review" button had no onSubmit at all before this.
    // Persisted to localStorage for now; swap for a real POST /reviews call once that
    // endpoint exists on the backend.
    const [rating, setRating] = useState('');
    const [reviewText, setReviewText] = useState('');
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    // Handle show more/less functionality
    const toggleDescription = () => {
        setIsExpanded(prev => !prev);
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();

        if (!rating) {
            hyveError("Please select a rating", "Rating is required before submitting a review.");
            return;
        }
        if (!reviewText.trim()) {
            hyveError("Please write a review", "Tell us a bit about your stay first.");
            return;
        }

        const currentLodge = getCurrentLodge();
        if (!currentLodge?.apartmentId) {
            hyveError("No current lodge found", "You need an active booking to leave a review.");
            return;
        }

        setIsSubmittingReview(true);

        try {
            await addReview(currentLodge.apartmentId, {
                rating: Number(rating),
                comment: reviewText.trim(),
            });

            hyveSuccess("Review submitted", "Thanks for sharing your experience!");
            setRating('');
            setReviewText('');
        } catch (err) {
            hyveError("Something went wrong", err.message || "Your review wasn't saved. Please try again.");
        } finally {
            setIsSubmittingReview(false);
        }
    };

    return (
        <>

            <div className='page-wrapper'>
                <div className='flex'>
                    {/* dashboard sidebar*/}
                    <Sidebar currentPage={"apartment"} />

                    {/* dashboard content area */}
                    <main className='w-full h-[100svh] sm:w-[70%] lg:w-[80%] overflow-auto'>
                        {/* Navbar */}
                        <Header />



                        <div className='px-3 pt-6 pb-28 sm:pb-16 sm:px-6 lg:px-8 lg:pt-8'>
                            <div className='flex flex-col items-center justify-between lg:flex-row'>
                                <div className='w-full'>
                                    <p className="text-sm sm:text-[18px] font-semibold text-[#FF6300] ">
                                        ₦ 320000
                                    </p>

                                    <h3 className="font-poppins text-[16px] md:text-[20px] font-medium  md:max-w-[70%] leading-tight mt-2 text-black/80">
                                        Wisdom Lodge  Lorem ipsum dolor sit, amet consectetur adipisicing elit.
                                    </h3>
                                    <div className='mt-4'>
                                        <p className='font-normal text-[12px] sm:text-sm text-black/50'>Moved In Date: 23rd OCT, 2025</p>
                                        <p className='font-normal text-[12px] sm:text-sm  text-black/50'>Rent Expiry Date: 22rd OCT, 2026</p>
                                    </div>
                                </div>

                                <div className='flex flex-col w-full lg:w-[30%] gap-3 mt-8 lg:mt-0'>
                                    {/* 
                                     With these buttons: 
                                     1. user can schedule tour of an aprtment if they've already reserved it. 
                                     2. The schedule move-in button will be disabled and will only be enabled if user has completed tour and has confirmed their payemnt
                                    */}
                                    <Link to="/user/apartment/schedule-tour/1" className='py-2 text-sm text-center border rounded-lg shadow-sm border-primary/30 bg-primary-light md:rounded-xl text-primary hover:border-primary smooth-transition'>
                                        Schedule Tour
                                    </Link>
                                    
                                    <Link to={`/user/apartment/schedule-move-in/${1}`} className='py-2 text-sm text-center border rounded-lg shadow-sm border-primary/30 bg-primary-light md:rounded-xl text-primary hover:border-primary smooth-transition'>
                                        Schedule Move-In
                                    </Link>
                                </div>
                            </div>

                            {/* Right and Left components wrapper */}
                            <div className="flex flex-col items-start gap-12 mt-12 lg:gap-16 lg:flex-row">

                                {/* Right component: Image Gallery */}
                                <div className="w-full lg:w-[50%] bg-[#FFFBF9] flex flex-col justify-center items-center px-4 sm:px-10 md:px-10 py-10">
                                    <div className="w-full">
                                        <div className="relative mb-5">
                                            {/* Main Image Container */}
                                            <div className="w-full overflow-hidden shadow-md aspect-square rounded-xl">
                                                <img
                                                    src={apartmentImage}
                                                    alt="apartment image"
                                                    className="object-cover w-full h-full"
                                                />
                                            </div>
                                        </div>


                                        {/* Action Btns: hidden on smaller screens */}
                                        <div className="flex justify-center w-full gap-2 mt-8 sm:gap-4 md:mt-16">
                                            <Link to=""
                                                className="w-full py-3 text-white rounded-lg md:rounded-xl shadow-md bg-primary hover:bg-primary-hover smooth-transition text-[12px] sm:text-[14px] text-center">
                                                <button type="button">
                                                    Renew Stay
                                                </button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>


                                {/* Left component: landlord profile and apartment details */}
                                <div className="w-full lg:w-[50%]">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-[40px] md:w-[55px]  rounded-full overflow-hidden">
                                                <img src={defaultProfile} alt="landlord image profile image" className="object-cover w-full h-full" />
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-xs sm:text-[16px] font-poppins">Bisola Akanji </h4>
                                                <p className="text-[#777777] font-normal text-xs md:text-sm">Landlord / Owner</p>
                                            </div>
                                        </div>

                                        <Link to="/user/conversation/1" className="flex items-center gap-1 p-2 border rounded-full text-primary border-primary hover:text-white hover:bg-primary-hover smooth-transition" title="Chat with Landlord">
                                            <BiChat className="text-[16px] md:text-[20px]" />
                                        </Link>
                                    </div>

                                    <div className="bg-[#00000008] rounded-xl px-4 sm:px-8 py-6 mt-8 flex flex-col gap-6">
                                        <span>
                                            <h5 className="font-normal text-sm sm:text-[16px] sm:leading-relaxed">Ojota</h5>
                                            <p className="text-[#777777] font-light text-sm">Location</p>
                                        </span>
                                        <span>
                                            <h5 className="font-normal text-sm sm:text-[16px] sm:leading-relaxed">Completed</h5>
                                            <p className="text-[#777777] font-light text-sm">Status</p>
                                        </span>
                                        <span>
                                            <h5 className="font-normal text-sm sm:text-[16px] sm:leading-relaxed">Apartment</h5>
                                            <p className="text-[#777777] font-light text-sm">Property type</p>
                                        </span>
                                        <span>
                                            <h5 className="font-normal text-sm sm:text-[16px] sm:leading-relaxed">Newly-Built</h5>
                                            <p className="text-[#777777] font-light text-sm">Condition</p>
                                        </span>
                                    </div>

                                    <div className="bg-[#00000008] rounded-xl px-4 sm:px-8 py-6 mt-4">
                                        <div
                                            className={`
                                                            overflow-hidden 
                                                            ${isExpanded ? 'max-h-[500px]' : 'max-h-[4.5rem]'}
                                                            transition-all duration-700 linear
                                                        `}
                                        >
                                            {/* The text content */}
                                            <p className="text-sm font-light leading-relaxed text-gray-800 whitespace-pre-wrap">
                                                Spacious and well-finished apartment with 24/7 power supply.
                                                Clean water, secure parking space. The unit also includes high-speed fiber internet access, a fully equipped modern kitchen, and a private balcony with stunning city views. The residential complex offers premium amenities, including a state-of-the-art fitness center, a sparkling swimming pool, and round-the-clock professional security.
                                            </p>
                                        </div>

                                        <button
                                            onClick={toggleDescription}
                                            className="flex items-center mt-2 font-normal underline text-primary">
                                            <p className="text-sm">
                                                {isExpanded ? 'Show less' : 'Show more'}
                                            </p>

                                            {isExpanded
                                                ? <RxCaretUp className="text-[26px]" />
                                                : <RxCaretDown className="text-[26px]" />
                                            }
                                        </button>
                                    </div>


                                    <div className='w-full mt-10'>
                                        <form onSubmit={handleReviewSubmit}>
                                            <div>
                                                <label htmlFor="review-rating" className='text-[#AAAAAA] text-sm'>Rating *</label>
                                                <select
                                                    name="rating"
                                                    id="review-rating"
                                                    value={rating}
                                                    onChange={(e) => setRating(e.target.value)}
                                                    className='w-full px-3 py-3 md:py-4 mt-2 border border-[#6E6E6E] rounded-xl outline-none text-xs focus:border-primary appearance-none'
                                                >
                                                    <option value="">Select a rating (1 - 5)</option>
                                                    <option value="1">1 - Needs Major Improvements</option>
                                                    <option value="2">2 - Below Expectation</option>
                                                    <option value="3">3 - Satisfactory (Met Expectations)</option>
                                                    <option value="4">4 - Great Stay</option>
                                                    <option value="5">5 - Execptional (Highly Recommended)</option>
                                                </select>
                                            </div>
                                            <div className='mt-2'>
                                                <textarea
                                                    placeholder='Drop a review...'
                                                    name="review"
                                                    id="review"
                                                    maxLength={250}
                                                    value={reviewText}
                                                    onChange={(e) => setReviewText(e.target.value)}
                                                    className='w-full h-[100px] px-3 py-2 border border-[#6E6E6E] rounded-xl outline-none text-sm focus:border-primary text-black/80'
                                                ></textarea>
                                            </div>

                                            <button
                                                type='submit'
                                                disabled={isSubmittingReview}
                                                className='w-full sm:w-1/3 mt-4 py-3 text-white rounded-lg md:rounded-xl shadow-md bg-primary hover:bg-primary-hover smooth-transition text-sm sm:text-[14px] disabled:opacity-60'
                                            >
                                                {isSubmittingReview ? "Submitting..." : "Submit review"}
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
                {/* Mobile navigation */}
                <MobileNavigationTab />
            </div>
        </>
    )
}

export default ManageApartment
