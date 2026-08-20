import { useParams, Link } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";
import Header from "../Dashboard/Header";
import MobileNavigationTab from "../MobileNavigation/MobileNavigationTab";
import { BsPeople } from "react-icons/bs";
import { IoTimeOutline } from "react-icons/io5";
import useFetchApartment from "../../../../../hooks/useFetchApartment";
import { BiErrorCircle } from "react-icons/bi";

const ApartmentQueue = () => {

    const { apartmentID } = useParams();

    const { apartment, isLoading, error } = useFetchApartment(apartmentID);

    // Queue data (safe now)
    const queue = {
        position: 1,
        // position: 3,
        queueSize: 7,
        peopleAhead: 0,
        // peopleAhead: 2,
        // status: "WAITING",
        status: "ACTIVE",
        timeRemaining: "08:24:15"
    };

    return (
        <>
            <div className="page-wrapper">
                <div className="flex">

                    {/* Sidebar */}
                    <Sidebar />

                    {/* Main Content */}
                    <main className="w-full h-[100svh] sm:w-[70%] lg:w-[80%] overflow-auto">

                        <Header />

                        <div className="px-3 mt-8 pb-28 sm:pb-16 sm:px-6 lg:px-[20%]">

                            {/* Title */}

                            <h2 className="font-poppins text-[20px] font-semibold mb-6">
                                Apartment Queue
                            </h2>

                            {/* Queue Card */}
                            {isLoading ?
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

                                        <div className="border border-[#FF630033] rounded-[8px] p-2 md:p-2">

                                            {/* Image */}

                                            <div className="rounded-[6px] relative overflow-hidden w-full h-[280px] sm:h-[300px] sm:rounded-[16px]">

                                                <img
                                                    src={apartment.lodgeImage}
                                                    alt="apartment"
                                                    className="object-cover w-full h-full"
                                                />

                                                {/* Status badge */}

                                                <span
                                                    className={`absolute top-4 left-4 px-4 py-[.2rem] text-[10px] rounded-md
                                                        ${queue.status === "ACTIVE"
                                                            ? "bg-[#DDFFE7] text-[#1B784D]"
                                                            : "bg-primary text-white"
                                                        }`}
                                                >
                                                    {queue.status}
                                                </span>

                                            </div>

                                            {/* Details */}

                                            <div className="p-3 sm:p-4">

                                                <div className="flex justify-between items-start">

                                                    <h3 className="font-poppins text-[16px] font-medium">
                                                        {apartment.lodgeDesc}
                                                    </h3>

                                                    <div className="text-right">
                                                        <p className="text-primary font-medium">
                                                            ₦ {apartment.price}
                                                        </p>
                                                        <p className="text-[10px]">per year</p>
                                                    </div>

                                                </div>

                                                {/* Queue info */}

                                                <div className="mt-4 space-y-2">

                                                    <div className="flex items-center gap-2">
                                                        <BsPeople className="text-primary" />
                                                        <p className="text-[14px]">
                                                            Your position:
                                                            <span className="font-semibold ml-1">
                                                                #{queue.position}
                                                            </span>
                                                            {" "}of {queue.queueSize}
                                                        </p>
                                                    </div>

                                                    <p className="text-[12px] text-[#AAAAAA]">
                                                        {queue.peopleAhead} people ahead of you
                                                    </p>

                                                </div>

                                                {/* Timer */}

                                                {queue.status === "ACTIVE" && (

                                                    <div className="flex items-center gap-2 mt-4 text-primary">

                                                        <IoTimeOutline />

                                                        <p className="font-semibold text-[14px]">
                                                            {queue.timeRemaining} remaining
                                                        </p>

                                                    </div>

                                                )}

                                                {/* Actions */}

                                                <div className="flex gap-3 mt-6">

                                                    {queue.status === "WAITING" && (
                                                        <button className="w-1/2 py-2 border border-primary text-primary rounded-lg text-[12px]">
                                                            Leave Queue
                                                        </button>
                                                    )}

                                                    {queue.status === "ACTIVE" && (
                                                        <>
                                                            <Link
                                                            to={`/user/apartment/reserve/${queue.id}`}
                                                            className="flex items-center justify-center w-1/2 py-2 text-white rounded-lg shadow-md bg-primary hover:bg-primary-hover smooth-transition text-[12px] sm:text-[14px]"
                                                        >
                                                            Commit
                                                        </Link>

                                                        <Link  className="flex items-center justify-center w-1/2 py-2 border border-primary text-primary rounded-lg text-[12px]">
                                                            Pass
                                                        </Link>
                                                        </>
                                                    )}

                                                </div>

                                                {/* View Property */}

                                                <div className="mt-4">

                                                    <Link
                                                        to={`/user/apartment/${apartment.id}`}
                                                        className="text-primary text-[12px] underline"
                                                    >
                                                        View Apartment Details
                                                    </Link>

                                                </div>

                                            </div>

                                        </div>
                                    </>}
                        </div>

                    </main>

                </div>

                {/* Mobile navigation */}

                {/* <MobileNavigationTab currentTab={"queues"} /> */}

            </div>
        </>
    );
};

export default ApartmentQueue;