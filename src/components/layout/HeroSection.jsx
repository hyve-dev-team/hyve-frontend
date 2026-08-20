import { HiRocketLaunch } from "react-icons/hi2";
import StackedImages from "../ui/StackedImages";
import { Link } from "react-router-dom";

const HeroSection = () => {
    return (
        <section className="container pt-20 pb-20 md:pt-14 md:pb-14" id="home">
            <div className="flex gap-4 flex-col lg:w-[90%] mx-auto md:flex-row md:items-center">
                {/* left component */}
                <div className="w-full md:pr-4 md:w-[50%] ">
                    {/* Welcome To HYVE */}
                    <h1 className="text-[24px] sm:text-[40px] font-normal leading-tight">
                        Welcome To <br />
                        <span className="font-semibold text-primary">HYVE</span>
                    </h1>

                    {/* Sub-text */}
                    <p className="mt-6 sm:mt-8 capitalize text-[14px] sm:text-[1rem]">
                        Search & Discover <span className="text-primary">Apartments</span>
                        <br />
                        Near Your Campus.
                    </p>

                    {/* Hero section CTA button */}
                    <Link to="/onboarding">
                        <button className="md:w-[80%] w-full">
                            <div className="flex p-[.2rem] md:p-[.3rem] mt-6 overflow-hidden border hover:border-primary border-primary/70 rounded-full sm:p-2 lg:max-w-md items-center shadow-sm bg-primary-light hover:shadow-md smooth-transition">
                                <div className="px-6 py-[.5rem] sm:px-4 sm:py-[.5rem] text-white rounded-full bg-primary">
                                    <HiRocketLaunch className="w-[14px] sm:w-[28px]" />
                                </div>

                                <div className="w-full">
                                    <p className="relative right-4 text-[12px] font-normal sm:text-sm  font-poppins text-black">Get Started</p>
                                </div>
                            </div>
                        </button>
                    </Link>
                </div>

                {/* right content */}
                <div className="flex items-center justify-center w-full px-6 mt-10 overflow-hidden sm:mt-12 lg:mt-0 md:w-[60%] relative bg-white faded-mask">
                    <StackedImages />
                </div>
            </div>
        </section>
    )
}

export default HeroSection