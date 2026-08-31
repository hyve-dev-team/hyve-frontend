
import { Link, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";

/*  */
import signupPageSideImage from "../../assets/images/need-a-new-apartment.png";
import hyveLogo from "../../assets/svg/logo/hyve-logo.svg";

/* icons */
import { IoIosArrowBack } from "react-icons/io";
import { FaCircleUser } from "react-icons/fa6";
import { LuPhone } from "react-icons/lu";
import { IoIosAt } from "react-icons/io";
import { TbLockPassword } from "react-icons/tb";
import { IoEyeOutline } from "react-icons/io5";
import { IoEyeOffOutline } from "react-icons/io5";
import { FcGoogle } from "react-icons/fc";
import config from "../../config";



const Sign_up = () => {
  /* 
    Get user's Role: (landlord) or (user) 
    Stricly check to ensure only these 2 paramenter was recieved.
    Anything except those 2, redirect to login page 
    */
  const { userRole } = useParams();
  const navigate = useNavigate();

  // inline style object
  const backgroundStyle = {
    backgroundImage: `url(${signupPageSideImage})`,
  };

  /* state management */
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    countryCode: "+234",
    phone: "",
    gender: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setConfirmShowPassword] = useState(false);
  const [inputError, setInputError] = useState({
    firstName: "",
    lastName: "",
    countryCode: "",
    phone: "",
    gender: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isMatch, setIsMatch] = useState(true);

  /* handle form input change*/
  const handleFormdataChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /* validate all input logic */
  const isEmptyOrWhitespace = (str) => !str || str.trim().length === 0;
  const validateAll = () => {
    const newErrors = {
      // true if it IS empty, false if it IS NOT empty
      firstName: isEmptyOrWhitespace(formData.firstName),
      lastName: isEmptyOrWhitespace(formData.lastName),
      countryCode: isEmptyOrWhitespace(formData.countryCode),
      phone: isEmptyOrWhitespace(formData.phone),
      gender: isEmptyOrWhitespace(formData.gender),
      email: isEmptyOrWhitespace(formData.email),
      password: isEmptyOrWhitespace(formData.password),
      confirmPassword: isEmptyOrWhitespace(formData.confirmPassword),
    };

    setInputError(newErrors);

    /* check if  all input are not empty */
    const hasAnyError = Object.values(newErrors).some(
      (error) => error === true
    );

    // Returns true if validation passed
    return !hasAnyError;
  };

  /* check if passwords match onKeyUp */
  const handleIsPasswordsMatch = (e) => {
    if (e.target.value === formData.password) {
      setIsMatch(true);
      return true;
    } else {
      setIsMatch(false);
      return false;
    }
  };


  /* User Registration Logic */
  // const handleRegistration = (e) => {
  //   e.preventDefault();

  //   /* Validate all inputs */
  //   if (validateAll()) {
  //     // check if password and confirm password match
  //     if (formData.confirmPassword === formData.password) {
  //       // Get user's Role and strictly check
  //       if (userRole === "user") {
  //         // if routes match, proceed with registartion
  //         const payload = {
  //           url: "/api/tenant/signup",
  //           params: {
  //             firstName: formData.firstName,
  //             lastName: formData.lastName,
  //             email: formData.email,
  //             password: formData.password,
  //             countryCode: formData.countryCode,
  //             mobile: formData.phone,
  //             gender: formData.gender
  //           }
  //         }

  //         try {
  //           fetch(`http://localhost:1909${payload.url}`, {
  //             method: "put",
  //             headers: {
  //               contentType: "application/json",
  //               // Authorization: retrievedObject ? retrievedObject : "",
  //             },
  //             body: JSON.stringify(payload.params),
  //           })

  //         } catch (error) {
  //           console.log(error)
  //         }



  //         console.log("proceed with registration", userRole);
  //         navigate("/auth/verify");
  //       } else {
  //         // if route does not match, redirect user back to landing page
  //         // navigate("/");
  //       }


  //       if (userRole === "landlord") {
  //         // if routes match, proceed with registartion
  //         console.log("proceed with registration", userRole);
  //         navigate("/auth/verify");
  //       } else {
  //         // if route does not match, redirect user back to landing page
  //         navigate("/");
  //       }
  //     }
  //   }
  // };
  const handleRegistration = async (e) => {
    e.preventDefault();

    if (!validateAll()) return;

    if (formData.password !== formData.confirmPassword) {
      console.log("Passwords do not match");
      return;
    }

    // Strict role check
    if (userRole !== "user" && userRole !== "landlord") {
      navigate("/");
      return;
    }

    // Real backend: POST /api/v1/auth/register — takes the password directly (no
    // separate set-password step), creates the user, and sends the OTP in one call.
    // It does NOT accept a role — every account is created as STUDENT on the backend
    // regardless of which signup path (tenant/landlord) was chosen here. Role-based
    // routing below is frontend-only until the backend supports it.
    const payload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
    };

    try {
      const data = await config.postAPI({ url: "/api/v1/auth/register", params: payload });

      if (!data?.success) {
        alert(data?.message || "Registration failed. Please try again.");
        return;
      }

      localStorage.setItem("userEmail", formData.email);
      localStorage.setItem("userRole", userRole);

      navigate("/auth/verify");
    } catch (error) {
      console.error("Network error:", error);
      alert("An error occurred. Please try again later.");
    }
  };



  return (
    <>
      <main>
        {/* Left and Right components Wrapper */}
        <div className="h-[100%] md:h-[100svh] flex">
          {/* left component */}
          <div className="relative w-full px-4 overflow-y-auto bg-white md:w-1/2 sm:px-10 centralizeContent scrollbar-hidden">
            <div className="w-full sm:w-[70%] md:w-full lg:w-[70%] pt-16 pb-16 lg:mt-[250px] lg:py-24  desktop-lg:mt-0">
              {/* Logo */}
              <div className="w-[90px] sm:w-[110px] lg:mt-[30%]">
                <Link to={"/"}>
                  <img
                    src={hyveLogo}
                    alt="Hyve-logo"
                    className="object-cover w-full"
                  />
                </Link>
              </div>

              <div className="mt-8 md:mt-12">
                <h4 className="xs:text-[16px] font-medium">Welcome to HYVE</h4>
              </div>

              <form className="flex flex-col gap-5 mt-6" method="POST" onSubmit={handleRegistration}>
                {/* form group - First Name */}
                <div className={`form-group ${inputError.firstName ? "border-red-400" : ""}`}>
                  <span>
                    <FaCircleUser className="text-[18px] md:text-[20px] text-[#808080]" />
                  </span>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleFormdataChange}
                    className="form-input"
                    placeholder="First Name"
                  />
                </div>

                {/* form group - Last Name */}
                <div className={`form-group ${inputError.lastName ? "border-red-400" : ""}`}>
                  <span>
                    <FaCircleUser className="text-[18px] md:text-[20px] text-[#808080]" />
                  </span>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleFormdataChange}
                    className="form-input"
                    placeholder="Last Name"
                  />
                </div>

                {/* form group - Email Address */}
                <div className={`form-group ${inputError.email ? "border-red-400" : ""}`}>
                  <span>
                    <IoIosAt className="text-[18px] md:text-[20px] text-[#808080]" />
                  </span>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormdataChange}
                    className="form-input"
                    placeholder="Email address"
                  />
                </div>

                {/* form group - Phone Number */}
                <div className={`form-group flex items-center gap-2 ${inputError.phone ? "border-red-400" : ""}`}>
                  {/* PHONE ICON */}
                  <span className="pl-1">
                    <LuPhone className="text-[16px] md:text-[18px] text-[#808080]" />
                  </span>
                  {/* COUNTRY CODE DROPDOWN */}
                  <select
                    name="countryCode"
                    value={formData.countryCode}
                    onChange={handleFormdataChange}
                    className="bg-transparent text-gray-300 outline-none border-none px-1 focus:ring-0 text-sm md:text-base">
                    <option value="+234">🇳🇬 +234</option>
                  </select>
                  {/* PHONE NUMBER INPUT */}
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleFormdataChange}
                    placeholder="Phone Number"
                    className="
                                    form-input
                                    flex-1 
                                    bg-transparent 
                                    text-gray-100 
                                    outline-none 
                                    border-none 
                                    focus:ring-0 
                                    placeholder-gray-500
                                    "
                    maxLength={10}
                  />
                </div>

                {/* form group - Gender */}
                <div className={`form-group flex items-center gap-2 ${inputError.gender ? "border-red-400" : ""}`}>
                  {/* Label / Icon (Optional) */}
                  <span className="text-gray-400 text-sm md:text-base">
                    <FaCircleUser className="text-[18px] md:text-[20px] text-[#808080]" />
                  </span>
                  {/* GENDER SELECT */}
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleFormdataChange}
                    placeholder="Gender"
                    className="flex-1 bg-transparent text-gray-100 outline-none border-none px-1 focus:ring-0 text-sm md:text-base placeholder-gray-500">
                    <option value="" className="text-gray-700">
                      Select Gender
                    </option>
                    <option value="male" className="text-black">
                      Male
                    </option>
                    <option value="female" className="text-black">
                      Female
                    </option>
                    <option value="other" className="text-black">
                      Other
                    </option>
                  </select>
                </div>

                {/* form group - Password*/}
                <div className={`form-group ${inputError.password ? "border-red-400" : ""}`}>
                  <span>
                    <TbLockPassword className="text-[18px] md:text-[20px] text-[#808080]" />
                  </span>
                  <input
                    type={`${showPassword ? "text" : "password"}`}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleFormdataChange}
                    className="form-input"
                    placeholder="Password"
                  />

                  {/* show  and hide password toggle */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[18px] md:text-[20px] text-[#808080] cursor-pointer"
                  >
                    {showPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
                  </button>
                </div>

                {/* form group - ConfirmPassword */}
                <div className={`form-group ${inputError.confirmPassword ? "border-red-400" : ""} ${isMatch ? "" : "border-red-400"}`}>
                  <span>
                    <TbLockPassword className="text-[18px] md:text-[20px] text-[#808080]" />
                  </span>
                  <input
                    type={`${showConfirmPassword ? "text" : "password"}`}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleFormdataChange}
                    onKeyUp={handleIsPasswordsMatch}
                    className="form-input"
                    placeholder="Confirm Password"
                  />

                  {/* show  and hide password toggle */}
                  <button
                    type="button"
                    onClick={() => setConfirmShowPassword(!showConfirmPassword)}
                    className="text-[18px] md:text-[20px] text-[#808080] cursor-pointer"
                  >
                    {showConfirmPassword ? (
                      <IoEyeOffOutline />
                    ) : (
                      <IoEyeOutline />
                    )}
                  </button>
                </div>

                {/* tersm and policy  */}
                <div className="flex items-center gap-2 mt-8">
                  <input
                    type="checkbox"
                    id="terms-policy"
                    name="terms-policy"
                    required
                  />
                  <label
                    htmlFor="terms-policy"
                    className="text-sm font-athiti font-regular text-[#00000080]"
                  >
                    I agree with <Link className="text-primary">Terms</Link> and{" "}
                    <Link className="text-primary">Privacy</Link>
                  </label>
                </div>

                {/* Action Btn */}
                <div className="">
                  <button type="submit" className="w-full bg-primary hover:bg-primary-hover rounded-[14px] smooth-transition py-3 md:py-3 shadow-md">
                    <p className="text-sm font-medium text-white font-athiti">
                      SIGN UP
                    </p>
                  </button>

                  <button type="button" className="mt-6 w-full border-2 border-[#00000040] hover:bg-gray rounded-[14px] smooth-transition py-3 md:py-3 flex justify-center items-center gap-2 shadow-sm">
                    <span>
                      <FcGoogle className="text-[18px] md:text-[20px]" />
                    </span>
                    <p className="text-sm font-athiti text-[#00000080] font-medium">
                      Sign Up with Google
                    </p>
                  </button>
                </div>
              </form>

              {/* already have an account  */}
              <div className="mt-10 text-center">
                <p className="font-athiti font-medium text-[#00000080] text-sm md:text-[16px]">
                  Already have an account?{" "}
                  <Link to="/auth/pre-login" className="text-primary">
                    Log In
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* right component - to be displayed only on large screens */}
          <div
            className="relative hidden w-1/2 bg-center bg-no-repeat bg-cover md:block"
            style={backgroundStyle}
          >
            <div className="top-0 left-0 w-full h-full absoute bg-black/60"></div>

            <div className="absolute top-12 right-16">
              <Link
                to="/"
                className="flex items-center gap-1 text-white hover:text-primary smooth-transition"
              >
                <IoIosArrowBack />
                <p className="text-sm font-light leading-none">back Home</p>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Sign_up;
