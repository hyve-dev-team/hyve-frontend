import { IoStarSharp } from 'react-icons/io5'
import featuredLodge1 from "../../assets/images/need-a-new-tenant-2.png"
import featuredLodges from '../../utils/featuredLodges';

import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const LodgeItem = () => {

    return (
        < >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredLodges.map((lodge) => (
                    <div key={lodge.id}>
                        {/* lodge image */}
                        <div className="rounded-[15px] overflow-hidden">
                            <img src={featuredLodge1} alt="featured lodge" className="" />
                        </div>

                        {/* lodge details */}
                        <div>
                            <div className="flex items-center justify-between mt-4 mb-1">
                                <h3 className="font-poppins text-[14px] md:text-[16px] font-medium trunc">
                                    Newly Built 2 Bedroom Flat</h3>
                                <p className="text-sm font-normal text-primary md:text-[16px]">₦ 250000</p>
                            </div>
                            <span className="leading-none text-right">
                                <p className="text-[10px] md:text-[12px] font-light capitalize">per year</p>
                            </span>
                        </div>

                        {/* lodge location estimation */}
                        <div className="flex items-center gap-4 mt-2">
                            <p className="text-[12px] md:text-[14px]">2.1 km from Unilag</p>
                            <span className="bg-[#DDFFE7] text-[#1B784D] text-[10px] md:text-[12px] px-4 rounded-sm md:rounded-md md:py-[.2rem] py-[.15rem]">Verified </span>
                        </div>

                        <div className="flex items-center justify-between mt-3 ">
                            <div className="items-center hidden sm:flex">
                                <span className="relative top-[-1.5px] text-[#F6D100] text-[20px] pr-1"><IoStarSharp /></span>
                                <span className="pr-3">
                                    <p className="pb-0 mb-0 text-sm font-bold">4.8</p>
                                </span>

                                <span><p className="text-[12px] font-light">12 reviews</p></span>
                            </div>

                            {/* amenities */}
                            <div className="">
                                <p className="text-[12px] font-light">Electricity ~ Wifi ~ Running Water ~ +1</p>
                            </div>
                        </div>

                        {/* Lodge CTA */}
                        <div className="flex gap-4 mt-6">
                            <button className="w-1/2 py-2 text-white rounded-lg shadow-md bg-primary hover:bg-primary-hover smooth-transition text-[12px] sm:text-[14px]">Chat with Landlord</button>
                            <button className="w-1/2 py-2 text-black bg-transparent border-2 rounded-lg shadow-md border-primary hover:bg-gray smooth-transition text-[12px] sm:text-[14px]">check reviews</button>
                        </div>
                    </div>
                ))}
            </div>
        </>
    )
}

export default LodgeItem