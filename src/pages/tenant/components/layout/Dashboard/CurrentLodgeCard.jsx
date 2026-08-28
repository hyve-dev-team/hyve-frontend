
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PiBuildingApartmentFill } from "react-icons/pi";
import { getCurrentLodge, subscribeToCurrentLodgeChanges } from '../../../../../utils/currentLodge'

const CurrentLodgeCard = () => {
    // Reads the real booked apartment (set in Reservation.jsx on payment success)
    // instead of the previous hardcoded "Lid Lodge" that always showed regardless
    // of whether the tenant had actually booked anything.
    const [lodge, setLodge] = useState(() => getCurrentLodge());

    useEffect(() => {
        const sync = () => setLodge(getCurrentLodge());
        const unsubscribe = subscribeToCurrentLodgeChanges(sync);
        return unsubscribe;
    }, []);

    // No booking yet: match the original intent ("only visible if user has a
    // current lodge status") instead of always rendering placeholder data.
    if (!lodge) {
        return null;
    }

    const expiryLabel = lodge.rentExpiryDate
        ? new Date(lodge.rentExpiryDate).toLocaleDateString(undefined, {
              day: "numeric",
              month: "short",
              year: "numeric",
          })
        : "—";

    return (
        <>
            <div className='w-full bg-primary rounded-[8px] sm:rounded-[16px] p-4 lg:p-6'>
                <div className='pt-2 pb-0 lg:pt-3 lg:pb-2'>

                    <div className='text-white'>
                        <p className='font-medium leading-none text-[12px] sm:text-sm'>Current Lodge</p>
                        <h2 className='font-bold text-[22px] lg:text-[36px]'>{lodge.name}</h2>
                    </div>

                    <div className='relative flex flex-col mt-4 lg:justify-between lg:items-end lg:mr-7 lg:-mt-6 lg:flex-row'>
                        <p className='font-medium text-[12px] sm:text-sm text-white'>Rent Expiry Date: {expiryLabel}</p>

                        <Link to="/user/apartment/manage" className='bg-white hover:bg-gray smooth-transition mt-3 rounded-full py-2 shadow-sm w-full flex items-center gap-2 justify-center font-normal sm:w-[70%] lg:w-[25%] lg:py-2'>
                            <button className='flex items-center gap-2 sm:py-1 justify-center font-normal text-sm md:text-[16px]'>
                                Manage Apartment
                                <PiBuildingApartmentFill className='text-[26px] lg:text-[30px] text-primary' />
                            </button>
                        </Link>
                    </div>

                </div>
            </div>
        </>
    )
}

export default CurrentLodgeCard
