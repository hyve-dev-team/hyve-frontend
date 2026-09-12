import { useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import config from "../../config"
import { hyveSuccess, hyveError } from "../../utils/hyveToast"
import hyveLogo from "../../assets/svg/logo/hyve-logo.svg"
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5"
import { TbLockPassword } from "react-icons/tb"
import { Loader2, CheckCircle2, AlertCircle, ArrowLeft, KeyRound } from "lucide-react"

const ResetPassword = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const token = searchParams.get("token") || ""
  const email = searchParams.get("email") || ""

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage("")

    if (!token) {
      setErrorMessage("Missing or invalid reset token. Please request a new reset link.")
      return
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.")
      return
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please verify and try again.")
      return
    }

    setIsLoading(true)
    try {
      const res = await config.postAPI({
        url: "/api/v1/auth/reset-password",
        params: {
          token: token.trim(),
          newPassword: password,
        },
      })

      if (res?.success) {
        setIsSuccess(true)
        hyveSuccess("Password Reset", "Your password has been reset successfully.")
      } else {
        const msg = res?.message || "Failed to reset password. The link may have expired."
        setErrorMessage(msg)
        hyveError("Reset Failed", msg)
      }
    } catch (err) {
      console.error("Reset password error:", err)
      const msg = err?.message || "Failed to reset password. Please request a new link."
      setErrorMessage(msg)
      hyveError("Reset Failed", msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center px-4 py-12">
      {/* Brand Logo */}
      <div className="mb-8 text-center">
        <Link to="/" className="inline-block">
          <img src={hyveLogo} alt="Hyve Haven" className="h-9 w-auto object-contain mx-auto" />
        </Link>
      </div>

      {/* Main Container Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-10">
        {isSuccess ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm">
              <CheckCircle2 size={36} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 font-montserrat">Password Changed!</h2>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              Your password has been successfully updated. You can now use your new password to sign in.
            </p>
            <button
              type="button"
              onClick={() => navigate("/auth/signin")}
              className="mt-8 w-full py-3.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-semibold text-sm transition-all shadow-md shadow-primary/20 cursor-pointer"
            >
              Sign In to Your Account →
            </button>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="mb-6 text-center">
              <div className="w-12 h-12 bg-orange-50 text-primary rounded-xl flex items-center justify-center mx-auto mb-3">
                <KeyRound size={24} />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 font-montserrat">Create New Password</h1>
              <p className="mt-1 text-xs sm:text-sm text-gray-500">
                {email ? (
                  <>Resetting password for <strong className="text-gray-800">{email}</strong></>
                ) : (
                  "Enter a strong new password for your Hyve Haven account."
                )}
              </p>
            </div>

            {/* Error Notification */}
            {errorMessage && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-100 flex items-start gap-2.5 text-red-700 text-xs sm:text-sm">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            {!token && (
              <div className="mb-5 p-3.5 rounded-xl bg-amber-50 border border-amber-100 flex items-start gap-2.5 text-amber-800 text-xs sm:text-sm">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                <span>Invalid or missing reset token. Please use the link sent to your email or request a new one.</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* New Password */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  New Password
                </label>
                <div className="form-group border border-gray-200 rounded-xl px-3 py-2.5 flex items-center focus-within:border-primary transition-colors">
                  <span className="text-gray-400 mr-2">
                    <TbLockPassword className="text-[20px]" />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full text-sm text-gray-900 outline-none bg-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <IoEyeOffOutline size={18} /> : <IoEyeOutline size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Confirm New Password
                </label>
                <div className="form-group border border-gray-200 rounded-xl px-3 py-2.5 flex items-center focus-within:border-primary transition-colors">
                  <span className="text-gray-400 mr-2">
                    <TbLockPassword className="text-[20px]" />
                  </span>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your new password"
                    className="w-full text-sm text-gray-900 outline-none bg-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <IoEyeOffOutline size={18} /> : <IoEyeOutline size={18} />}
                  </button>
                </div>
              </div>

              {/* Password hint */}
              <p className="text-[11px] text-gray-400">
                Hint: Use at least 6 characters with a combination of letters and numbers.
              </p>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !token}
                className="w-full mt-2 py-3.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-semibold text-sm transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  "Reset Password"
                )}
              </button>

              {/* Back to sign in */}
              <div className="pt-3 text-center">
                <Link
                  to="/auth/signin"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-primary transition-colors"
                >
                  <ArrowLeft size={14} /> Back to Sign In
                </Link>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Footer copyright */}
      <p className="mt-8 text-xs text-gray-400 text-center">
        © 2026 Hyve Haven Inc. • Modern Student Living
      </p>
    </main>
  )
}

export default ResetPassword
