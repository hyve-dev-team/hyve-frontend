import { motion } from "framer-motion"
import { fadeIn } from "../../utils/animationVariants"

import searchIllustration from "../../assets/svg/Illustration/vector-img-1.svg"
import bookIllustration from "../../assets/svg/Illustration/vector-img-2.svg"
import moveInIllustration from "../../assets/svg/Illustration/vector-img-3.svg"
import stayUpdatedIllustration from "../../assets/svg/Illustration/vector-img-4.svg"

const HowItWorks = () => {
    return (
        <section className='bg-white'>
            <div className="container pt-16 pb-20">
                {/* smooth scroll in to view animation */}
                <motion.div variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}>
                    <div>
                        <h2 className="font-semibold text-center heading-responsive sm:font-normal">How it works</h2>

                        <div className="grid w-full grid-cols-1 gap-6 mt-6 lg:grid-cols-4 sm:grid-cols-2 sm:gap-3">

                            <motion.div className="bg-primary-light w-full px-8 pt-10 relative h-[320px] sm:h-[320px]"
                                whileHover={{
                                    y: -8,
                                }}>
                                <div className="text-center">
                                    <h3 className="font-bold text-primary leading-[1.2] text-[16px] md:text-[18px] lg:w-[80%] sm:w-[60%] md:w-[40%] mx-auto">Search &  Discover</h3>
                                    <p className="sm:font-extralight capitalize text-[14px] mt-2">Users search properties using filters</p>
                                </div>

                                {/* avatar */}
                                <div className="flex justify-center sm:mt-0">
                                    <div className="w-[190px] sm:w-[170px] absolute bottom-0">
                                        <img src={searchIllustration} alt="Search & Discover" className="object-cover w-full" />
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div className="bg-primary-light w-full  px-6 pt-10 relative h-[350px] sm:h-[320px]"
                                whileHover={{
                                    y: -8,
                                }}>
                                <div className="text-center">
                                    <h3 className="font-bold text-primary leading-[1.2] text-[16px] md:text-[18px]">Book & Pay <br /> securely </h3>
                                    <p className="sm:font-extralight capitalize text-[14px] mt-2 w-[80%] mx-auto sm:w-full">Rent handled through Hyve’s secure Payment Method</p>
                                </div>

                                {/* avatar */}
                                <div className="flex justify-center">
                                    <div className="w-[190px] sm:w-[170px] absolute bottom-0">
                                        <img src={bookIllustration} alt="Search & Discover" className="object-cover w-full" />
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div className="bg-primary-light w-full  px-8 pt-10 relative h-[350px] sm:h-[320px]"
                                whileHover={{
                                    y: -8,
                                }}>
                                <div className="text-center">
                                    <h3 className="font-bold text-primary leading-[1.2] text-[16px] md:text-[18px]">Move In with <br /> Confidence</h3>
                                    <p className="sm:font-extralight capitalize text-[14px] mt-2">Verified Listing means no Scam</p>
                                </div>

                                {/* avatar */}
                                <div className="flex justify-center">
                                    <div className="w-[150px] sm:w-[130px] absolute bottom-3">
                                        <img src={moveInIllustration} alt="Search & Discover" className="object-cover w-full" />
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div className="bg-primary-light w-full  px-8 pt-10 relative h-[320px] sm:h-[320px]"
                                whileHover={{
                                    y: -8,
                                }}>
                                <div className="text-center">
                                    <h3 className="font-bold text-primary leading-[1.2] text-[16px] md:text-[18px] lg:w-[60%] sm:w-[60%] md:w-[40%] mx-auto">Stay  Updated</h3>
                                    <p className="sm:font-extralight capitalize text-[14px] mt-2 w-[90%] mx-auto sm:w-full">Renewal reminder sent to users, ensuring smooth tenancy</p>
                                </div>

                                {/* avatar */}
                                <div className="flex justify-center">
                                    <div className="w-[200px] sm:w-[220px] absolute sm:bottom-2">
                                        <img src={stayUpdatedIllustration} alt="Search & Discover" className="object-cover w-full" />
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section >
    )
}

export default HowItWorks