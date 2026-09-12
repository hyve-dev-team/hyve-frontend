import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { IoStarSharp } from 'react-icons/io5';
import { getProperties } from '../../utils/propertiesApi';
import { mapProperties } from '../../utils/mapProperty';
import placeholderImage from "../../assets/images/apartments/apartment-image-1.png";

const LodgeItem = () => {
    const [lodges, setLodges] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        getProperties({ page: 0, size: 6 })
            .then((data) => {
                if (!cancelled && data?.content) {
                    setLodges(mapProperties(data.content));
                }
            })
            .catch((err) => {
                console.error("Failed to load featured properties from API:", err);
            })
            .finally(() => {
                if (!cancelled) setIsLoading(false);
            });
        return () => { cancelled = true; };
    }, []);

    if (isLoading) {
        return (
            <div className="py-12 text-center text-sm text-[#AAAAAA]">
                Loading verified apartments...
            </div>
        );
    }

    if (!lodges || lodges.length === 0) {
        return (
            <div className="py-12 text-center text-sm text-[#AAAAAA]">
                No apartments listed at the moment.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {lodges.map((lodge) => (
                <div key={lodge.id} className="flex flex-col justify-between">
                    <div>
                        {/* lodge image */}
                        <div className="rounded-[15px] overflow-hidden h-48 bg-gray-100">
                            <img
                                src={lodge.lodgeImage || placeholderImage}
                                alt={lodge.lodgeDesc}
                                onError={(e) => { e.target.onerror = null; e.target.src = placeholderImage; }}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* lodge details */}
                        <div>
                            <div className="flex items-center justify-between mt-4 mb-1">
                                <h3 className="font-poppins text-[14px] md:text-[16px] font-medium truncate max-w-[65%]">
                                    {lodge.lodgeDesc}
                                </h3>
                                <p className="text-sm font-semibold text-primary md:text-[16px]">
                                    ₦ {Number(lodge.lodgePrice || 0).toLocaleString()}
                                </p>
                            </div>
                            <span className="leading-none text-right block">
                                <p className="text-[10px] md:text-[12px] font-light capitalize text-[#888888]">per year</p>
                            </span>
                        </div>

                        {/* lodge location estimation */}
                        <div className="flex items-center gap-4 mt-2">
                            <p className="text-[12px] md:text-[14px] text-gray-600 truncate">{lodge.nearbyDistance || "Verified Location"}</p>
                            <span className="bg-[#DDFFE7] text-[#1B784D] text-[10px] md:text-[12px] px-3 rounded-md py-[.15rem] shrink-0 font-medium">
                                Verified
                            </span>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                            <div className="items-center flex">
                                <span className="relative top-[-1.5px] text-[#F6D100] text-[18px] pr-1"><IoStarSharp /></span>
                                <span className="pr-2">
                                    <p className="pb-0 mb-0 text-sm font-bold">{lodge.ratings ? Number(lodge.ratings).toFixed(1) : "New"}</p>
                                </span>
                                <span><p className="text-[12px] font-light text-[#888888]">{lodge.reviews?.length || 0} reviews</p></span>
                            </div>

                            {/* amenities */}
                            <div className="truncate max-w-[50%] text-right">
                                <p className="text-[12px] font-light text-[#888888] truncate">{lodge.amenities || "Furnished"}</p>
                            </div>
                        </div>
                    </div>

                    {/* Lodge CTA */}
                    <div className="flex gap-3 mt-6">
                        <Link
                            to={`/user/apartment/${lodge.id}`}
                            className="w-1/2 py-2 text-white rounded-lg shadow-md bg-primary hover:bg-primary-hover smooth-transition text-[12px] sm:text-[14px] text-center font-medium flex items-center justify-center"
                        >
                            View Details
                        </Link>
                        <Link
                            to={`/user/apartment/review/${lodge.id}`}
                            className="w-1/2 py-2 text-black bg-transparent border-2 rounded-lg shadow-sm border-primary hover:bg-gray-50 smooth-transition text-[12px] sm:text-[14px] text-center font-medium flex items-center justify-center"
                        >
                            Check Reviews
                        </Link>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default LodgeItem;