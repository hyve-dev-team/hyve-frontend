import Sidebar from '../Sidebar/Sidebar'
import Header from '../Dashboard/Header'
import MobileNavigationTab from '../MobileNavigation/MobileNavigationTab'
import { IoTimeOutline } from "react-icons/io5"
import { BsPeople } from "react-icons/bs"
import { Link, useNavigate } from "react-router-dom"
import featuredLodges from '../../../../../utils/featuredLodges'
import { toast } from "sonner"


const queues = [
    {
        id: 1,
        property: "Luxury Studio Apartment",
        image: featuredLodges[1].lodgeImage,
        position: 3,
        total: 7,
        status: "WAITING",
        price: "450,000",
        peopleAhead: 2,
        timeRemaining: null
    },
    {
        id: 2,
        property: "Modern Self-Contain Apartment",
        image: featuredLodges[2].lodgeImage,
        position: 1,
        total: 5,
        status: "ACTIVE",
        price: "650,000",
        peopleAhead: 0,
        timeRemaining: "08:24:15"
    }
]



const MyQueues = () => {
    const navigate = useNavigate()

    const handlePass = () => {

    }

    return (
        <>
            <div className='page-wrapper'>
                <div className='flex'>

                    <Sidebar currentPage={"queues"} />

                    <main className='w-full h-[100svh] sm:w-[70%] lg:w-[80%] overflow-auto'>

                        <Header />

                        <div className='px-3 mt-8 pb-28 sm:pb-16 sm:px-6 lg:px-8'>

                            <h2 className="text-[20px] font-semibold mb-6 font-poppins">
                                My Queues
                            </h2>

                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

                                {queues.map((queue) => (

                                    <div
                                        key={queue.id}
                                        className='border border-[#FF630033] rounded-[8px] p-2 md:p-0'
                                    >

                                        {/* Property Image */}

                                        <div className="rounded-[6px] relative overflow-hidden w-full h-[260px] sm:h-[280px] sm:rounded-[16px]">

                                            <img
                                                src={queue.image}
                                                alt="property"
                                                className="object-cover w-full h-full"
                                            />

                                            {/* Status badge */}

                                            <span className={`absolute top-4 left-4 px-4 py-[.2rem] text-[10px] rounded-md
                                            ${queue.status === "ACTIVE"
                                                    ? "bg-[#DDFFE4] text-[#1B784D]"
                                                    : "bg-primary text-white"}`
                                            }>
                                                {queue.status}
                                            </span>

                                        </div>

                                        {/* Property Info */}

                                        <div className="p-2 sm:p-4">

                                            <div className="flex items-start justify-between gap-3 mb-2">

                                                <h3 className="font-poppins text-[14px] md:text-[16px] font-medium line-clamp-2">
                                                    {queue.property}
                                                </h3>

                                                <div>
                                                    <p className="text-primary text-[14px] font-medium">
                                                        ₦ {queue.price}
                                                    </p>
                                                    <p className="text-[10px] text-right">per year</p>
                                                </div>

                                            </div>

                                            {/* Queue Position */}

                                            <div className="flex items-center gap-3 mt-2">

                                                <BsPeople className="text-primary" />

                                                <p className="text-[13px]">
                                                    Position <span className="font-semibold">#{queue.position}</span> of {queue.total}
                                                </p>

                                            </div>

                                            {/* People ahead */}

                                            <p className="text-[12px] text-[#AAAAAA] mt-1">
                                                {queue.peopleAhead} people ahead of you
                                            </p>

                                            {/* Active timer */}

                                            {queue.status === "ACTIVE" && (

                                                <div className="flex items-center gap-2 mt-3 text-[#FF6300]">

                                                    <IoTimeOutline />

                                                    <p className="font-semibold text-[14px]">
                                                        {queue.timeRemaining} remaining
                                                    </p>

                                                </div>

                                            )}

                                            {/* Buttons */}

                                            <div className="flex gap-3 mt-4">

                                                {queue.status === "WAITING" && (

                                                    <Link className="flex items-center justify-center w-1/2 py-2 border border-primary text-primary rounded-lg text-[12px]">
                                                        Leave Queue
                                                    </Link>

                                                )}

                                                {queue.status === "ACTIVE" && (

                                                    <>
                                                        <Link
                                                            to={`/user/apartment/reserve/${queue.id}`}
                                                            className="flex items-center justify-center w-1/2 py-2 text-white rounded-lg shadow-md bg-primary hover:bg-primary-hover smooth-transition text-[12px] sm:text-[14px]"
                                                        >
                                                            Commit
                                                        </Link>

                                                        <Link to={handlePass()} className="flex items-center justify-center w-1/2 py-2 border border-primary text-primary rounded-lg text-[12px]">
                                                            Pass
                                                        </Link>
                                                    </>

                                                )}

                                            </div>

                                            {/* Explore property */}

                                            <div className="mt-4">

                                                <Link
                                                    to={`/user/apartment/${queue.id}`}
                                                    className="text-[12px] text-primary underline"
                                                >
                                                    View Property
                                                </Link>

                                            </div>

                                        </div>

                                    </div>

                                ))}

                            </div>

                        </div>

                    </main>

                </div>

                <MobileNavigationTab currentTab={"queues"} />

            </div>
        </>
    )
}

export default MyQueues