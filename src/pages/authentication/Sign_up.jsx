import { Link, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";

/* assets */
import signupPageSideImage from "../../assets/images/need-a-new-apartment.png";
import hyveLogo from "../../assets/svg/logo/hyve-logo.svg";
import houseIcon from "../../assets/svg/onboarding/house-icon.svg";
import userSearchIcon from "../../assets/svg/onboarding/user-icon.svg";

/* icons */
import { IoIosArrowBack, IoIosAt } from "react-icons/io";
import { FaCircleUser } from "react-icons/fa6";
import { LuPhone } from "react-icons/lu";
import { TbLockPassword } from "react-icons/tb";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { FcGoogle } from "react-icons/fc";
import { Loader2 } from "lucide-react";

/* config & toast */
import config from "../../config";
import { hyveSuccess, hyveError } from "../../utils/hyveToast";

const Sign_up = () => {
  const { userRole } = useParams();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(
    userRole === "landlord" ? "landlord" : "user"
  );

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
    firstName: false,
    lastName: false,
    phone: false,
    gender: false,
    email: false,
    password: false,
    confirmPassword: false,
  });
  const [isMatch, setIsMatch] = useState(true);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  /* Check if all fields are fully filled */
  const isFormFilled = Boolean(
    formData.firstName?.trim() &&
    formData.lastName?.trim() &&
    formData.email?.trim() &&
    formData.phone?.trim() &&
    formData.gender?.trim() &&
    formData.password?.trim() &&
    formData.confirmPassword?.trim() &&
    agreedToTerms
  );

  /* handle form input change */
  const handleFormdataChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (inputError[e.target.name]) {
      setInputError({ ...inputError, [e.target.name]: false });
    }
  };

  /* validate all input logic */
  const isEmptyOrWhitespace = (str) => !str || str.trim().length === 0;

  const validateAll = () => {
    const newErrors = {
      firstName: isEmptyOrWhitespace(formData.firstName),
      lastName: isEmptyOrWhitespace(formData.lastName),
      phone: isEmptyOrWhitespace(formData.phone),
      gender: isEmptyOrWhitespace(formData.gender),
      email: isEmptyOrWhitespace(formData.email),
      password: isEmptyOrWhitespace(formData.password),
      confirmPassword: isEmptyOrWhitespace(formData.confirmPassword),
    };

    setInputError(newErrors);
    return !Object.values(newErrors).some((error) => error === true);
  };

  /* check if passwords match onKeyUp */
  const handleIsPasswordsMatch = (e) => {
    const match = e.target.value === formData.password;
    setIsMatch(match);
    return match;
  };

  /* User Registration Logic */
  const handleRegistration = async (e) => {
    e.preventDefault();

    if (!validateAll()) {
      hyveError("Missing Information", "Please fill in all required fields.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setIsMatch(false);
      hyveError("Passwords Mismatch", "Passwords do not match. Please re-check.");
      return;
    }

    if (formData.password.length < 6) {
      hyveError("Weak Password", "Password should be at least 6 characters.");
      return;
    }

    const activeRole = selectedRole === "landlord" ? "landlord" : "user";
    setIsLoading(true);

    const payload = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
    };

    try {
      const data = await config.postAPI({
        url: "/api/v1/auth/register",
        params: payload,
      });

      if (!data?.success) {
        hyveError(
          "Registration Failed",
          data?.message || "Registration failed. Please try again."
        );
        return;
      }

      localStorage.setItem("userEmail", formData.email.trim().toLowerCase());
      localStorage.setItem("userRole", activeRole);

      hyveSuccess("Account Created!", "Check your email for your verification OTP.");
      navigate("/auth/verify");
    } catch (error) {
      console.error("Network error:", error);
      hyveError(
        "Connection Error",
        "An unexpected error occurred. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FAFAFA]">
      <div className="min-h-screen flex flex-col md:flex-row">
        {/* Left Column - Form */}
        <div className="w-full md:w-1/2 min-h-screen overflow-y-auto bg-white flex flex-col justify-between px-6 sm:px-12 lg:px-16 py-8 md:py-10">
          <div className="w-full max-w-lg mx-auto">
            {/* Header: Logo & Back Link */}
            <div className="flex items-center justify-between mb-6">
              <Link to="/" className="inline-block transition-transform hover:scale-105">
                <img src={hyveLogo} alt="HYVE" className="h-8 md:h-9 object-contain" />
              </Link>
              <Link
                to="/"
                className="md:hidden flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-primary transition-colors"
              >
                <IoIosArrowBack size={14} />
                <span>Home</span>
              </Link>
            </div>

            {/* Title & Subtitle */}
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 font-montserrat tracking-tight">
                Create an account
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Join HYVE for safer, escrow-protected rentals in Lagos.
              </p>
            </div>

            {/* Role Selection: Which are you? */}
            <div className="mb-6">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2.5 font-montserrat">
                Which are you?
              </label>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {/* User / Tenant Option */}
                <button
                  type="button"
                  onClick={() => setSelectedRole("user")}
                  className={`group relative flex items-center gap-3 p-3.5 sm:p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer text-left ${
                    selectedRole === "user"
                      ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50"
                  }`}
                >
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 border transition-all duration-200 ${
                      selectedRole === "user"
                        ? "border-primary bg-white shadow-sm scale-105"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <img
                      src={userSearchIcon}
                      alt="User"
                      className="w-6 h-6 object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span
                        className={`font-semibold text-sm ${
                          selectedRole === "user" ? "text-primary" : "text-gray-900"
                        }`}
                      >
                        User
                      </span>
                      {selectedRole === "user" && (
                        <span className="w-2 h-2 rounded-full bg-primary" />
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500 truncate mt-0.5">
                      Rent an apartment
                    </p>
                  </div>
                </button>

                {/* Landlord Option */}
                <button
                  type="button"
                  onClick={() => setSelectedRole("landlord")}
                  className={`group relative flex items-center gap-3 p-3.5 sm:p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer text-left ${
                    selectedRole === "landlord"
                      ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50"
                  }`}
                >
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 border transition-all duration-200 ${
                      selectedRole === "landlord"
                        ? "border-primary bg-white shadow-sm scale-105"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <img
                      src={houseIcon}
                      alt="Landlord"
                      className="w-6 h-6 object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span
                        className={`font-semibold text-sm ${
                          selectedRole === "landlord" ? "text-primary" : "text-gray-900"
                        }`}
                      >
                        Landlord
                      </span>
                      {selectedRole === "landlord" && (
                        <span className="w-2 h-2 rounded-full bg-primary" />
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500 truncate mt-0.5">
                      List your property
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Registration Form */}
            <form className="flex flex-col gap-4" onSubmit={handleRegistration}>
              {/* Name Fields (2 Columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    First Name
                  </label>
                  <div
                    className={`form-group ${
                      inputError.firstName ? "border-red-400 bg-red-50/20" : "border-gray-200 focus-within:border-primary"
                    } transition-colors`}
                  >
                    <span>
                      <FaCircleUser className="text-[17px] text-[#808080]" />
                    </span>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleFormdataChange}
                      className="form-input text-gray-900"
                      placeholder="e.g. John"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Last Name
                  </label>
                  <div
                    className={`form-group ${
                      inputError.lastName ? "border-red-400 bg-red-50/20" : "border-gray-200 focus-within:border-primary"
                    } transition-colors`}
                  >
                    <span>
                      <FaCircleUser className="text-[17px] text-[#808080]" />
                    </span>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleFormdataChange}
                      className="form-input text-gray-900"
                      placeholder="e.g. Doe"
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div
                  className={`form-group ${
                    inputError.email ? "border-red-400 bg-red-50/20" : "border-gray-200 focus-within:border-primary"
                  } transition-colors`}
                >
                  <span>
                    <IoIosAt className="text-[19px] text-[#808080]" />
                  </span>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormdataChange}
                    className="form-input text-gray-900"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              {/* Phone & Gender (2 Columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Phone Number
                  </label>
                  <div
                    className={`form-group ${
                      inputError.phone ? "border-red-400 bg-red-50/20" : "border-gray-200 focus-within:border-primary"
                    } transition-colors`}
                  >
                    <span className="pl-1">
                      <LuPhone className="text-[16px] text-[#808080]" />
                    </span>
                    <select
                      name="countryCode"
                      value={formData.countryCode}
                      onChange={handleFormdataChange}
                      className="bg-transparent text-gray-800 text-xs sm:text-sm font-medium outline-none border-none pr-1 focus:ring-0 cursor-pointer"
                    >
                      <option value="+234">🇳🇬 +234</option>
                    </select>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleFormdataChange}
                      placeholder="801 234 5678"
                      className="form-input text-gray-900 placeholder:text-gray-400"
                      maxLength={11}
                    />
                  </div>
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Gender
                  </label>
                  <div
                    className={`form-group ${
                      inputError.gender ? "border-red-400 bg-red-50/20" : "border-gray-200 focus-within:border-primary"
                    } transition-colors`}
                  >
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleFormdataChange}
                      className="form-input text-gray-900 bg-transparent cursor-pointer"
                    >
                      <option value="" disabled className="text-gray-400">
                        Select Gender
                      </option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Password & Confirm Password (2 Columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Password
                  </label>
                  <div
                    className={`form-group ${
                      inputError.password ? "border-red-400 bg-red-50/20" : "border-gray-200 focus-within:border-primary"
                    } transition-colors`}
                  >
                    <span>
                      <TbLockPassword className="text-[18px] text-[#808080]" />
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleFormdataChange}
                      className="form-input text-gray-900"
                      placeholder="At least 6 chars"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[#808080] hover:text-gray-700 transition-colors p-1 cursor-pointer"
                      aria-label="Toggle password"
                    >
                      {showPassword ? <IoEyeOffOutline size={18} /> : <IoEyeOutline size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Confirm Password
                  </label>
                  <div
                    className={`form-group ${
                      inputError.confirmPassword || !isMatch
                        ? "border-red-400 bg-red-50/20"
                        : "border-gray-200 focus-within:border-primary"
                    } transition-colors`}
                  >
                    <span>
                      <TbLockPassword className="text-[18px] text-[#808080]" />
                    </span>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleFormdataChange}
                      onKeyUp={handleIsPasswordsMatch}
                      className="form-input text-gray-900"
                      placeholder="Re-enter password"
                    />
                    <button
                      type="button"
                      onClick={() => setConfirmShowPassword(!showConfirmPassword)}
                      className="text-[#808080] hover:text-gray-700 transition-colors p-1 cursor-pointer"
                      aria-label="Toggle confirm password"
                    >
                      {showConfirmPassword ? <IoEyeOffOutline size={18} /> : <IoEyeOutline size={18} />}
                    </button>
                  </div>
                </div>
              </div>
              {!isMatch && formData.confirmPassword && (
                <p className="text-xs text-red-500 -mt-2">Passwords do not match</p>
              )}

              {/* Terms and policy */}
              <div className="flex items-center gap-2.5 mt-1">
                <input
                  type="checkbox"
                  id="terms-policy"
                  name="terms-policy"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="w-4 h-4 rounded text-primary accent-primary focus:ring-primary cursor-pointer"
                />
                <label
                  htmlFor="terms-policy"
                  className="text-xs sm:text-sm text-gray-600 cursor-pointer select-none"
                >
                  I agree to HYVE's{" "}
                  <Link to="#" className="text-primary hover:underline font-medium">
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link to="#" className="text-primary hover:underline font-medium">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="mt-2 flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={!isFormFilled || !isMatch || isLoading}
                  className="w-full bg-primary hover:bg-primary-hover active:scale-[0.99] rounded-xl py-3.5 shadow-md shadow-primary/20 flex items-center justify-center gap-2 smooth-transition disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:bg-primary cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                      <span className="text-sm font-semibold text-white tracking-wide">
                        CREATING ACCOUNT...
                      </span>
                    </>
                  ) : (
                    <span className="text-sm font-semibold text-white tracking-wide">
                      CREATE ACCOUNT
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  disabled={isLoading}
                  className="w-full border border-gray-200 hover:bg-gray-50 active:scale-[0.99] rounded-xl py-3 flex justify-center items-center gap-2.5 shadow-sm smooth-transition cursor-pointer disabled:opacity-50"
                >
                  <FcGoogle className="text-[20px]" />
                  <span className="text-sm font-medium text-gray-700">
                    Sign up with Google
                  </span>
                </button>
              </div>
            </form>

            {/* Already have an account */}
            <div className="mt-8 text-center pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link to="/auth/signin" className="text-primary font-semibold hover:underline">
                  Log in
                </Link>
              </p>
            </div>
          </div>

          <div className="w-full max-w-lg mx-auto text-center pt-6 text-xs text-gray-400">
            © {new Date().getFullYear()} HYVE Technologies. All rights reserved.
          </div>
        </div>

        {/* Right Column - Hero Side Panel */}
        <div
          className="relative hidden md:flex md:w-1/2 bg-cover bg-center min-h-screen items-end p-8 lg:p-14"
          style={backgroundStyle}
        >
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/30 backdrop-blur-[1px]" />

          {/* Floating Back Home Button */}
          <div className="absolute top-8 right-10 z-10">
            <Link
              to="/"
              className="flex items-center gap-1.5 text-white/90 hover:text-white bg-white/15 hover:bg-white/25 backdrop-blur-md px-4 py-2 rounded-full text-xs font-medium border border-white/20 smooth-transition"
            >
              <IoIosArrowBack />
              <span>Back Home</span>
            </Link>
          </div>

          {/* Trust Highlights Card */}
          <div className="relative z-10 w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-white shadow-2xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-primary text-white tracking-wider uppercase">
                Why HYVE
              </span>
              <span className="text-xs text-white/80 font-light">Built for Lagos rentals</span>
            </div>
            <h3 className="text-xl font-bold font-montserrat leading-snug">
              Rent with complete confidence and protection.
            </h3>
            <ul className="mt-4 space-y-2.5 text-xs sm:text-sm text-white/90">
              <li className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                  ✓
                </span>
                <span>Verified apartments and authenticated landlords</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                  ✓
                </span>
                <span>Protected escrow payments released only after inspection</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                  ✓
                </span>
                <span>Transparent digital agreements and real-time records</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Sign_up;
