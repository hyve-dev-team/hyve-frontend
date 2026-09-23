
import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from "react-router-dom"
import config from "../../config"
import { hyveSuccess, hyveError } from "../../utils/hyveToast"

/* Assets */
import loginPageSideImage from "../../assets/images/need-a-new-apartment.png"
import hyveLogo from "../../assets/svg/logo/hyve-logo.svg"

/* Icons */
import { IoEyeOffOutline, IoEyeOutline } from 'react-icons/io5'
import { IoIosArrowBack, IoIosAt } from 'react-icons/io'
import { FcGoogle } from 'react-icons/fc'
import { TbLockPassword } from 'react-icons/tb'
import { Loader2, AlertCircle, CheckCircle2, ShieldCheck, Clock, Check, X } from 'lucide-react'

const Login = () => {
  const { userRole } = useParams()
  const navigate = useNavigate()

  /* Form state */
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [inputError, setInputError] = useState({ email: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [authError, setAuthError] = useState("")
  const [rememberMe, setRememberMe] = useState(true)

  /* Forgot password modal state */
  const [showForgotModal, setShowForgotModal] = useState(false)
  const [forgotEmail, setForgotEmail] = useState("")
  const [isForgotLoading, setIsForgotLoading] = useState(false)
  const [forgotSent, setForgotSent] = useState(false)

  // Pre-fill remembered email if present
  useEffect(() => {
    const savedEmail = localStorage.getItem("hyve_remembered_email")
    if (savedEmail) {
      setFormData((prev) => ({ ...prev, email: savedEmail }))
    }
  }, [])

  /* Handle form input changes */
  const handleFormdataChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    if (inputError[e.target.name]) {
      setInputError({ ...inputError, [e.target.name]: "" })
    }
    if (authError) {
      setAuthError("")
    }
  }

  const isFormFilled = formData.email.trim().length > 0 && formData.password.trim().length > 0

  /* Validation */
  const validateForm = () => {
    const errors = {
      email: !formData.email.trim() ? "Email is required" : !/\S+@\S+\.\S+/.test(formData.email) ? "Enter a valid email address" : "",
      password: !formData.password.trim() ? "Password is required" : "",
    }
    setInputError(errors)
    return !errors.email && !errors.password
  }

  /* Handle Login */
  const handleLogin = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    setAuthError("")

    try {
      const res = await config.postAPI({
        url: "/api/v1/auth/login",
        params: { email: formData.email.trim(), password: formData.password },
      })

      if (!res?.success || !res?.data?.token) {
        const errorMsg = res?.message || "Invalid email or password. Please check your credentials."
        setAuthError(errorMsg)
        hyveError("Login Failed", errorMsg)
        return
      }

      // Handle Remember Me
      if (rememberMe) {
        localStorage.setItem("hyve_remembered_email", formData.email.trim())
      } else {
        localStorage.removeItem("hyve_remembered_email")
      }

      const user = res.data.user
      const roleFromBackend = user?.role?.toLowerCase()
      const resolvedRole = roleFromBackend === "admin" 
        ? "admin" 
        : (roleFromBackend === "landlord" ? "landlord" : (userRole === "landlord" ? "landlord" : "user"))

      localStorage.setItem("token", res.data.token)
      localStorage.setItem("user", JSON.stringify(user))
      localStorage.setItem("userRole", resolvedRole)

      hyveSuccess("Welcome Back!", `Signed in as ${user?.firstName || user?.firstname || user?.fullname || "User"}`)

      if (resolvedRole === "admin") {
        navigate("/admin/dashboard")
      } else if (resolvedRole === "landlord") {
        navigate("/landlord/dashboard")
      } else {
        navigate("/user/dashboard")
      }
    } catch (error) {
      console.error("Login error:", error)
      const errTxt = "An unexpected error occurred. Please check your connection and try again."
      setAuthError(errTxt)
      hyveError("Login Error", errTxt)
    } finally {
      setIsLoading(false)
    }
  }

  /* Handle Forgot Password */
  const handleForgotPassword = async (e) => {
    e.preventDefault()
    if (!forgotEmail.trim() || !/\S+@\S+\.\S+/.test(forgotEmail)) {
      hyveError("Invalid Email", "Please enter a valid email address.")
      return
    }

    setIsForgotLoading(true)
    try {
      const res = await config.postAPI({
        url: "/api/v1/auth/forgot-password",
        params: { email: forgotEmail.trim() },
      })

      if (res?.success) {
        setForgotSent(true)
        hyveSuccess("Reset Link Sent", res?.message || `Instructions sent to ${forgotEmail}`)
      } else {
        hyveError("Request Failed", res?.message || "Could not send reset link. Try again.")
      }
    } catch (err) {
      console.error("Forgot password error:", err)
      hyveError("Request Failed", err?.message || "Could not send reset link. Please try again.")
    } finally {
      setIsForgotLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-white flex flex-col md:flex-row">
      {/* LEFT COLUMN: Login Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-between px-6 sm:px-12 lg:px-16 xl:px-20 py-8 lg:py-12 min-h-screen overflow-y-auto">
        {/* Top Header / Logo */}
        <div className="flex items-center justify-between">
          <Link to="/" className="inline-block">
            <img src={hyveLogo} alt="Hyve Haven" className="h-8 sm:h-9 w-auto object-contain" />
          </Link>
          <Link
            to="/"
            className="md:hidden flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-primary transition-colors"
          >
            <IoIosArrowBack size={14} /> Back Home
          </Link>
        </div>

        {/* Center Content Container */}
        <div className="w-full max-w-md mx-auto my-auto py-8">
          {/* Welcome Headline */}
          <div className="mb-6 sm:mb-8">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary mb-3">
              Rental Portal
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-montserrat text-gray-900 tracking-tight">
              Welcome Back
            </h1>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              Sign in to manage your bookings, queue positions, and rental listings.
            </p>
          </div>

          {/* Dismissible Error Alert */}
          {authError && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-3 animate-in fade-in duration-200">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
              <div className="flex-1 text-xs sm:text-sm leading-relaxed">
                <p className="font-bold">Authentication Failed</p>
                <p className="text-red-600 mt-0.5">{authError}</p>
              </div>
              <button
                type="button"
                onClick={() => setAuthError("")}
                className="text-red-400 hover:text-red-700 transition-colors cursor-pointer"
                title="Dismiss"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Login Form */}
          <form className="flex flex-col gap-4" onSubmit={handleLogin} noValidate>
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div
                className={`form-group ${
                  inputError.email ? "border-red-400 bg-red-50/20" : "border-gray-200 focus-within:border-primary"
                } transition-colors`}
              >
                <span>
                  <IoIosAt className="text-[20px] text-gray-400" />
                </span>
                <input
                  type="email"
                  id="email"
                  name="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleFormdataChange}
                  className="form-input text-gray-900 placeholder:text-gray-400"
                  placeholder="name@example.com"
                />
              </div>
              {inputError.email && (
                <p className="text-[11px] text-red-500 mt-1 font-medium flex items-center gap-1">
                  <AlertCircle size={12} /> {inputError.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(true)
                    setForgotSent(false)
                    setForgotEmail(formData.email || "")
                  }}
                  className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div
                className={`form-group ${
                  inputError.password ? "border-red-400 bg-red-50/20" : "border-gray-200 focus-within:border-primary"
                } transition-colors`}
              >
                <span>
                  <TbLockPassword className="text-[20px] text-gray-400" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleFormdataChange}
                  className="form-input text-gray-900 placeholder:text-gray-400"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 cursor-pointer"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <IoEyeOffOutline size={19} /> : <IoEyeOutline size={19} />}
                </button>
              </div>
              {inputError.password && (
                <p className="text-[11px] text-red-500 mt-1 font-medium flex items-center gap-1">
                  <AlertCircle size={12} /> {inputError.password}
                </p>
              )}
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-primary accent-primary cursor-pointer"
                />
                <span className="text-xs sm:text-sm text-gray-600 font-medium">Remember email</span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="mt-3 flex flex-col gap-3">
              <button
                type="submit"
                disabled={!isFormFilled || isLoading}
                className="w-full bg-primary hover:bg-primary-hover active:scale-[0.99] rounded-xl py-3.5 shadow-md shadow-primary/20 flex items-center justify-center gap-2 smooth-transition disabled:opacity-45 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:bg-primary cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                    <span className="text-sm font-semibold text-white tracking-wide">
                      SIGNING IN...
                    </span>
                  </>
                ) : (
                  <span className="text-sm font-semibold text-white tracking-wide">
                    LOG IN
                  </span>
                )}
              </button>

              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-3 text-gray-400 font-medium">Or continue with</span>
                </div>
              </div>

              <button
                type="button"
                disabled={isLoading}
                onClick={() => hyveError("Google Sign-In", "Google OAuth will be available in the next release.")}
                className="w-full border border-gray-200 hover:bg-gray-50 active:scale-[0.99] rounded-xl py-3 flex justify-center items-center gap-2.5 shadow-sm smooth-transition cursor-pointer disabled:opacity-50"
              >
                <FcGoogle className="text-[20px]" />
                <span className="text-sm font-medium text-gray-700">
                  Continue with Google
                </span>
              </button>
            </div>
          </form>

          {/* Don't have an account */}
          <div className="mt-8 text-center pt-5 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              Don't have an account yet?{" "}
              <Link to="/auth/signup" className="text-primary font-bold hover:underline">
                Create an account
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="w-full max-w-md mx-auto text-center text-xs text-gray-400 space-y-1">
          <p>© {new Date().getFullYear()} HYVE Haven Limited (RC 9000322). All rights reserved.</p>
          <div className="flex items-center justify-center gap-3 text-gray-500">
            <Link to="/legal?policy=privacy" target="_blank" className="hover:text-primary transition">Privacy</Link>
            <span>•</span>
            <Link to="/legal?policy=terms" target="_blank" className="hover:text-primary transition">Terms</Link>
            <span>•</span>
            <Link to="/legal?policy=cookies" target="_blank" className="hover:text-primary transition">Cookies</Link>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Rich Hero Side Panel */}
      <div
        className="relative hidden md:flex md:w-1/2 bg-cover bg-center min-h-screen items-end p-8 lg:p-14"
        style={{ backgroundImage: `url(${loginPageSideImage})` }}
      >
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/30 backdrop-blur-[1px]" />

        {/* Floating Back Home Button */}
        <div className="absolute top-8 right-10 z-10">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-white/90 hover:text-white bg-white/15 hover:bg-white/25 backdrop-blur-md px-4 py-2 rounded-full text-xs font-medium border border-white/20 smooth-transition shadow-lg"
          >
            <IoIosArrowBack />
            <span>Back Home</span>
          </Link>
        </div>

        {/* Trust Highlights Card */}
        <div className="relative z-10 w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-white shadow-2xl space-y-4">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-primary text-white tracking-wider uppercase">
              Hyve Haven Guarantee
            </span>
          </div>

          <h3 className="text-xl font-bold font-montserrat leading-tight text-white">
            Safer, Accountable & Transparent Rentals
          </h3>

          <p className="text-xs text-white/80 leading-relaxed">
            Eliminating fake listings, agent opacity, and bidding wars with verifiable escrow payments and exclusive 1-tenant queue access.
          </p>

          <div className="pt-2 border-t border-white/15 space-y-2.5">
            <div className="flex items-center gap-2.5 text-xs text-white/90">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Check size={13} />
              </div>
              <span>100% verified properties & participant IDs</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-white/90">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck size={13} />
              </div>
              <span>Escrow protection until physical key handover</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-white/90">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Clock size={13} />
              </div>
              <span>Fair 24-hour exclusive decision window per tenant</span>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md p-6 sm:p-8 rounded-3xl shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button
              type="button"
              onClick={() => setShowForgotModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 transition-colors p-1"
            >
              <X size={20} />
            </button>

            {forgotSent ? (
              <div className="text-center py-4">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 font-montserrat">Check Your Inbox</h3>
                <p className="mt-2 text-xs sm:text-sm text-gray-600 leading-relaxed">
                  We've sent password reset instructions to <strong className="text-gray-900">{forgotEmail}</strong>.
                </p>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="mt-6 w-full py-3 bg-primary text-white rounded-xl font-semibold text-xs sm:text-sm hover:bg-primary-hover transition-colors"
                >
                  Done
                </button>
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-bold text-gray-900 font-montserrat">Reset Your Password</h3>
                <p className="mt-1 text-xs sm:text-sm text-gray-600">
                  Enter your registered email address and we will send you a secure link to reset your password.
                </p>

                <form onSubmit={handleForgotPassword} className="mt-5 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                      Your Email
                    </label>
                    <div className="form-group border-gray-200 focus-within:border-primary">
                      <span>
                        <IoIosAt className="text-[20px] text-gray-400" />
                      </span>
                      <input
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="form-input text-gray-900"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={isForgotLoading}
                      className="flex-1 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-semibold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isForgotLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                          <span>Sending Link...</span>
                        </>
                      ) : (
                        "Send Reset Link"
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(false)}
                      className="py-3 px-4 text-gray-600 hover:bg-gray-100 rounded-xl font-semibold text-xs sm:text-sm transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  )
}

export default Login
