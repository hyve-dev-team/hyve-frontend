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

                                <p className="mt-3 md:mt-8 w-full lg:w-[80%] leading-6 lg:leading-8 paragraph-responsive">Hyve Haven is a Lagos-based proptech company focused on making rental transactions safer and more accountable. We are building a platform where verification, protected payments, and clear records are standard — not optional extras.</p>

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
                            <div className="flex items-center justify-center h-full p-4">
                                <motion.div
                                    className="bg-white rounded-2xl w-[90%] md:w-[75%] max-w-3xl max-h-[90vh] overflow-y-auto px-6 py-8 md:py-12 md:px-12 relative shadow-2xl"
                                    onClick={(e) => e.stopPropagation()}
                                    initial={{ y: 50, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: 50, opacity: 0 }}
                                >

                                    {/* close button */}
                                    <button className="absolute right-4 top-4 md:right-6 md:top-6 text-black/60 hover:text-black transition-colors p-1" onClick={handleCloseModal} aria-label="Close modal">
                                        <CgClose size={24} />
                                    </button>

                                    {/* modal content */}
                                    <div className="space-y-6 text-black/80">
                                        <div>
                                            <h3 className="text-xl md:text-2xl font-semibold text-primary mb-3">About Us</h3>
                                            <h4 className="text-base md:text-lg font-semibold text-black/90 mb-2">Who We Are</h4>
                                            <p className="paragraph-responsive leading-relaxed">
                                                Hyve Haven is a Lagos-based proptech company focused on making rental transactions safer and more accountable.
                                            </p>
                                            <p className="mt-3 paragraph-responsive leading-relaxed">
                                                The idea was born from direct experience. We've lived through the difficulty of finding decent housing and watched people close to us lose significant money to unreliable agents and opaque processes. Hyve Haven was created because the current system fails too many ordinary renters and, in many cases, landlords too.
                                            </p>
                                            <p className="mt-3 paragraph-responsive leading-relaxed">
                                                We are building a platform where verification, protected payments, and clear records are standard — not optional extras.
                                            </p>
                                        </div>

                                        <div>
                                            <h4 className="text-base md:text-lg font-semibold text-black/90 mb-2">What We’re Building</h4>
                                            <p className="paragraph-responsive leading-relaxed mb-2">
                                                A rental process that prioritizes trust:
                                            </p>
                                            <ul className="list-disc list-inside space-y-1 pl-2 paragraph-responsive leading-relaxed">
                                                <li>Verified properties and participants</li>
                                                <li>Escrow-protected payments</li>
                                                <li>Transparent steps from discovery to move-in</li>
                                                <li>Tools that reduce the chaos of the current agent-driven market</li>
                                            </ul>
                                            <p className="mt-3 paragraph-responsive leading-relaxed">
                                                We are starting focused. Core trust and transaction features come first. Additional capabilities (smarter matching, community features, ancillary services) will follow once the foundation works.
                                            </p>
                                        </div>

                                        <div>
                                            <h4 className="text-base md:text-lg font-semibold text-black/90 mb-2">Why This Matters</h4>
                                            <p className="paragraph-responsive leading-relaxed">
                                                Finding a home is one of the largest financial and emotional decisions many people make. Right now, that process is still filled with unnecessary risk. We believe a better system is possible — one that protects tenants without destroying the ability of good agents and landlords to do business.
                                            </p>
                                        </div>

                                        <div>
                                            <h4 className="text-base md:text-lg font-semibold text-black/90 mb-2">Our Approach</h4>
                                            <p className="paragraph-responsive leading-relaxed">
                                                We will not claim to have already solved everything. We are building carefully, testing with real users, and improving based on what actually works on the ground. Our standard is simple: every feature should reduce risk or friction for the people using the platform.
                                            </p>
                                        </div>

                                        <div className="pt-2">
                                            <p className="font-semibold text-primary text-base md:text-lg">
                                                Welcome to Hyve Haven.
                                            </p>
                                        </div>
                                    </div>
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