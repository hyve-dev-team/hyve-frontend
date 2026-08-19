import { Link } from "react-router-dom"
import needNewAprtment from "../../assets/images/need-a-new-apartment.png"
import Button from "../ui/Button"
import { motion } from "framer-motion"
import { fadeIn } from "../../utils/animationVariants"

const NeedNewApartment = () => {
    return (
        <section className='mt-16 bg-primary-light'>
            <div className="container py-28 sm:py-28">

                {/* smooth scroll in to view animation */}
                <motion.div variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}>
                    <div className="flex flex-col md:flex-row md:items-center mx-auto w-full md:w-[90%] lg:w-[75%] lg:gap-16 gap-8">
                        {/* left component */}
                        <div className="flex justify-center w-full lg:w-1/2">
                            <div className="relative bg-red-5 rounded-[30px] sm:rounded-[40px] overflow-hidden w-[300px] md:w-[320px] lg:w-[380px] shadow-md sm:hover:scale-[1.02] cursor-pointer smooth-transition">
                                <img src={needNewAprtment} alt="new a new apartment" className="object-cover w-full" />
                                <div className="absolute top-0 left-0 w-full h-full bg-black/30"></div>
                            </div>
                        </div>

                        {/* right component */}
                        <div className="w-full mt-4 text-center lg:w-1/2 md:text-left md:mt-0">
                            <h2 className="font-normal leading-tight capitalize heading-responsive">need a new <br />
                                <span className="text-primary">Apartment?</span>
                            </h2>

                            <p className="mt-8 capitalize paragraph-responsive ">Search & discover apartments <br />
                                near your campus.</p>

                            {/* new a new apartment CTA btn */}
                            <Link to="/onboarding">
                                <div className="mt-8">
                                    <Button value="find an apartment" />
                                </div>
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section >
    )
}

export default NeedNewApartment