import { Link } from 'react-router-dom'

{/* Reverse Payment Modal: This modal is displayed when user confirm to reverse payment after apartment tour */ }
const ReversePayment = ({ redirect, isReversePayment }) => {
    return (
        <>
            <div className={`fixed top-0 bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm offset ${isReversePayment ? 'block' : 'hidden'}`}>
                <div className='centralizeContent'>
                    <div className='bg-white w-[90%] sm:w-[60%] lg:w-[35%] desktop-lg:w-[30%] py-10 px-4 lg:py-14 lg:px-10 rounded-[30px] lg:rounded-[40px] flex items-center flex-col shadow-md'>

                        <div className='text-center'>
                            <h3 className='font-bold leading-none uppercase font-poppins text-base lg:text-[30px]'>Payment <br /> Reversed </h3>
                            <p className='px-4 mt-6 text-xs font-light md:text-sm'>Your Payment will be reverse back to your Account</p>
                        </div>

                        <Link to={redirect} className="relative w-[90%] lg:w-[80%] py-3 lg:py-4 mt-8 text-center text-white rounded-full  bg-primary hover:bg-primary-hover smooth-transition">
                            <button className='text-sm '>Find another Apartment</button>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ReversePayment