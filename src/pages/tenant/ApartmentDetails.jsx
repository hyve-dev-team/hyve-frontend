
"use client"
import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import defaultProfile from "../../assets/images/shared-images/user-1.png"
import useFetchApartment from "../../hooks/useFetchApartment"
import { createOrGetChatRoom } from "../../utils/chatApi";
import { hyveError } from "../../utils/hyveToast";
import Header from "./components/layout/Dashboard/Header";
import Sidebar from "./components/layout/Sidebar/Sidebar"
import MobileNavigationTab from "./components/layout/MobileNavigation/MobileNavigationTab";

import { LuUserRoundCog } from "react-icons/lu"
import { BiErrorCircle } from "react-icons/bi";
import { RxCaretDown, RxCaretUp } from "react-icons/rx";
import { BiChat } from "react-icons/bi";

const ApartmentDetails = () => {
    // Get apartment Id and fetch apartment details using the id
    const { apartmentID } = useParams();
    const navigate = useNavigate();

    // Call useFetchApartment to fetch apartment details
    const { apartment, isLoading, error } = useFetchApartment(apartmentID);

    // State to track "Chat with Landlord" click in flight
    const [isOpeningChat, setIsOpeningChat] = useState(false);

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

    // State to handle show more/less of apartment description
    const [isExpanded, setIsExpanded] = useState(false);

    // State to track the currently displayed main image
    const [mainImage, setMainImage] = useState(null);

    // Handle show more/less functionality
    const toggleDescription = () => {
        setIsExpanded(prev => !prev);
    };

    // Set a default value for lodgeTumbnails to prevent crashing during loading/error
    const lodgeTumbnails = apartment?.lodgeTumbnails || [];

    // Function to handle thumbnail click
    const handleThumbnailClick = (thumbnailImage) => {
        setMainImage(thumbnailImage);
    };

    // Determine which image to display in the main container
    const displayedImage = mainImage || apartment?.lodgeImage;

    return (
        <>
            <div className='page-wrapper'>
                <div className='flex'>
                    {/* dashboard sidebar*/}
                    <Sidebar />

                    {/* dashboard content area */}
                    <main className='w-full h-[100svh] sm:w-[70%] lg:w-[80%] overflow-auto'>
                        {/* Navbar */}
                        <Header />

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
                                    <>
                                        <div className='px-3 pt-6 pb-28 sm:pb-16 sm:px-6 lg:px-8 lg:pt-8'>
                                            <div>
                                                <div>
                                                    <p className="text-sm sm:text-[18px] font-semibold text-[#FF6300] ">
                                                        ₦ {apartment.price}
                                                    </p>

                                                    <h3 className="font-poppins text-[16px] md:text-[22px] font-medium ">
                                                        {apartment.lodgeDesc}
                                                    </h3>

                                                    <p className="text-[12px] md:text-sm mr-2 text-[#AAAAAA]">{apartment.nearbyDistance}</p>
                                                </div>
                                                <div className="flex items-center gap-2 pt-2">
                                                    <span className="flex items-center gap-1 text-sm text-[#FF6300] border border-[#FF6300] bg-white px-2 py-1 rounded-md">
                                                        <LuUserRoundCog />
                                                        <p className="leading-none text-[10px]">Verified ID</p>
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Right and Left components wrapper */}
                                            <div className="flex flex-col items-start gap-12 mt-8 lg:gap-16 lg:flex-row">

                                                {/* Right component: Image Gallery */}
                                                <div className="w-full lg:w-[50%] bg-[#FFFBF9] flex flex-col justify-center items-center px-4 sm:px-10 md:px-10 py-10">
                                                    <div className="w-full">
                                                        <div className="relative mb-5">
                                                            {/* Main Image Container */}
                                                            <div className="w-full overflow-hidden shadow-md aspect-square rounded-xl">
                                                                <img
                                                                    src={displayedImage}
                                                                    alt="apartment image"
                                                                    className="object-cover w-full h-full"
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Thumbnails Section */}
                                                        <div className="flex items-center justify-center gap-1 ">
                                                            {lodgeTumbnails.slice(0, 6).map((thumbnail, index) => (
                                                                <div
                                                                    key={thumbnail.id}
                                                                    onClick={() => handleThumbnailClick(thumbnail.image)}
                                                                    className={`w-20 aspect-square overflow-hidden rounded-lg cursor-pointer border-2 smooth-transition ${displayedImage === thumbnail.image ? 'border-primary' : 'border-transparent hover:border-primary'}`}
                                                                >
                                                                    <img
                                                                        src={thumbnail.image}
                                                                        alt={`Thumbnail view ${index + 1}`}
                                                                        className="object-cover w-full h-full"
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>

                                                        {/* Action Btns: hidden on smaller screens */}
                                                        <div className="justify-center hidden w-full gap-2 mt-8 lg:flex sm:gap-4 md:mt-16">
                                                            {/* <Link to={`/user/apartment/reserve/${apartment.id}`}
                                                                className="w-full py-3 text-white rounded-lg md:rounded-xl shadow-md bg-primary hover:bg-primary-hover smooth-transition text-[12px] sm:text-[14px] text-center"
                                                            > */}
                                                            <Link to={`/user/apartment/${apartment.id}/queue`}
                                                                className="w-full py-3 text-white rounded-lg md:rounded-xl shadow-md bg-primary hover:bg-primary-hover smooth-transition text-[12px] sm:text-[14px] text-center"
                                                            >
                                                                <button type="button">
                                                                    Join Queue
                                                                </button>
                                                            </Link>
                                                            <Link to={`/user/apartment/review/${apartment.id}`}
                                                                className="w-full py-3 text-black bg-transparent border-2 rounded-lg md:rounded-xl shadow-md border-primary hover:bg-gray smooth-transition text-[12px] sm:text-[14px] text-center">
                                                                <button type="button">
                                                                    Check reviews
                                                                </button>
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>


                                                {/* Left component: landlord profile and apartment details */}
                                                <div className="w-full  lg:w-[50%]">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-[40px] md:w-[55px]  rounded-full overflow-hidden">
                                                                <img src={apartment.landlord?.profilePictureUrl || defaultProfile} alt="landlord image profile image" className="object-cover w-full h-full" />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-medium text-xs sm:text-[16px] font-poppins">{`${apartment.landlord?.firstName || ""} ${apartment.landlord?.lastName || ""}`.trim() || "Landlord"} </h4>
                                                                <p className="text-[#777777] font-normal text-xs md:text-sm">Landlord / Owner</p>
                                                            </div>
                                                        </div>

                                                        <button type="button" onClick={handleChatWithLandlord} disabled={isOpeningChat} title="Chat with Landlord" className="flex items-center gap-1 p-2 border rounded-full text-primary border-primary hover:text-white hover:bg-primary-hover smooth-transition disabled:opacity-50">
                                                            <BiChat className="text-[16px] md:text-[20px]" />
                                                        </button>
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
                                                </div>

                                                {/* Action Btns: visible on smaller screens */}
                                                <div className="flex justify-center w-full gap-2 mt-2 lg:hidden sm:gap-4">
                                                    {/* <Link to={`/user/apartment/reserve/${apartment.id}`}
                                                        className="w-full py-3 text-white rounded-lg md:rounded-xl shadow-md bg-primary hover:bg-primary-hover smooth-transition text-sm sm:text-[14px] text-center"
                                                    > */}
                                                    <Link to={`/user/apartment/${apartment.id}/queue`}
                                                        className="w-full py-3 text-white rounded-lg md:rounded-xl shadow-md bg-primary hover:bg-primary-hover smooth-transition text-sm sm:text-[14px] text-center"
                                                    >
                                                        <button type="button">
                                                            Join Queue
                                                        </button>
                                                    </Link>
                                                    <Link to={`/user/apartment/review/${apartment.id}`}
                                                        className="w-full py-3 text-black bg-transparent border-2 rounded-lg md:rounded-xl shadow-md border-primary hover:bg-gray smooth-transition text-sm sm:text-[14px] text-center">
                                                        <button type="button">
                                                            Check reviews
                                                        </button>
                                                    </Link>
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
    )
}

export default ApartmentDetails
