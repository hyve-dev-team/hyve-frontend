import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { fadeIn } from "../../utils/animationVariants"

import needNewTenant from "../../assets/images/need-a-new-tenant-2.png"
import Button from "../ui/Button"

const NeedNewTenant = () => {
    return (
        <section className='bg-white'>
            <div className="container py-28 sm:py-28">
                {/* smooth scroll in to view animation */}
                <motion.div variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}>
                    <div className="flex flex-col-reverse md:flex-row md:items-center mx-auto w-full md:w-[90%] lg:w-[75%] ">
                        {/* left component */}
                        <div className="w-full text-center lg:w-1/2 md:text-left">
                            <h2 className="font-normal leading-tight capitalize heading-responsive">need  new <br />
                                <span className="text-primary">tenants?</span>
                            </h2>

                            <p className="mt-8 capitalize text-[14px] sm:text-[1rem]">
                                Let Tenants find your
                                <br />
                                property in few minutes</p>

                            {/* new a new apartment CTA btn */}
                            <Link to="/onboarding">
                                <div className="mt-8">
                                    <Button value="get started" />
                                </div>
                            </Link>
                        </div>

                        {/* right component */}
                        <div className="flex justify-center w-full mb-12 lg:w-1/2 md:mb-0">
                            <div className="relative bg-red-5 rounded-[30px] sm:rounded-[40px] overflow-hidden w-[300px] md:w-[320px] lg:w-[420px] shadow-md sm:hover:scale-[1.02] cursor-pointer smooth-transition">
                                <img src={needNewTenant} alt="new a new apartment" className="object-cover w-full" />
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section >
    )
}

export default NeedNewTenant