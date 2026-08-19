import { useEffect } from "react";
import hyveLogo from "../../assets/svg/logo/hyve-logo-white.svg"
import onboardingBgPattern from "../../assets/svg/logo/preloader-bg.png"

const Preloader = ({ isLoading }) => {
  useEffect(() => {
    if (isLoading) {
      document.body.classList.add("overflow-hidden")
    } else {
      document.body.classList.remove("overflow-hidden")
    }
  }, [isLoading])


  // inline style object
  const backgroundStyle = {
    backgroundImage: `url(${onboardingBgPattern})`,
  };

  return (
    /* preloader background */
    <div
      id="preloader"
      className={`fixed inset-0 bg-cover bg-center bg-no-repeat p-0.5 z-[200] flex flex-col items-center justify-center smooth-transition ${isLoading ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
      style={backgroundStyle}
    >

      {/* Hyve Logo */}
      <div className='w-[100px] md:w-[140px] overflow-hidden inline-block'>
        <img src={hyveLogo} alt="Welcome To HYVE, Loading" />
      </div>
    </div>
  )
}

export default Preloader