"use client"

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion';
import Preloader from '../../components/preloader/Preloader';
import slideVariants from '../../utils/slideVariant';

/* images */
import vector1 from "../../assets/svg/onboarding/vector-1.svg"
import vector2 from "../../assets/svg/onboarding/vector-2.svg"
import vector3 from "../../assets/svg/onboarding/vector-3.svg"
import vector4 from "../../assets/svg/onboarding/vector-4.svg"
import houseIcon from "../../assets/svg/onboarding/house-icon.svg"
import userSearchIcon from "../../assets/svg/onboarding/user-icon.svg"

/* icons */
import { RxTrackNext } from "react-icons/rx";
import { IoIosArrowDropright } from "react-icons/io";
import { IoIosArrowBack } from "react-icons/io";

/* onboarding screen content component */
import Screen, { PreSignupScreen } from './component/ui/Screen'

const Onboarding = () => {
    // creating heading content as variable, so they can be passed as props because they comtain html tags
    const screen1Heading = (
        <>
            discover <span className="text-primary">verified</span> student housing around your campus. safe and <span className='text-primary'>easy to rent</span>
        </>
    );
    const screen2Heading = (
        <>
            <span className="text-primary">Search</span> & <span className="text-primary">discover</span> apartments near your campus.
        </>
    );
    const screen3Heading = (
        <>
            Book your place & make payments safely in <span className="text-primary">one app</span>.
        </>
    );
    const screen4Heading = (
        <>
            Connect with landlords, track payments & <span className="text-primary">enjoy your stay</span>.
        </>
    );


    /* Slide Functionality */
    const [isLoading, setIsLoading] = useState(true);
    const [step, setStep] = useState(1);
    const [direction, setDirection] = useState(1);
    const [progressBarPercent, setProgressBarPercent] = useState("w-[25%]");

    /* stimulating a delay of 180ms to display the preloader*/
    useEffect(() => {
        setTimeout(() => {
            setIsLoading(false)
        }, 2000)
    }, [])


    // number of screen/step to be displayed
    const totalSteps = 5;

    /* if step is less than total steps, increase value of steps by 1 */
    const nextStep = () => {
        if (step < totalSteps) {
            setDirection(1);
            setStep(step + 1);
        }
    };

    /* Skip: subtract  current step from the totalsteps, and add the result to step */
    const skip = () => {
        let remainingSteps = totalSteps - step;
        setStep(step + remainingSteps)
    }

    // increase progress bar
    useEffect(() => {
        if (step == 1) {
            setProgressBarPercent("w-[25%]")
        } else if (step === 2) {
            setProgressBarPercent("w-[50%]")
        } else if (step === 3) {
            setProgressBarPercent("w-[75%]")
        } else if (step === 4) {
            setProgressBarPercent("w-[100%]")
        }
    }, [step]) // Re-run function when value of 'step' changes


    return (
        <>
            {/* Preloader component */}
            <Preloader isLoading={isLoading} />

            {/* Preload all onboarding screen resources by rendering them off-screen */}
            <div className='pointer-events-none z-[-1] opacity-0 absolute w-0'>
                <img src={vector1} alt="Preload Vector 1" />
                <img src={vector2} alt="Preload Vector 2" />
                <img src={vector3} alt="Preload Vector 3" />
                <img src={vector4} alt="Preload Vector 4" />
                <img src={houseIcon} alt="Preload House Icon" />
                <img src={userSearchIcon} alt="Preload User Icon" />
            </div>

            <main className="container relative pt-4 pb-12 md:pb-4">
                {/* conditionally display the top component if user is not on the 5th step screen*/}
                {step < 5 && (
                    <>
                        {/* Top compoent - quick links, progress bar adn skip btn */}
                        <div className="flex items-center justify-between gap-6 md:gap-10">
                            <div className='items-center hidden gap-6 lg:flex'>
                                <Link to="/" className='flex items-center gap-1 hover:text-primary smooth-transition'>
                                    <IoIosArrowBack />
                                    <p className='text-sm font-light leading-none'>Home</p>
                                </Link>
                            </div>

                            {/* onboarding progress bar */}
                            <div className='relative w-[90%] lg:w-[40%] lg:right-5'>
                                <div className='absolute w-full h-1 bg-[#D9D9D9] rounded-full'></div>
                                <div className={`bg-primary absolute h-1 rounded-full ${progressBarPercent} transition-w duration-700`}></div>
                            </div>

                            {/* skip button */}
                            <div>
                                <button className='flex items-center gap-1 text-[12px] font-normal sm:text-sm md:hover:text-primary smooth-transition' onClick={skip}>
                                    <span>
                                        Skip
                                    </span>
                                    <span className='relative top-[.7px] md:top-[1.4px]'><RxTrackNext /></span>
                                </button>
                            </div>
                        </div>
                    </>
                )}

                {/* Main Screen Content  */}
                <div className='relative overflow-hidden h-[80vh]'>
                    <AnimatePresence initial={false} custom={direction} mode="wait">
                        <motion.div
                            key={step}
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            className='centralizeContent'
                        >
                            {step === 1 && <Screen avatar={vector1} subText="Find Your Own Space" heading={screen1Heading} btnValue="next" />}
                            {step === 2 && <Screen avatar={vector2} subText="Find Your TRIBE" heading={screen2Heading} btnValue="next" />}
                            {step === 3 && <Screen avatar={vector3} subText="Rent Without Stress" heading={screen3Heading} btnValue="next" />}
                            {step === 4 && <Screen avatar={vector4} subText="Move In, Live Better" heading={screen4Heading} btnValue="get started" />}
                            {step === 5 && <PreSignupScreen icon1={houseIcon} icon2={userSearchIcon} />}

                        </motion.div>
                    </AnimatePresence>
                </div>


                {/* conditionally display the top component if user is not on the 5th step screen*/}
                {step < 5 && (
                    <>
                        {/* Action Btn - next step */}
                        {step < 4 && (
                            <div className='absolute w-full pb-10 text-center -bottom-10 md:mt-6 md:pb-0'>
                                <button
                                    onClick={nextStep}
                                    className='onboardingBtn'>
                                    <span>next</span>
                                    <IoIosArrowDropright className='text-[16px]' />
                                </button>
                            </div>
                        )}

                        {/* Action Btn -  get started button */}
                        {step === 4 && (
                            <div className='absolute w-full pb-10 text-center -bottom-10 md:mt-6 md:pb-0'>
                                <button
                                    onClick={nextStep}
                                    className='onboardingBtn'>
                                    <span>get started</span>
                                    <IoIosArrowDropright className='text-[16px]' />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </main>
        </>
    )
}

export default Onboarding