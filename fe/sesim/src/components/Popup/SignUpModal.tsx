import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { EyeIcon, EyeSlashIcon } from "../common/Icons";
import { emailVerify, sendVerificationCode, signUp } from "../../services/authService";

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

const formVariants = {
  hidden: { opacity: 0, y: 50, height: 0 },
  visible: { opacity: 1, y: 0, height: "auto", transition: { duration: 0.3, ease: "easeInOut" } },
  exit: { opacity: 0, y: -50, height: 0, transition: { duration: 0.3, ease: "easeInOut" } },
};

export const SignUpModal: React.FC<SignUpModalProps> = ({ isOpen, onClose, onSwitchToLogin }) => {
  const [step, setStep] = useState<"emailVerify" | "setDetails">("emailVerify");

  // step 1: 이메일 인증
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [emailError, setEmailError] = useState("");
  const [verificationCodeError, setVerificationCodeError] = useState("");
  const [isVerificationCodeSent, setIsVerificationCodeSent] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isVerificationCodeFocused, setIsVerificationCodeFocused] = useState(false);
  const [isEmailShaking, setIsEmailShaking] = useState(false);
  const [isVerificationCodeShaking, setIsVerificationCodeShaking] = useState(false);
  const [verificationCodeTimeLeft, setVerificationCodeTimeLeft] = useState(600);
  const [isSendingVerificationCode, setIsSendingVerificationCode] = useState(false);
  const [timerActive, setTimerActive] = useState(false);

  // step 2: 닉네임, 비밀번호 설정
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nicknameError, setNicknameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [isNicknameFocused, setIsNicknameFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [shouldRender, setShouldRender] = useState(false);

  const resetEmailVerifyForm = () => {
    setEmail("");
    setVerificationCode("");
    setEmailError("");
    setVerificationCodeError("");
    setIsVerificationCodeSent(false);
  }


  const resetSetDetailsForm = () => {
    setNickname("");
    setPassword("");
    setConfirmPassword("");
    setNicknameError("");
    setPasswordError("");
    setConfirmPasswordError("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  }


  const handleClose = () => {
    setTimeout(() => {
      resetEmailVerifyForm();
      resetSetDetailsForm();
      setStep("emailVerify");
    }, 300);
    onClose();
  };


  const handleRequestVerificationCode = async () => {
    setEmailError("");
    setIsSendingVerificationCode(true);

    if (!email) {
      setEmailError("이메일을 입력해주세요.");
      setIsSendingVerificationCode(false);
      return;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("유효한 이메일 형식이 아닙니다.");
      setIsSendingVerificationCode(false);
      return;
    }

    try {
      const response = await sendVerificationCode({ email });

      if (response.success) {
        console.log("인증번호 요청 성공: ", response);

        setIsVerificationCodeSent(true);
        setVerificationCodeTimeLeft(600);
        setTimerActive(true);
      } else {
        console.log("인증번호 요청 실패: ", response);

        if (response.error.code === "EMAIL_ALREADY_EXISTS") {
          setEmailError("이미 가입된 이메일입니다.");
        } else {
          setEmailError("인증번호 요청 실패");
        }
      }
    } catch (error) {
      console.error("인증번호 요청 실패:", error);
      setEmailError("네트워크 통신 오류가 발생했습니다.");
    } finally {
      setIsSendingVerificationCode(false);
    }
  };


  const validateEmailVerifyForm = () => {
    let isValid = true;

    setEmailError("");
    setVerificationCodeError("");
    setIsEmailShaking(false);
    setIsVerificationCodeShaking(false);

    if (!email) {
      setEmailError("이메일을 입력해주세요.");
      setIsEmailShaking(true);
      isValid = false;
    }

    if (!verificationCode || verificationCode.length !== 6) {
      setVerificationCodeError("인증번호를 입력해주세요.");
      setIsVerificationCodeShaking(true);
      isValid = false;
    }

    setTimeout(() => {
      setIsEmailShaking(false);
      setIsVerificationCodeShaking(false);
    }, 500);

    return isValid;
  }


  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };


  const handleVerifyCode = async () => {
    if (!validateEmailVerifyForm()) {
      return;
    }

    try {
      const response = await emailVerify({ email, code: verificationCode });

      console.log(response);
      const isValid = response.success;

      if (!isValid) {
        setIsVerificationCodeShaking(true);
        setVerificationCodeError("인증번호가 올바르지 않습니다. 다시 시도해주세요.");
      } else {
        console.log("인증 성공!");
        setStep("setDetails");
      }
    } catch (error) {
      console.error("인증번호 검증 실패:", error);
      setVerificationCodeError("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    }
  };


  const validateSignUpForm = () => {
    if (!nickname) {
      setNicknameError("닉네임을 입력해주세요.");
      return false;
    }

    if (!password) {
      setPasswordError("비밀번호를 입력해주세요.");
      return false;
    }

    if (!confirmPassword) {
      setConfirmPasswordError("비밀번호를 다시 입력해주세요.");
      return false;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError("비밀번호가 일치하지 않습니다.");
      return false;
    }

    return true;
  }


  const handleSignUp = async () => {
    if (!validateSignUpForm()) {
      return;
    }

    try {
      const response = await signUp({ email, password, nickname });

      if (response.success) {
        console.log("회원가입 성공");
        handleClose();
      }
    } catch (error) {
      console.error("회원가입 실패:", error);
    }
  }


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    switch (step) {
      case "emailVerify":
        handleVerifyCode();
        break;
      case "setDetails":
        handleSignUp();
        break;
    }
  };


  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);

    } else {
      const timer = setTimeout(() => {
        setShouldRender(false);
        resetEmailVerifyForm();
        resetSetDetailsForm();
        setStep("emailVerify");
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);


  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    
    if (timerActive && verificationCodeTimeLeft > 0) {
      timer = setInterval(() => {
        setVerificationCodeTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (verificationCodeTimeLeft === 0) {
      setTimerActive(false);
      setIsVerificationCodeSent(false);
    }
    
    return () => clearInterval(timer);
  }, [timerActive, verificationCodeTimeLeft]);


  if (!shouldRender && !isOpen) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center transition-all duration-300 ${isOpen ? "opacity-100 animate-fadeIn" : "opacity-0 animate-fadeOut"}`}
      onClick={handleClose}
    >
      <motion.div
        className={`relative w-[90%] sm:w-[80%] md:w-[60%] lg:w-[35%] max-h-[750px] rounded-[30px] transform transition-all duration-300 ${isOpen ? "opacity-100 translate-y-0 animate-slideIn" : "opacity-0 translate-y-4 animate-slideOut"}`}
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="absolute inset-0 rounded-[30px] p-[2px]"
          style={{
            background: "linear-gradient(to bottom right, #263F7C, #3B66AF, #035179, #5D659A)",
            WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
            pointerEvents: "none",
          }}
        ></div>

        <motion.div
          layout
          className="flex flex-col items-center w-full h-full py-10 sm:py-12 md:py-16 px-6 sm:px-10 md:px-16 rounded-[28px] bg-[#020207]/80"
        >
          <p className="font-['Pretendard'] font-bold text-3xl md:text-4xl text-center text-white mb-10">
            회원가입
          </p>

          <motion.div
            layout
            className="w-full"
          >
            <AnimatePresence
              mode="wait"
              initial={false}
            >
              {step === "emailVerify" && (
                <motion.div
                  key="emailVerify"
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={formVariants}
                  className="flex flex-col items-center gap-10 w-full overflow-hidden p-2 pb-10"
                >
                  {/* 이메일 입력 */}
                  <div className="w-full">
                    <div className="relative group flex flex-row items-end gap-2">
                      <div className="flex-grow relative group">
                        <label className={`absolute font-['Pretendard'] font-medium text-xs text-[#A3A3A3] transition-all duration-300 ${isEmailFocused || email ? "top-[-10px] opacity-100" : "top-[50%] translate-y-[-50%] opacity-0"}`}>
                          이메일
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (emailError) {
                              return setEmailError("");
                            }
                          }}
                          onFocus={() => setIsEmailFocused(true)}
                          onBlur={() => setIsEmailFocused(false)}
                          placeholder={isEmailFocused ? "" : "이메일 주소를 입력해주세요."}
                          className="w-full bg-transparent font-['Pretendard'] font-medium text-base md:text-lg text-[#A3A3A3] focus:text-white focus:outline-none py-2 px-1 [&:not(:placeholder-shown)]:text-white"
                          disabled={isVerificationCodeSent}
                        />
                        <div className={`absolute bottom-0 left-0 w-full h-[1px] ${isEmailShaking ? "bg-red-500 animate-shake" : "bg-[#848484]/50 group-hover:bg-[#848484]"} transition-all duration-300`}></div>
                        <div className={`absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-[#263F7C] via-[#3B66AF] to-[#035179] transition-all duration-300 ${isEmailFocused ? "w-full" : ""} group-focus-within:w-full`}></div>
                        {emailError &&
                          <p className="font-['Pretendard'] text-red-500 text-xs mt-1 absolute -bottom-5 left-1">
                            {emailError}
                          </p>
                        }
                      </div>

                      {/* 인증번호 요청 버튼 */}
                      <div className="flex flex-col items-end gap-1">
                        <button
                          type="button"
                          onClick={handleRequestVerificationCode}
                          disabled={isVerificationCodeSent || isSendingVerificationCode}
                          className={`font-['Pretendard'] text-sm font-medium px-3 py-3 rounded-md border transition-colors duration-300 whitespace-nowrap flex items-center justify-center gap-2 min-w-[120px]
                            ${isVerificationCodeSent
                              ? "bg-gray-600 cursor-not-allowed opacity-50 border-gray-500 text-gray-400"
                              : (isSendingVerificationCode ? "border-[#A3A3A3]/50 text-[#A3A3A3] bg-transparent" : "border-[#A3A3A3]/50 text-[#A3A3A3] hover:border-white hover:text-white bg-transparent")
                            }`}
                        >
                        s {isSendingVerificationCode ? (
                            <>
                              <svg
                                className="animate-spin h-5 w-5 text-[#A3A3A3]"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                            </>
                          ) : (
                            isVerificationCodeSent ? "재전송 대기" : "인증번호 받기"
                          )}
                          {isVerificationCodeSent && (
                            <span className="font-['Pretendard'] text-xs text-[#A3A3A3] absolute -bottom-5 right-1">
                              제한 시간 {formatTime(verificationCodeTimeLeft)}
                            </span>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 인증번호 입력 */}
                  <motion.div
                    key="verificationCodeInput"
                    className="w-full"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="relative group">
                      <label className={`absolute font-['Pretendard'] font-medium text-xs text-[#A3A3A3] transition-all duration-300 ${isVerificationCodeFocused || verificationCode ? "top-[-10px] opacity-100" : "top-[50%] translate-y-[-50%] opacity-0"}`}>
                        인증번호
                      </label>
                      <input
                        type="text"
                        value={verificationCode}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "");
                          if (value.length <= 6) {
                            setVerificationCode(value);
                          }
                          if (verificationCodeError) {
                            return setVerificationCodeError("");
                          }
                        }}
                        onFocus={() => setIsVerificationCodeFocused(true)}
                        onBlur={() => setIsVerificationCodeFocused(false)}
                        placeholder={isVerificationCodeFocused ? "" : "●●●●●●"}
                        className="w-full bg-transparent text-start font-mono text-2xl text-white placeholder-[#555] border-b-2 border-[#555]/50 focus:border-[#3B66AF] focus:outline-none py-2 px-1 tracking-[6px]"
                        maxLength={6}
                      />
                      <div className={`absolute bottom-0 left-0 w-full h-[1px] ${isVerificationCodeShaking ? "bg-red-500 animate-shake" : "bg-[#848484]/50 group-hover:bg-[#848484]"} transition-all duration-300`}></div>
                      <div className={`absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-[#263F7C] via-[#3B66AF] to-[#035179] transition-all duration-300 ${isVerificationCodeFocused ? "w-full" : ""} group-focus-within:w-full`}></div>
                      {verificationCodeError &&
                        <p className="font-['Pretendard'] text-red-500 text-xs mt-1 absolute -bottom-5 left-1">
                          {verificationCodeError}
                        </p>
                      }
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {/* step 2: 닉네임, 비밀번호 설정 */}
              {step === "setDetails" && (
                <>
                  <motion.div
                    key="setDetails"
                    variants={formVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="w-full flex flex-col items-center gap-10 overflow-hidden p-2 pb-10"
                  >
                    {/* 이메일 확인 */}
                    <div className="relative group flex flex-row items-end gap-2 w-full">
                      <label className={`absolute font-['Pretendard'] font-medium text-xs text-[#A3A3A3] transition-all duration-300 ${isEmailFocused || email ? "top-[-10px] opacity-100" : "top-[50%] translate-y-[-50%] opacity-0"}`}>
                        이메일
                      </label>
                      <p className="w-full bg-transparent font-['Pretendard'] font-medium text-base md:text-lg text-[#A3A3A3] py-2 px-1">
                        {email}
                      </p>
                      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-[#848484]/50 transition-all duration-300"></div>
                    </div>

                    {/* 닉네임 입력 */}
                    <div className="w-full">
                      <div className="relative group">
                        <label
                          className={`absolute font-['Pretendard'] font-medium text-xs text-[#A3A3A3] transition-all duration-300 ${isNicknameFocused || nickname ? "top-[-10px] opacity-100" : "top-[50%] translate-y-[-50%] opacity-0"}`}
                        >
                          닉네임
                        </label>
                        <input
                          type="text"
                          value={nickname}
                          onChange={(e) => {
                            setNickname(e.target.value);
                            if (nicknameError) {
                              setNicknameError("");
                            }
                          }}
                          onFocus={() => setIsNicknameFocused(true)}
                          onBlur={() => setIsNicknameFocused(false)}
                          placeholder={isNicknameFocused ? "" : "사용하실 닉네임을 입력해주세요."}
                          className="w-full bg-transparent font-['Pretendard'] font-medium text-base md:text-lg text-[#A3A3A3] focus:text-white focus:outline-none py-2 px-1 [&:not(:placeholder-shown)]:text-white"
                          maxLength={15}
                        />
                        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-[#848484]/50 group-hover:bg-[#848484] transition-all duration-300"></div>
                        <div className={`absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-[#263F7C] via-[#3B66AF] to-[#035179] transition-all duration-300 ${isNicknameFocused ? "w-full" : ""} group-focus-within:w-full`}></div>
                        {nicknameError && <p className="font-['Pretendard'] text-red-500 text-xs mt-1 absolute -bottom-5 left-1">{nicknameError}</p>}
                      </div>
                    </div>

                    {/* 비밀번호 입력 */}
                    <div className="w-full">
                      <div className="relative group">
                        <label className={`absolute font-['Pretendard'] font-medium text-xs text-[#A3A3A3] transition-all duration-300 ${isPasswordFocused || password ? "top-[-10px] opacity-100" : "top-[50%] translate-y-[-50%] opacity-0"}`}>
                          비밀번호
                        </label>
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            if (passwordError) {
                              setPasswordError("");
                            }
                            if (confirmPasswordError && e.target.value === confirmPassword) {
                              setConfirmPasswordError("");
                            }
                          }}
                          onFocus={() => setIsPasswordFocused(true)}
                          onBlur={() => setIsPasswordFocused(false)}
                          placeholder={isPasswordFocused ? "" : "비밀번호를 입력해주세요."}
                          className="w-full bg-transparent font-['Pretendard'] font-medium text-base md:text-lg text-[#A3A3A3] focus:text-white focus:outline-none py-2 pr-10 pl-1 [&:not(:placeholder-shown)]:text-white"
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#A3A3A3] hover:text-white transition-colors duration-300 focus:outline-none p-1"
                        >
                          {showPassword ? (<EyeSlashIcon />) : (<EyeIcon />)}
                        </button>
                        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-[#848484]/50 group-hover:bg-[#848484] transition-all duration-300"></div>
                        <div className={`absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-[#263F7C] via-[#3B66AF] to-[#035179] transition-all duration-300 ${isPasswordFocused ? "w-full" : ""} group-focus-within:w-full`}></div>
                        {passwordError &&
                          <p className="font-['Pretendard'] text-red-500 text-xs mt-1 absolute -bottom-5 left-1">
                            {passwordError}
                          </p>
                        }
                      </div>
                    </div>

                    {/* 비밀번호 입력 확인 */}
                    <div className="w-full">
                      <div className="relative group">
                        <label
                          className={`absolute font-['Pretendard'] font-medium text-xs text-[#A3A3A3] transition-all duration-300 ${isConfirmPasswordFocused || confirmPassword ? "top-[-10px] opacity-100" : "top-[50%] translate-y-[-50%] opacity-0"}`}
                        >
                          비밀번호 확인
                        </label>
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            if (confirmPasswordError) {
                              return setConfirmPasswordError("");
                            }
                            if (passwordError && e.target.value === password) {
                              setPasswordError("");
                            }
                          }}
                          onFocus={() => setIsConfirmPasswordFocused(true)}
                          onBlur={() => setIsConfirmPasswordFocused(false)}
                          placeholder={isConfirmPasswordFocused ? "" : "비밀번호를 다시 입력해주세요."}
                          className="w-full bg-transparent font-['Pretendard'] font-medium text-base md:text-lg text-[#A3A3A3] focus:text-white focus:outline-none py-2 pr-10 pl-1 [&:not(:placeholder-shown)]:text-white"
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#A3A3A3] hover:text-white transition-colors duration-300 focus:outline-none p-1"
                        >
                          {showConfirmPassword ? (<EyeSlashIcon />) : (<EyeIcon />)}
                        </button>
                        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-[#848484]/50 group-hover:bg-[#848484] transition-all duration-300"></div>
                        <div className={`absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-[#263F7C] via-[#3B66AF] to-[#035179] transition-all duration-300 ${isConfirmPasswordFocused ? "w-full" : ""} group-focus-within:w-full`}></div>
                        {confirmPasswordError &&
                          <p className="font-['Pretendard'] text-red-500 text-xs mt-1 absolute -bottom-5 left-1">
                            {confirmPasswordError}
                          </p>
                        }
                      </div>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div
            layout
            className="flex flex-col gap-4 w-full"
          >
            {/* 인증번호 확인/회원가입 버튼 */}
            <form onSubmit={handleSubmit}>
              <button
                type="submit"
                className="relative rounded-[30px] p-[2px] group hover:scale-[1.01] transition-all duration-300 w-full"
              >
                <div
                  className="absolute inset-0 rounded-[30px] p-[2px] transition-all duration-300 opacity-50 group-hover:opacity-100"
                  style={{
                    background: "linear-gradient(to bottom right, #263F7C, #3B66AF, #035179, #5D659A)",
                    WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    WebkitMaskComposite: "xor",
                    maskComposite: "exclude",
                    pointerEvents: "none",
                  }}
                ></div>
                <div className="relative block w-full text-center rounded-[28px] font-['Pretendard'] font-medium text-lg md:text-xl text-white py-2 sm:py-3 transition-all duration-300 backdrop-blur-md group-hover:bg-white/[0.05]">
                  {step === "emailVerify" ? "인증번호 확인" : "회원가입"}
                </div>
              </button>
            </form>

            {/* 로그인 버튼 */}
            <div className="flex justify-end">
              <span className="font-['Pretendard'] font-medium text-sm md:text-base text-[#A3A3A3]">
                이미 계정이 있으신가요?{"  "}
                <a
                  onClick={onSwitchToLogin}
                  className="text-[#FFFFFF] font-bold text-sm md:text-base cursor-pointer"
                >
                  로그인
                </a>
              </span>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};