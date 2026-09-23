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
            <div className="container pt-20 sm:pt-24 lg:pt-28">
                <div className='grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8'>
                    {/* Column 1: Brand & Contact */}
                    <div className='md:col-span-5 text-center md:text-left space-y-4'>
                        <Link to="/">
                            <div className='w-[120px] overflow-hidden inline-block'>
                                <img src={hyveLogoBlack} alt="hyve logo" className='object-cover w-full' />
                            </div>
                        </Link>

                        <p className='text-white/70 font-sora text-xs sm:text-sm font-light max-w-sm mx-auto md:mx-0 leading-relaxed'>
                            Reinventing rental housing in Nigeria with verified listings, digital tenancy agreements, and 100% Escrow Protection.
                        </p>

                        <div className='pt-1 text-xs text-white/60 space-y-1 font-mono'>
                            <p>HYVE Haven Limited • RC 9000322</p>
                            <a href="mailto:info@hyve.org" className='text-primary hover:underline block'>
                                info@hyve.org
                            </a>
                        </div>

                        {/* social links */}
                        <div className="flex justify-center gap-3 pt-2 md:justify-start">
                            <SocialIcons icon={<FaFacebookF />} dynamicClasses="text-white border-white/40 hover:border-primary" />
                            <SocialIcons icon={<SlSocialInstagram />} dynamicClasses="text-white border-white/40 hover:border-primary" />
                            <SocialIcons icon={<RiTwitterXFill />} dynamicClasses="text-white border-white/40 hover:border-primary" />
                            <SocialIcons icon={<FaWhatsapp />} dynamicClasses="text-white border-white/40 hover:border-primary" />
                            <SocialIcons icon={<BiLogoYoutube />} dynamicClasses="text-white border-white/40 hover:border-primary" />
                            <SocialIcons icon={<TfiLinkedin />} dynamicClasses="text-white border-white/40 hover:border-primary" />
                        </div>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div className='md:col-span-3 text-center md:text-left'>
                        <p className='text-primary font-bold text-xs uppercase tracking-wider mb-4 sm:mb-6 font-poppins'>
                            Platform
                        </p>
                        <ul className='flex flex-col gap-3.5 text-white/80 font-sora text-xs sm:text-sm'>
                            <li>
                                <Link to="/" className='hover:text-primary smooth-transition'>Home</Link>
                            </li>
                            <li>
                                <Link to="/user/apartment/search" className='hover:text-primary smooth-transition'>Find an Apartment</Link>
                            </li>
                            <li>
                                <Link to="/auth/signup/landlord" className='hover:text-primary smooth-transition'>List Your Property</Link>
                            </li>
                            <li>
                                <a href="/#about" className='hover:text-primary smooth-transition'>About Us</a>
                            </li>
                            <li>
                                <a href="/#faq" className='hover:text-primary smooth-transition'>FAQs</a>
                            </li>
                        </ul>
                    </div>

                    {/* Column 3: Legal & Trust Center */}
                    <div className='md:col-span-4 text-center md:text-left'>
                        <p className='text-primary font-bold text-xs uppercase tracking-wider mb-4 sm:mb-6 font-poppins'>
                            Legal & Compliance Hub
                        </p>
                        <ul className='flex flex-col gap-3 text-white/80 font-sora text-xs sm:text-sm'>
                            <li>
                                <Link to="/legal?policy=privacy" className='hover:text-primary smooth-transition flex items-center justify-center md:justify-start gap-1.5'>
                                    <span>Data Protection Policy (NDPR)</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/legal?policy=terms" className='hover:text-primary smooth-transition'>
                                    Terms of Service & Escrow Rules
                                </Link>
                            </li>
                            <li>
                                <Link to="/legal?policy=caution-fee" className='hover:text-primary smooth-transition'>
                                    Caution Fee Holding & Return Policy
                                </Link>
                            </li>
                            <li>
                                <Link to="/legal?policy=landlord-agreement" className='hover:text-primary smooth-transition'>
                                    Landlord Partnership Agreement (5%)
                                </Link>
                            </li>
                            <li>
                                <Link to="/legal?policy=tenancy-agreement" className='hover:text-primary smooth-transition'>
                                    Standard Tenancy Agreement Template
                                </Link>
                            </li>
                            <li>
                                <Link to="/legal?policy=acceptable-use" className='hover:text-primary smooth-transition'>
                                    Acceptable Use Policy (AUP)
                                </Link>
                            </li>
                            <li>
                                <Link to="/legal?policy=cookies" className='hover:text-primary smooth-transition'>
                                    Cookie & Tracking Policy
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* copyright */}
            <div className='flex flex-col sm:flex-row items-center justify-between gap-4 px-6 max-w-7xl mx-auto pt-8 pb-10 mt-16 border-t md:pb-14 border-white/10 text-xs text-white/60 font-sora font-light'>
                <p>© {new Date().getFullYear()} HYVE Haven Limited (RC 9000322). All rights reserved.</p>
                <div className='flex items-center gap-4 flex-wrap justify-center text-white/50'>
                    <Link to="/legal?policy=privacy" className='hover:text-primary smooth-transition'>Privacy</Link>
                    <span>•</span>
                    <Link to="/legal?policy=terms" className='hover:text-primary smooth-transition'>Terms</Link>
                    <span>•</span>
                    <Link to="/legal?policy=caution-fee" className='hover:text-primary smooth-transition'>Caution Fee</Link>
                    <span>•</span>
                    <Link to="/legal?policy=cookies" className='hover:text-primary smooth-transition'>Cookies</Link>
                </div>
            </div>

        </section>
    )
}

export default Footer