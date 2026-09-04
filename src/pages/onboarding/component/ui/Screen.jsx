import { Link } from 'react-router-dom'

const Screen = ({ avatar, subText, heading }) => {

    return (
        <div className="flex items-center justify-center min-h-[80svh]">
            <div className='flex flex-col items-center justify-center w-full md:mt-10'>
                <div className='overflow-hidden w-[80%] sm:w-[270px]'>
                    <img src={avatar} alt="onboarding iluustration" className='object-cover w-full' />
                </div>

                {/*  */}
                <div className='w-full text-center mt-14 sm:mt-8'>
                    <p className='text-[12px] font-light uppercase md:text-sm font-inter'>{subText}</p>
                    <h3 className='capitalize lg:w-[70%] sm:w-[70%] mx-auto font-inter font-medium md:leading-8 mt-2 md:mt-1 text-[18px] md:text-[24px]'>{heading}</h3>
                </div>
            </div>
        </div>
    )
}

export const PreSignupScreen = ({ icon1, icon2 }) => {
    return (
        <>
            <div>
                <h4 className='text-center font-montserrat font-semibold xs:text-[16px] text-xl'>
                    Which are you?
                </h4>

                <div className='flex items-center mt-16 gap-20 sm:gap-32'>

                    <div className='flex items-center flex-col'>
                        <Link to="/auth/signup/landlord" className='border-2 p-4 sm:p-6 rounded-full border-[#FF630080] shadow-sm hover:scale-[1.05] smooth-transition'>
                            {/* Icon wrapper */}
                            <div className='w-[40px] sm:w-[60px] overflow-hidden'>
                                <img src={icon1} alt="house-icon" className='w-full object-cover' />
                            </div>
                        </Link>

                        <p className='text-primary font-medium mt-4 xs:text-sm font-montserrat'>Landlord</p>
                    </div>

                    <div className='flex items-center flex-col'>
                        <Link to="/auth/signup/user" className='border-2 p-4 sm:p-6 rounded-full border-[#FF630080] shadow-sm hover:scale-[1.05] smooth-transition'>
                            {/* Icon wrapper */}
                            <div className='w-[40px] sm:w-[60px] overflow-hidden'>
                                <img src={icon2} alt="house-icon" className='w-full object-cover' />
                            </div>
                        </Link>

                        <p className='text-primary font-medium mt-4 xs:text-sm font-montserrat'>User</p>
                    </div>

                </div>
            </div>
        </>
    )
}

export default Screen