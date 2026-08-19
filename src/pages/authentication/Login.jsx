import { useState } from 'react'
import { Link, useNavigate, useParams } from "react-router-dom";


/*  */
import loginPageSideImage from "../../assets/images/need-a-new-apartment.png"
import hyveLogo from "../../assets/svg/logo/hyve-logo.svg"

/* icons */
import { IoEyeOffOutline, IoEyeOutline } from 'react-icons/io5';
import { IoIosArrowBack, IoIosAt } from 'react-icons/io';
import { FcGoogle } from 'react-icons/fc';
import { TbLockPassword } from 'react-icons/tb';



const Login = () => {
  const { userRole } = useParams();
  const navigate = useNavigate()

  // inline style object
  const backgroundStyle = {
    backgroundImage: `url(${loginPageSideImage})`,
  };

  /* state management */
  const [formData, setFormData] = useState({ fullname: "", phone: "", email: "", password: "", confirmPassword: "" })
  const [inputError, setInputError] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  /* handle form input change*/
  const handleFormdataChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  /* validate all input logic */
  const isEmptyOrWhitespace = (str) => !str || str.trim().length === 0;
  const validateAll = () => {
    const newErrors = {
      // true if it IS empty, false if it IS NOT empty
      email: isEmptyOrWhitespace(formData.email),
      password: isEmptyOrWhitespace(formData.password),
    };

    setInputError(newErrors);

    /* check if  all input are not empty */
    const hasAnyError = Object.values(newErrors).some(error => error === true);

    // Returns true if validation passed
    return !hasAnyError;
  };


  /* User Registration Logic */
  const handleLogin = async (e) => {
    e.preventDefault();

    if (userRole === "user"){
      navigate("/user/dashboard")
    }

    if (userRole === "landlord"){
      navigate("/landlord/dashboard")
    }

    /* Validate all inputs */
    // if (validateAll()) {
    //   // proceed with login

    //   /* User registration logic for 'user' role */
    //   if (userRole === "user") {
    //     try {

    //       const res = await fetch("http://localhost:1909/api/tenant/sign-in", {
    //         method: "POST",
    //         headers: {
    //           "Content-Type": "application/json",
    //         },
    //         body: JSON.stringify({ userName: formData.email, password: formData.password }),
    //       });

    //       const resData = await res.json();

    //       if (!res.ok) {
    //         console.error(resData.error.message || "Login failed");
    //         alert(resData.error.message || "Login failed. Please try again.");
    //         return;
    //       }

    //       alert("login successful!");
    //       localStorage.setItem("userData", JSON.stringify(resData.payload));
    //       localStorage.setItem("userRole", userRole);
    //       navigate("/user/dashboard")

    //     } catch (error) {
    //       console.error("Network error:", error);
    //       alert("An error occurred. Please try again later.");
    //     }
    //   }


    // }
  }

  return (

    <>
      <main>
        {/* Left and Right components Wrapper */}
        <div className='h-[100svh] md:h-[100svh] flex'>
          {/* left component */}

          <div className='bg-white w-full md:w-1/2 px-4 sm:px-10 relative centralizeContent overflow-y-auto scrollbar-hidden '>
            <div className='w-full sm:w-[70%] md:w-full lg:w-[70%] pt-16 pb-16 lg:py-14 desktop-lg:mt-0'>
              {/* Logo */}
              <div className='w-[100px] sm:w-[110px]'>
                <Link to={"/"}>
                  <img src={hyveLogo} alt="Hyve-logo" className='object-cover w-full' />
                </Link>
              </div>

              <div className='mt-8 md:mt-12'>
                <h4 className='xs:text-[16px] font-medium'>Welcome Back</h4>
              </div>


              <form className='mt-6 flex flex-col gap-5' method='POST' onSubmit={handleLogin}>
                {/* form group - Email Address */}
                <div className={`form-group ${inputError.email ? 'border-red-400' : ''}`}>
                  <span>
                    <IoIosAt className='text-[18px] md:text-[20px] text-[#808080]' />
                  </span>
                  <input type="email" id='email' name='email' value={formData.email} onChange={handleFormdataChange} className='form-input' placeholder='Email address' />
                </div>

                {/* form group - Password*/}
                <div className={`form-group ${inputError.password ? 'border-red-400' : ''}`}>
                  <span>
                    <TbLockPassword className='text-[18px] md:text-[20px] text-[#808080]' />
                  </span>
                  <input type={`${showPassword ? 'text' : 'password'}`} id='password' name='password' value={formData.password} onChange={handleFormdataChange} className='form-input' placeholder='Password' />

                  {/* show  and hide password toggle */}
                  <button type='button' onClick={() => setShowPassword(!showPassword)} className='text-[18px] md:text-[20px] text-[#808080] cursor-pointer'>
                    {showPassword ?
                      <IoEyeOffOutline />
                      :
                      <IoEyeOutline />
                    }
                  </button>
                </div>

                {/* Action Btn */}
                <div className='mt-6'>
                  <button type="submit" className='w-full bg-primary hover:bg-primary-hover rounded-[14px] smooth-transition py-3 md:py-3 shadow-md'>
                    <p className='text-sm font-athiti text-white font-medium'>
                      LOG IN
                    </p>
                  </button>

                  <button type='button' className='mt-6 w-full border-2 border-[#00000040] hover:bg-gray rounded-[14px] smooth-transition py-3 md:py-3 flex justify-center items-center gap-2 shadow-sm'>
                    <span><FcGoogle className='text-[18px] md:text-[20px]' /></span>
                    <p className='text-sm font-athiti text-[#00000080] font-medium'>Continue with Google</p>
                  </button>
                </div>
              </form>

              {/* already have an account  */}
              <div className='mt-10 text-center'>
                <p className='font-athiti font-medium text-[#00000080] text-sm md:text-[16px]'>
                  Don't have an account? <Link to="/onboarding" className='text-primary'>Sign up</Link>
                </p>
              </div>
            </div>
          </div>

          {/* right component - to be displayed only on large screens */}
          <div className='w-1/2 hidden md:block  bg-cover bg-center bg-no-repeat relative' style={backgroundStyle}>
            <div className='w-full h-full absoute top-0 left-0 bg-black/60'></div>

            <div className='absolute top-12 right-16'>
              <Link to="/" className='flex items-center gap-1 text-white hover:text-primary smooth-transition'>
                <IoIosArrowBack />
                <p className='text-sm font-light leading-none'>back Home</p>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

export default Login