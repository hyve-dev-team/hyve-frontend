"use client"
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import Sidebar from "./components/layout/Sidebar/Sidebar";
import Header from "./components/layout/Dashboard/Header";
import MobileNavigationTab from "./components/layout/MobileNavigation/MobileNavigationTab";
import useFetchApartment from "../../hooks/useFetchApartment"

import { BiErrorCircle } from "react-icons/bi";
import { RxCaretDown, RxCaretUp } from "react-icons/rx";
import { MdOutlineEdit } from "react-icons/md";
import { AiOutlineDelete } from "react-icons/ai";

const ManageProperty = () => {
    // Get apartment Id and fetch apartment details using the id
    const { apartmentID } = useParams();

    // Call useFetchApartment to fetch apartment details
    const { apartment, isLoading, error } = useFetchApartment(apartmentID);

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
                                                            <Link to={``}
                                                                className="w-full py-3 text-white rounded-lg md:rounded-xl shadow-md bg-primary hover:bg-primary-hover smooth-transition text-[12px] sm:text-[14px] text-center">
                                                                <button type="button" className="flex items-center justify-center w-full gap-2">
                                                                    Delete Property
                                                                    <AiOutlineDelete size={18} />
                                                                </button>
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>


                                                {/* Left component: landlord profile and apartment details */}
                                                <div className="w-full  lg:w-[50%]">

                                                    <Link to={`/landlord/property/${1}/update`}>
                                                        <div className="flex items-center justify-between px-6 py-3 text-white cursor-pointer rounded-xl bg-primary hover:bg-primary-hover smooth-transition">
                                                            <div className="flex items-center justify-between w-full">
                                                                <span>Edit Property</span>
                                                                <MdOutlineEdit />
                                                            </div>
                                                        </div>
                                                    </Link>

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
                                                    <Link to={``}
                                                        className="w-full py-3 text-white rounded-lg md:rounded-xl shadow-md bg-primary hover:bg-primary-hover smooth-transition text-sm sm:text-[14px] text-center"
                                                    >
                                                        <button type="button">
                                                            Delete Property
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

export default ManageProperty