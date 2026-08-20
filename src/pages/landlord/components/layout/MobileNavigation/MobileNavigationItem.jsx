import React from 'react'
import { Link } from 'react-router-dom'

const MobileNavigationItem = ({ to, icon: Icon, label, isActive, onClick, className }) => {
    return (
        <>
            <Link to={to}>
                <button className='flex items-center flex-col smooth-transition' onClick={onClick}>
                    {
                        isActive ?
                            <>
                                <span className='bg-primary p-3 rounded-full relative shadow-[0px_2px_3px_rgba(255,99,0,0.5)]'>
                                    <Icon className={`${className} text-white text-[20px]`} />
                                </span>
                            </>
                            :
                            <>
                                <span className='bg-transparent px-3 pt-2 rounded-full relative'>
                                    <Icon className={`${className} text-[#484C52] text-[20px]`} />
                                </span>
                                <span className='text-[#484C52] text-[12px] font-normal'>{label}</span>
                            </>
                    }
                </button>
            </Link>
        </>
    )
}

export default MobileNavigationItem