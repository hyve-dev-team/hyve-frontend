import { useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';


/* verification code length */
const CODE_LENGTH = 6;

const Verification = () => {
    const navigate = useNavigate();

    const [code, setCode] = useState(new Array(CODE_LENGTH).fill(''));
    const [isError, setIsError] = useState(false)

    // Array of refs to manage focus for each input box
    const inputRefs = useRef([]);

    // Memoize the full code string for submission purpose
    const fullCode = useMemo(() => code.join(''), [code]);

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
        if (e.key === 'Backspace') {
            // If the current box is empty, move focus to the previous box
            if (code[index] === '' && index > 0) {
                e.preventDefault();
                inputRefs.current[index - 1].focus();
            }
            // If the current box is NOT empty, clear its value
            else if (code[index] !== '') {
                const newCode = [...code];
                newCode[index] = '';
                setCode(newCode);
            }
        }

        /* if enter key is clicked to submit verification */
        if (e.key === 'Enter') {
            handleVerification(e)
        }
    };



    // Handles pasting a full code string
    const handlePaste = (e) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData('text').trim().slice(0, CODE_LENGTH);

        // Ensure only numeric digits are used
        if (!/^\d+$/.test(pasteData)) return;

        const newCode = Array.from(pasteData).slice(0, CODE_LENGTH);

        // Pad with empty strings if the pasted code is shorter than CODE_LENGTH
        while (newCode.length < CODE_LENGTH) {
            newCode.push('');
        }

        setCode(newCode);

        // Move focus to the last input box or the first empty box
        const focusIndex = newCode.slice(0, CODE_LENGTH).findIndex(char => char === '') || CODE_LENGTH - 1;
        inputRefs.current[focusIndex].focus();
    };



    /* Handle Verification Logic */
    const handleVerification = async (e) => {
        e.preventDefault();

        const userEmail = localStorage.getItem("userEmail");
        const userRole = localStorage.getItem("userRole");

        
        /* if user is tenant now verify the email */
        if (userRole === "user" && fullCode.length === 6) {
            setIsError(false)
            console.log(fullCode.length)

            // 
            const res = await fetch("http://localhost:1909/api/tenant/verify-email", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email: userEmail, otp: fullCode}),
            });

            const resData = await res.json();

            if (!res.ok) {
                console.error(resData.error.message || "Registration failed");
                return;
            }
            alert("Verification successful! Redirecting to dashboard...");
            navigate("/user/dashboard")
            localStorage.removeItem("userEmail");
        } else {
            /* if inputed code is not up to 6, send an error feedback */
            setIsError(true)
        }

        /* if user is landlord now verify the email */
        if (userRole === "landlord" && fullCode.length === 6) {
            setIsError(false)
            console.log(fullCode.length)

            alert("Verification successful! Redirecting to your dashboard...");
            navigate("/landlord/dashboard")
            localStorage.removeItem("userEmail");
            localStorage.removeItem("userRole");
        } else {
            /* if inputed code is not up to 6, send an error feedback */
            setIsError(true)
        }
    }

    return (
        <>
            <main className='px-4 centralizeContent md:px-20'>
                <div className='w-full md:w-[60%] text-center'>
                    <div>
                        <h3 className='font-normal text-[18px] md:text-[24px]'>Welcome to HIVE</h3>
                        <p className='font-light text-[#707070] text-sm md:text-[16px]'>We’ve sent a 6-digit code to your email</p>
                    </div>

                    <div className='mt-10'>
                        <div className="flex flex-col items-center p-10">
                            <p className="mb-8 font-light text-sm md:text-[16px]">Enter code below to continue</p>

                            {/* Input Group Container */}
                            <div className="flex space-x-2 sm:space-x-3 md:space-x-6" onPaste={handlePaste}>
                                {code.map((digit, index) => (
                                    <input
                                        key={index}
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        maxLength="1"
                                        className={`verificationBox ${isError ? 'border-red-500 focus:ring-red-300' : ""}`}
                                        value={digit}
                                        onChange={(e) => handleInputChange(e, index)}
                                        onKeyDown={(e) => handleKeyDown(e, index)}
                                        ref={el => inputRefs.current[index] = el}
                                        autoFocus={index === 0}
                                        aria-label={`Digit ${index + 1} of ${CODE_LENGTH}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className='mt-6'>
                        <button onClick={handleVerification} className=' w-[80%] sm:w-[50%] py-3 sm:py-4 rounded-full text-white bg-primary hover:bg-primary-hover shadow-sm font-normal text-sm smooth-transition'>
                            Verify
                        </button>

                        <div className='mt-6'>
                            <p className='text-sm'>Didn't get code? <span className='text-[#AAAAAA] cursor-pointer'>Resend in 30s</span></p>
                        </div>
                    </div>
                </div>
            </main>
        </>
    )
}

export default Verification