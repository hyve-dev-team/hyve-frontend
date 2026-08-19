"use client"
import { Link } from 'react-router-dom'

import hyveLogo from "../../assets/svg/logo/hyve-logo.svg"
import { HiOutlineMenu } from "react-icons/hi";
import { CgClose } from "react-icons/cg";
import { useState } from 'react';



const Navbar = () => {
    const [mobileNenu, setMobileMenu] = useState(false)

    /* function to toggle on/off mobile menu */
    function toggleMobileMenu() {
        if (mobileNenu) {
            // set to false to close the menu
            setMobileMenu(false)
        } else {
            // set to true to display the menu
            setMobileMenu(true)
        }
    }

    return (
        <header>
            <nav className='py-5 bg-white shadow-[1px_1px_4px_rgba(0,0,0,0.08)] fixed top-0 left-0 z-[200] w-full'>
                <div className="container">
                    <div className='flex items-center justify-between'>

                        {/* Logo */}
                        <div className='w-[90px] sm:w-[100px]'>
                            <Link to={"/"}>
                                <img src={hyveLogo} alt="Hyve-logo" className='object-cover w-full' />
                            </Link>
                        </div>

                        {/* nav links */}
                        <div className='hidden md:block'>
                            <ul className='flex gap-10'>
                                <a href="#home">
                                    <li className='nav-link'>HOME</li>
                                </a>

                                <a href="#about">
                                    <li className='nav-link'>ABOUT US</li>
                                </a>

                                <a href="#contact">
                                    <li className='nav-link'>CONTACT</li>
                                </a>

                                <a href="#faq">
                                    <li className='nav-link'>FAQ</li>
                                </a>

                                <Link to="/auth/pre-login">
                                    <li className='nav-link'>SIGN IN</li>
                                </Link>
                            </ul>
                        </div>

                        {/* --Mobile Hamburger --*/}
                        <button onClick={() => toggleMobileMenu()} className='cursor-pointer md:hidden text-dark'>
                            <HiOutlineMenu size={25} />
                        </button>

                    </div>
                </div>
            </nav>

            {/* Mobile menu Nav */}
            <nav className={`mobile-menu ${mobileNenu ? 'active' : ''} z-[201]`}>
                {/* menu close icon */}
                <button className='absolute cursor-pointer text-gray/90 top-6 right-4' onClick={() => toggleMobileMenu()}>
                    <CgClose size={20} />
                </button>

                {/* mobile menu nav links */}
                <div className='flex justify-center'>
                    <ul className='flex flex-col items-center mt-6 mobile-nav-links'>
                        <a href="#home" onClick={() => toggleMobileMenu()}>
                            <li className='py-4 text-xs nav-link text-gray'>HOME</li>
                        </a>

                        <a href="#about" onClick={() => toggleMobileMenu()}>
                            <li className='py-4 text-xs nav-link text-gray'>ABOUT US</li>
                        </a>

                        <a href="#contact" onClick={() => toggleMobileMenu()}>
                            <li className='py-4 text-xs nav-link text-gray'>CONTACT</li>
                        </a>

                        <a href="#faq" onClick={() => toggleMobileMenu()}>
                            <li className='py-4 text-xs nav-link text-gray'>FAQ</li>
                        </a>
                        <Link to="/auth/pre-login" onClick={() => toggleMobileMenu()}>
                            <li className='py-4 text-xs nav-link text-gray'>SIGN IN</li>
                        </Link>
                    </ul>
                </div>
            </nav>
        </header>
    )
}

export default Navbar