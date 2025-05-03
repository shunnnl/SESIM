import React, { useState, useEffect } from "react";

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export const SignUpModal: React.FC<SignUpModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [emailError, setEmailError] = useState("");
  const [verificationCodeError, setVerificationCodeError] = useState("");

  const [isVerificationCodeSent, setIsVerificationCodeSent] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isVerificationCodeFocused, setIsVerificationCodeFocused] = useState(false);

  const handleClose = () => {
    setEmail("");
    setVerificationCode("");
    setEmailError("");
    setVerificationCodeError("");
    setIsVerificationCodeSent(false);
    onClose();
  };


  const handleRequestVerificationCode = async () => {
    setEmailError("");
    if (!email) {
      setEmailError("이메일을 입력해주세요.");
      return;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("유효한 이메일 형식이 아닙니다.");
      return;
    }

    try {
      console.log(`인증번호 요청: ${email}`);
      // TODO: 여기에 이메일로 인증번호를 보내는 API 호출 로직 구현
      setIsVerificationCodeSent(true);
    } catch (error) {
      console.error("인증번호 요청 실패:", error);
    }
  };


  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setVerificationCodeError("6자리 인증번호를 입력해주세요.");
      return;
    }
  
    try {
      // TODO: 인증번호 검증 API 호출
      const isValid = false;
      if (!isValid) {
        setVerificationCodeError("인증번호가 올바르지 않습니다. 다시 시도해주세요.");
      } else {
        console.log("인증 성공!");
        // ToDo: 인증 성공 후 처리 로직 구현
      }
    } catch (error) {
      console.error("인증번호 검증 실패:", error);
      setVerificationCodeError("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    }
  };


  const handleNextButtonClick = (e: React.FormEvent) => {
    e.preventDefault();
    handleVerifyCode();
  };


  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
    } else {
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender && !isOpen) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center transition-all duration-300 ${isOpen ? "opacity-100 animate-fadeIn" : "opacity-0 animate-fadeOut"}`}
      onClick={handleClose}
    >
      <div
        className={`relative w-[90%] sm:w-[80%] md:w-[60%] lg:w-[35%] max-h-[750px] rounded-[30px] transform transition-all duration-300 ${isOpen ? "opacity-100 translate-y-0 animate-slideIn" : "opacity-0 translate-y-4 animate-slideOut"}`}
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

        <div className="flex flex-col items-center w-full h-full py-10 sm:py-12 md:py-16 px-6 sm:px-10 md:px-16 rounded-[28px] bg-[#020207]/80">
          <p className="font-['Pretendard'] font-bold text-3xl md:text-4xl text-center text-white mb-10">
            회원가입
          </p>

          <div className="flex flex-col items-center gap-12 w-full mb-10">
            <div className="w-full">
              {/* 이메일 입력 */}
              <div className="relative group flex flex-row items-end gap-2">
                <div className="flex-grow relative group">
                  <label
                    className={`absolute font-['Pretendard'] font-medium text-xs text-[#A3A3A3] transition-all duration-300 ${isEmailFocused || email ? "top-[-10px] opacity-100" : "top-[50%] translate-y-[-50%] opacity-0"}`}
                  >
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
                  <div className="absolute bottom-0 left-0 w-full h-[1px] bg-[#848484]/50 group-hover:bg-[#848484] transition-all duration-300"></div>
                  <div className={`absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-[#263F7C] via-[#3B66AF] to-[#035179] transition-all duration-300 ${isEmailFocused ? "w-full" : ""} group-focus-within:w-full`}></div>
                  {emailError && <p className="font-['Pretendard'] text-red-500 text-xs mt-1 absolute -bottom-5 left-1">{emailError}</p>}
                </div>
                <button
                  type="button"
                  onClick={handleRequestVerificationCode}
                  disabled={isVerificationCodeSent}
                  className={`font-['Pretendard'] text-sm font-medium px-3 py-3 rounded-md border border-[#A3A3A3]/50 text-[#A3A3A3] hover:border-white hover:text-white transition-colors duration-300 whitespace-nowrap ${isVerificationCodeSent ? "bg-gray-600 cursor-not-allowed opacity-50" : "bg-transparent"}`}
                >
                  인증번호 받기
                </button>
              </div>
            </div>
            
            {/* 인증번호 입력 */}
            <div className="w-full">
              <div className="relative group">
                <label
                  className={`absolute font-['Pretendard'] font-medium text-xs text-[#A3A3A3] transition-all duration-300 ${isVerificationCodeFocused || verificationCode ? "top-[-10px] opacity-100" : "top-[50%] translate-y-[-50%] opacity-0"}`}
                >
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
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-[#848484]/50 group-hover:bg-[#848484] transition-all duration-300"></div>
                <div className={`absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-[#263F7C] via-[#3B66AF] to-[#035179] transition-all duration-300 ${isVerificationCodeFocused ? "w-full" : ""} group-focus-within:w-full`}></div>
                {verificationCodeError && <p className="font-['Pretendard'] text-red-500 text-xs mt-1 absolute -bottom-5 left-1">{verificationCodeError}</p>}
              </div>
            </div>

            <div className="flex flex-col gap-4 w-full mt-4">
              <form onSubmit={handleNextButtonClick}
              >
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
                    다음
                  </div>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};