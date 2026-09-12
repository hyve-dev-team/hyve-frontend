
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { saveProperty, unsaveProperty } from '../../../../../utils/propertiesApi';
import { createOrGetChatRoom } from '../../../../../utils/chatApi';
import { hyveError } from '../../../../../utils/hyveToast';
import { BsHeart, BsHeartFill } from "react-icons/bs";
import { LuUserRoundCog } from "react-icons/lu";
import { IoStarSharp } from 'react-icons/io5';
import placeholderImage from "../../../../../assets/images/apartments/apartment-image-1.png";

// `lodges` must be passed in — already mapped via utils/mapProperty.js by whichever
// page fetched them (Dashboard/Search/Saved). `savedIds` is a Set of saved property
// ids so the heart icon reflects the real server-side saved state.
const AllApartments = ({ lodges = [], savedIds = new Set(), onSavedChange, emptyMessage = "No apartments match your search." }) => {
    const navigate = useNavigate();
    // Tracks in-flight save/unsave calls per-lodge so rapid double-clicks don't fire twice.
    const [pendingIds, setPendingIds] = useState(new Set());
    // Tracks which "Message Owner" click is in flight.
    const [openingChatFor, setOpeningChatFor] = useState(null);

    const handleMessageOwner = async (e, lodge) => {
        e.preventDefault();
        if (!lodge.landlord?.id) {
            hyveError("Can't start chat", "This listing has no landlord on record.");
            return;
        }
        setOpeningChatFor(lodge.id);
        try {
            // Real fix: this used to be a static Link to /user/chats (or even a
            // hardcoded /user/conversation/1 on ApartmentDetails) regardless of which
            // listing/landlord was involved. Now opens/creates the real room for this
            // specific landlord.
            const room = await createOrGetChatRoom(lodge.landlord.id);
            navigate(`/user/conversation/${room.id}`);
        } catch (err) {
            hyveError("Couldn't open chat", err.message || "Please try again.");
        } finally {
            setOpeningChatFor(null);
        }
    };

    const handleToggleSave = async (e, lodgeId) => {
        e.preventDefault();
        e.stopPropagation();

        if (pendingIds.has(lodgeId)) return;
        setPendingIds((prev) => new Set(prev).add(lodgeId));

        const currentlySaved = savedIds.has(lodgeId);
        try {
            if (currentlySaved) {
                await unsaveProperty(lodgeId);
            } else {
                await saveProperty(lodgeId);
            }
            onSavedChange?.(lodgeId, !currentlySaved);
        } catch (err) {
            hyveError("Something went wrong", err.message || "Couldn't update saved apartments.");
        } finally {
            setPendingIds((prev) => {
                const next = new Set(prev);
                next.delete(lodgeId);
                return next;
            });
        }
    };

    if (!lodges || lodges.length === 0) {
        return (
            <section className='mt-4 md:mt-6'>
                <p className='py-12 text-sm text-center text-[#AAAAAA]'>{emptyMessage}</p>
            </section>
        );
    }

    return (
        <>
            <section className='mt-4 md:mt-6'>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-1 md:gap-6 lg:grid-cols-2">
                    {lodges.map((lodge) => {
                        const saved = savedIds.has(lodge.id);
                        return (
                        <div key={lodge.id} className='border border-[#FF630033] rounded-[8px] p-2 md:mb-2 md:p-0 sm:border-0 '>
                            {/* lodge image */}
                            <div className="rounded-[6px] relative overflow-hidden w-full h-[280px] sm:h-[300px] sm:rounded-[16px]">
                                <Link to={`/user/apartment/${lodge.id}`}>
                                    <img 
                                        src={lodge.lodgeImage || placeholderImage} 
                                        alt={lodge.lodgeDesc || "Apartment"} 
                                        className='object-cover w-full h-full' 
                                        onError={(e) => { e.target.src = placeholderImage; }}
                                    />
                                </Link>

                                {/* Floating Vacancy Status Badge on Image */}
                                <div className="absolute top-3 left-3 z-10">
                                    <span className={`text-[11px] font-semibold px-3 py-1 rounded-full shadow-sm flex items-center gap-1.5 backdrop-blur-xs ${
                                        lodge.status === 'open' || lodge.status === 'ACTIVE'
                                            ? 'bg-white/95 text-[#1B784D] border border-[#10B981]/30'
                                            : 'bg-black/70 text-white'
                                    }`}>
                                        <span className={`w-2 h-2 rounded-full ${
                                            lodge.status === 'open' || lodge.status === 'ACTIVE'
                                                ? 'bg-[#10B981] animate-pulse'
                                                : 'bg-gray-400'
                                        }`}></span>
                                        {lodge.status === 'open' || lodge.status === 'ACTIVE' ? 'Vacant' : 'Occupied'}
                                    </span>
                                </div>

                                {/* save apartment button — calls the real save/unsave endpoints */}
                                <button
                                    aria-label={saved ? "Unsave apartment" : "Save apartment"}
                                    onClick={(e) => handleToggleSave(e, lodge.id)}
                                    disabled={pendingIds.has(lodge.id)}
                                    className='absolute z-10 p-2 bg-white rounded-full shadow-sm cursor-pointer right-3 top-3 md:right-6 md:top-6 disabled:opacity-50'
                                >
                                    {saved
                                        ? <BsHeartFill className='text-primary sm:text-[16px] md:text-[20px]' />
                                        : <BsHeart className='text-primary sm:text-[16px] md:text-[20px]' />}
                                </button>
                            </div>
                            
                            {/* lodge details */}
                            <div>
                                {/* Price (Visible only on smaller screens) */}
                                <div className="mt-4 sm:hidden">
                                    <p className="text-sm font-semibold text-[#FF6300]">
                                        ₦ {Number(lodge.price || 0).toLocaleString()} <span className="text-xs font-normal text-[#888888]">/ month</span>
                                    </p>
                                </div>
                                <div className="flex items-start justify-between gap-3 mb-1 sm:mt-4">
                                    <Link to={`/user/apartment/${lodge.id}`} className="flex-1 min-w-0">
                                        <h3 className="font-poppins text-[14px] md:text-[16px] font-medium line-clamp-2 hover:text-primary transition-colors">
                                            {lodge.lodgeDesc}
                                        </h3>
                                    </Link>
                                    <div className="flex-shrink-0 hidden text-right sm:block">
                                        <p className="text-sm font-semibold text-primary md:text-[16px] whitespace-nowrap">
                                            ₦ {Number(lodge.price || 0).toLocaleString()}
                                        </p>
                                        <p className="text-[10px] md:text-[12px] font-light capitalize text-[#888888]">
                                            per month
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* lodge location estimation & status tags */}
                            <div className="flex flex-wrap items-center gap-2 mt-1 md:mt-2" >
                                <p className="text-[12px] md:text-sm mr-2 text-[#666666] sm:text-black">{lodge.nearbyDistance}</p>
                                {lodge.distanceKm != null && (
                                    <span className="inline-flex items-center gap-1 bg-[#EEF2FF] text-[#4F46E5] text-[10px] md:text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-[#C7D2FE]">
                                        📍 {lodge.distanceKm < 1 ? `${Math.round(lodge.distanceKm * 1000)}m away` : `${lodge.distanceKm.toFixed(1)} km away`}
                                    </span>
                                )}
                                <span className="inline-flex items-center bg-[#DDFFE7] text-[#1B784D] text-[10px] md:text-[10px] px-2.5 sm:px-4 rounded-md py-[.18rem] md:py-[.2rem] font-semibold">
                                    Verified
                                </span>
                                <span className={`inline-flex items-center text-[10px] md:text-[10px] px-2.5 sm:px-4 rounded-md py-[.18rem] md:py-[.2rem] font-bold capitalize ${
                                    lodge.status === 'open' || lodge.status === 'ACTIVE'
                                        ? 'bg-[#FF63001F] text-[#FF6300] border border-[#FF630033]'
                                        : 'bg-gray-100 text-gray-600'
                                }`}>
                                    {lodge.status === 'open' || lodge.status === 'ACTIVE' ? 'Vacant' : lodge.status}
                                </span>
                            </div>

                            <div className="flex flex-wrap items-center justify-between mt-2 md:mt-3 ">
                                <div className="flex items-center">
                                    <span className="relative top-[-1.5px] text-[#F6D100] text-[18px] sm:text-[20px] pr-1"><IoStarSharp /></span>
                                    <span className="pr-2 sm:pr-3">
                                        <p className="pb-0 mb-0 text-xs sm:text-sm font-bold">{lodge.starRating}</p>
                                    </span>

                                    <span><p className="text-[11px] sm:text-[12px] font-light text-gray-500">{lodge.totalReviews} reviews</p></span>
                                </div>

                                {/* Amenities */}
                                <div className='hidden sm:block'>
                                    <p className="text-[12px] font-light text-gray-500">{lodge.amenities}</p>
                                </div>
                            </div>

                            {/* CTA Buttons (Visible on both Mobile and Desktop) */}
                            <div className="flex gap-2.5 sm:gap-4 mt-3 sm:mt-6">
                                <Link to={`/user/apartment/${lodge.id}`} className='flex-1 py-2 sm:py-2.5 text-white rounded-lg sm:rounded-xl shadow-xs bg-primary hover:bg-primary-hover smooth-transition text-[12px] sm:text-[14px] text-center font-medium flex items-center justify-center'>
                                    Explore Property
                                </Link>

                                <button
                                    type='button'
                                    onClick={(e) => handleMessageOwner(e, lodge)}
                                    disabled={openingChatFor === lodge.id}
                                    className="flex-1 py-2 sm:py-2.5 text-black bg-transparent border-2 rounded-lg sm:rounded-xl shadow-xs border-primary/60 hover:bg-primary/5 smooth-transition text-[12px] sm:text-[14px] text-center font-medium disabled:opacity-50"
                                >
                                    {openingChatFor === lodge.id ? "Opening..." : "Message Owner"}
                                </button>
                            </div>
                        </div>
                        );
                    })}
                </div >
            </section >
        </>
    )
}

export default AllApartments
