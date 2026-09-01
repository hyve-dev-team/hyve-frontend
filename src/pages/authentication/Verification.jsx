import { useState, useRef, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import config from "../../config";

/* verification code length */
const CODE_LENGTH = 6;
const RESEND_COOLDOWN = 60; // 60 seconds

const Verification = () => {
  const navigate = useNavigate();

  const [code, setCode] = useState(new Array(CODE_LENGTH).fill(""));
  const [isError, setIsError] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(RESEND_COOLDOWN);

  // Array of refs to manage focus for each input box
  const inputRefs = useRef([]);

  // Memoize the full code string for submission purpose
  const fullCode = useMemo(() => code.join(""), [code]);

  // Countdown timer effect
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Format seconds into MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Handles typing a digit
  const handleInputChange = (e, index) => {
    const value = e.target.value;
    const newChar = value.slice(-1);

    if (newChar) {
      // Update the state with the new character
      const newCode = [...code];
      newCode[index] = newChar;
      setCode(newCode);

      // Auto-focus to the next input (if it exists)
      if (index < CODE_LENGTH - 1) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  // Handle pressing Backspace or deleting a digit
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      // If the current box is empty, move focus to the previous box
      if (code[index] === "" && index > 0) {
        e.preventDefault();
        inputRefs.current[index - 1].focus();
      }
      // If the current box is NOT empty, clear its value
      else if (code[index] !== "") {
        const newCode = [...code];
        newCode[index] = "";
        setCode(newCode);
      }
    }

    /* if enter key is clicked to submit verification */
    if (e.key === "Enter") {
      handleVerification(e);
    }
  };

  // Handles pasting a full code string
  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData
      .getData("text")
      .trim()
      .slice(0, CODE_LENGTH);

    // Ensure only numeric digits are used
    if (!/^\d+$/.test(pasteData)) return;

    const newCode = Array.from(pasteData).slice(0, CODE_LENGTH);

    // Pad with empty strings if the pasted code is shorter than CODE_LENGTH
    while (newCode.length < CODE_LENGTH) {
      newCode.push("");
    }

    setCode(newCode);

    // Move focus to the last input box or the first empty box
    const focusIndex =
      newCode.slice(0, CODE_LENGTH).findIndex((char) => char === "") ||
      CODE_LENGTH - 1;
    inputRefs.current[focusIndex].focus();
  };

  /* Handle resend OTP */
  const handleResend = async () => {
    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail || isResending || timeLeft > 0) return;

    setIsResending(true);
    try {
      const res = await config.postAPI({
        url: "/api/v1/auth/resend-otp",
        params: { email: userEmail },
      });
      if (res?.success) {
        setTimeLeft(RESEND_COOLDOWN);
        alert(res?.message || "Code resent — check your email.");
      } else {
        alert(res?.message || "Couldn't resend the code.");
      }
    } catch (error) {
      console.error("Resend OTP error:", error);
      alert("Couldn't resend the code. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  /* Handle Verification Logic */
  const handleVerification = async (e) => {
    e.preventDefault();

    const userEmail = localStorage.getItem("userEmail");
    const userRole = localStorage.getItem("userRole");

    if (fullCode.length !== CODE_LENGTH) {
      setIsError(true);
      return;
    }
    setIsError(false);

    try {
      // Real backend: verify-otp activates the account AND returns a real
      // token + user in one call — no separate set-password/login step needed.
      const res = await config.postAPI({
        url: "/api/v1/auth/verify-otp",
        params: { email: userEmail, otp: fullCode },
      });

      if (!res?.success || !res?.data?.token) {
        setIsError(true);
        alert(
          res?.message ||
            "Verification failed. Please check the code and try again.",
        );
        return;
      }

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.removeItem("userEmail");

      alert("Verification successful! Redirecting to your dashboard...");

      if (userRole === "landlord") {
        navigate("/landlord/dashboard");
      } else {
        navigate("/user/dashboard");
      }
    } catch (error) {
      console.error("Verification error:", error);
      setIsError(true);
      alert("Something went wrong verifying your code. Please try again.");
    }
  };

  return (
    <>
      <main className="px-4 centralizeContent md:px-20">
        <div className="w-full md:w-[60%] text-center">
          <div>
            <h3 className="font-normal text-[18px] md:text-[24px]">
              Welcome to HIVE
            </h3>
            <p className="font-light text-[#707070] text-sm md:text-[16px]">
              We’ve sent a 6-digit code to your email
            </p>
          </div>

          <div className="mt-10">
            <div className="flex flex-col items-center p-10">
              <p className="mb-8 font-light text-sm md:text-[16px]">
                Enter code below to continue
              </p>

              {/* Input Group Container */}
              <div
                className="flex space-x-2 sm:space-x-3 md:space-x-6"
                onPaste={handlePaste}
              >
                {code.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength="1"
                    className={`verificationBox ${isError ? "border-red-500 focus:ring-red-300" : ""}`}
                    value={digit}
                    onChange={(e) => handleInputChange(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    ref={(el) => (inputRefs.current[index] = el)}
                    autoFocus={index === 0}
                    aria-label={`Digit ${index + 1} of ${CODE_LENGTH}`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleVerification}
              className=" w-[80%] sm:w-[50%] py-3 sm:py-4 rounded-full text-white bg-primary hover:bg-primary-hover shadow-sm font-normal text-sm smooth-transition"
            >
              Verify
            </button>

            <div className="mt-6">
              <p className="text-sm text-[#707070]">
                Didn't get code?{" "}
                {timeLeft > 0 ? (
                  <span className="font-medium text-primary">
                    Resend in {formatTime(timeLeft)}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={isResending}
                    className="text-primary font-medium hover:underline cursor-pointer disabled:opacity-50 inline-block bg-transparent border-none p-0"
                  >
                    {isResending ? "Resending..." : "Resend code"}
                  </button>
                )}
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Verification;
