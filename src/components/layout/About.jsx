"use client"
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeIn } from "../../utils/animationVariants";
import aboutUsImage from "../../assets/images/hero_image-1.png"
import { CgClose } from "react-icons/cg";

const About = () => {
    // state to manage the read more modal
    const [active, setActive] = useState(false);

    // function to display the read more modal
    function handleReadMoreModal() {
        setActive(true)
    }
    // function to close the read more modal
    function handleCloseModal(e) {
        setActive(false)
    }

    useEffect(() => {
        if (active) {
            document.body.classList.add("no-scroll")
        } else {
            document.body.classList.remove("no-scroll")
        }

        // clean up function
        return () => {
            document.body.classList.remove("no-scroll")
        }
    }, [active]) // re-run effect when ever 'active' state changes


    return (
        <>

            <section className='bg-gray' id="about">
                <div className="container py-20">
                    {/* smooth scroll in to view animation */}
                    <motion.div variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}>
                        {/* about us card */}
                        <div className="flex flex-col items-center w-full gap-8 px-6 py-10 bg-white md:py-16 lg:gap-10 md:px-16 lg:px-24 md:flex-row">
                            <div className='flex justify-center w-full md:w-1/2'>
                                <div className="lg:w-[90%] sm:w-[60%] md:w-[90%] w-full">
                                    <img src={aboutUsImage} alt="about-us-image" className="object-cover w-full" />
                                </div>
                            </div>

                            {/* About us write up */}
                            <div className='w-full mt-0 sm:mt-2 md:w-1/2 md:mt-0'>
                                <h2 className="font-normal leading-tight capitalize heading-responsive text-primary">About Us</h2>

                                <p className="mt-3 md:mt-8 w-full lg:w-[80%] leading-6 lg:leading-8 paragraph-responsive">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut </p>

                                <button onClick={() => handleReadMoreModal()}>
                                    <p className="mt-4 font-medium md:mt-4 paragraph-responsive hover:text-primary smooth-transition">Read More</p>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>


            {/* about section - read more modal */}
            <AnimatePresence>
                {
                    active && (
                        <motion.div key="modal-backdrop"
                            className={`fixed top-0 left-0 w-full h-full bg-black/70 z-[301] backdrop-blur-sm`}
                            onClick={handleCloseModal}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="flex items-center justify-center h-full">
                                <motion.div
                                    className="bg-white w-[90%] md:w-[75%] max-h-[90%] overflow-y-auto px-4 py-14 md:py-24 md:px-20 relative"
                                    onClick={(e) => e.stopPropagation()}
                                    initial={{ y: 50 }}
                                    animate={{ y: 0 }}
                                    exit={{ y: 50 }}
                                >

                                    {/* close button on mobile screens */}
                                    <button className="absolute sm:hidden right-4 top-5 text-black/70" onClick={handleCloseModal}>
                                        <CgClose />
                                    </button>

                                    {/* modal content */}
                                    <p className="paragraph-responsive">Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam.</p>

                                    <p className="mt-8 paragraph-responsive">est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?"</p>
                                    
                                    <p className="mt-8 paragraph-responsive">est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?"</p>
                                </motion.div>
                            </div>
                        </motion.div>
                    )
                }
            </AnimatePresence>

        </>
    )
}

export default About