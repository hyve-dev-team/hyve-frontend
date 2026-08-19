import { motion } from "framer-motion";
import qrcode from "../../assets/images/hyve-qr.png"
import SocialIcons from "../ui/SocialIcons";
import { fadeIn } from "../../utils/animationVariants";

import { FaFacebookF } from "react-icons/fa";
import { SlSocialInstagram } from "react-icons/sl";
import { RiTwitterXFill } from "react-icons/ri";
import { FaWhatsapp } from "react-icons/fa6";
import { BiLogoYoutube } from "react-icons/bi";
import { TfiLinkedin } from "react-icons/tfi";


const ContactUs = () => {
    return (
        <section className='bg-gray' id="contact">
            <div className="container py-24 sm:py-28 lg:py-38">
                <motion.div variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}>
                    <div className="flex flex-col items-center w-full px-0 lg:px-40 md:flex-row">
                        <div className='flex justify-center w-full md:w-1/2'>
                            <div className='flex flex-col items-center w-full'>
                                <div className="w-[240px] bg-white p-4">
                                    <img src={qrcode} alt="contact us qr code" className="object-cover w-full" />
                                </div>

                                <div className='mt-2'>
                                    <p className='font-extralight paragraph-responsive'> Scan Code to Chat with Us</p>
                                </div>
                            </div>
                        </div>

                        {/* About us write up */}
                        <div className='w-full mt-8 lg:mt-0 md:w-1/2 md:mt-0'>
                            {/* contact us information */}
                            <div>
                                <h2 className="font-normal leading-tight text-center capitalize heading-responsive text-primary md:text-left">Contact Us</h2>
                                <p className="mt-3 md:mt-6 w-[90%] mx-auto md:mx-0 md:w-full lg:w-[80%] leading-6 lg:leading-8 paragraph-responsive text-center md:text-left">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do  </p>
                            </div>

                            {/* social icons */}
                            <div className="flex items-center justify-center gap-4 mt-8 sm:mt-4 md:justify-start">
                                <SocialIcons icon={<FaFacebookF />} />
                                <SocialIcons icon={<SlSocialInstagram />} />
                                <SocialIcons icon={<RiTwitterXFill />} />
                                <SocialIcons icon={<FaWhatsapp />} />
                                <SocialIcons icon={<BiLogoYoutube />} />
                                <SocialIcons icon={<TfiLinkedin />} />
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}

export default ContactUs