import React from 'react'
import { Link } from 'react-router-dom'
import SocialIcons from '../ui/SocialIcons'
import hyveLogoBlack from "../../assets/svg/logo/hyve-logo-black.svg"

import { FaFacebookF } from "react-icons/fa";
import { SlSocialInstagram } from "react-icons/sl";
import { RiTwitterXFill } from "react-icons/ri";
import { FaWhatsapp } from "react-icons/fa6";
import { BiLogoYoutube } from "react-icons/bi";
import { TfiLinkedin } from "react-icons/tfi";


const Footer = () => {
    return (
        <section className='bg-dark' id="contact-us">
            <div className="container pt-24 sm:pt-28 lg:pt-38">
                <div className='flex flex-col md:flex-row w-full md:w-[60%] mx-auto items-center'>
                    <div className='w-full md:w-[70%] text-center md:text-left'>
                        {/* footer logo */}
                        <Link to="/">
                            <div className='w-[100px] overflow-hidden  inline-block'>
                                <img src={hyveLogoBlack} alt="hyve logo" className='object-cover w-full' />
                            </div>
                        </Link>

                        <div className='mt-4 md:mt-10'>
                            <a href="mailto:info@hyve.org">
                                <p className='inline font-light text-white font-sora paragraph-responsive hover:text-primary smooth-transition'>info@hyve.org</p>
                            </a>
                        </div>

                        {/* social links */}
                        <div className="flex justify-center gap-4 mt-8 md:justify-start sm:mt-10 ">
                            <SocialIcons icon={<FaFacebookF />} dynamicClasses="text-white border-white" />
                            <SocialIcons icon={<SlSocialInstagram />} dynamicClasses="text-white border-white" />
                            <SocialIcons icon={<RiTwitterXFill />} dynamicClasses="text-white border-white" />
                            <SocialIcons icon={<FaWhatsapp />} dynamicClasses="text-white border-white" />
                            <SocialIcons icon={<BiLogoYoutube />} dynamicClasses="text-white border-white" />
                            <SocialIcons icon={<TfiLinkedin />} dynamicClasses="text-white border-white" />
                        </div>
                    </div>
                    <div className='w-full md:w-[30%] mt-16 md:mt-0 text-center md:text-left'>
                        {/* footer quick links */}
                        <ul className='flex flex-col gap-8 md:gap-10 text-white font-sora font-normal text-[12px] md:text-sm'>
                            <a href="#home" className='hover:text-primary smooth-transition'>
                                <li>Home</li>
                            </a>
                            <a href="#about" className='hover:text-primary smooth-transition'>
                                <li>About Us</li>
                            </a>
                            <a href="#contact" className='hover:text-primary smooth-transition'>
                                <li>Contact</li>
                            </a>
                            <a href="#faq" className='hover:text-primary smooth-transition'>
                                <li>FAQs</li>
                            </a>
                        </ul>
                    </div>

                </div>
            </div>

            {/* copyright */}
            <div className='flex justify-center pt-8 pb-10 mt-16 border-t md:pb-14 border-white/10'>
                <p className='text-white/80 font-sora font-light text-[12px] md:text-sm'>© {new Date().getFullYear()} HYVE. All rights reserved.</p>
            </div>

        </section>
    )
}

export default Footer