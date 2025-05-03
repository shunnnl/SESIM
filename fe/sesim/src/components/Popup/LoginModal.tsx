import React, { useState, useEffect } from "react";
import { login } from "../../services/authService";
import { EyeIcon, EyeSlashIcon } from "../common/Icons";

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSwitchToSignUp: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSwitchToSignUp }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [loginErrorMessage, setLoginErrorMessage] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);
    const [isEmailFocused, setIsEmailFocused] = useState(false);
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);

    const handleClose = () => {
        setEmail("");
        setPassword("");
        setEmailError("");
        setPasswordError("");
        setLoginErrorMessage("");
        setShowPassword(false);
        onClose();
    };


    const validateLoginForm = () => {
        let isValid = true;
        setEmailError("");
        setPasswordError("");

        if (!email) {
            setEmailError("이메일을 입력해주세요.");
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setEmailError("유효한 이메일 형식이 아닙니다.");
            isValid = false;
        }

        if (!password) {
            setPasswordError("비밀번호를 입력해주세요.");
            isValid = false;
        }

        return isValid;
    };


    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const isValid = validateLoginForm();

        if (isValid) {
            try {
                const data = await login({ email, password });

                if (data.success) {
                    console.log("로그인 성공:", data);
                    handleClose();
                } else {
                    console.log("로그인 실패:", data);
                    setLoginErrorMessage("로그인 정보를 다시 확인해주세요.");
                }
            } catch (error) {
                console.error("로그인 실패:", error);
            }
        }
    };


    const handleSignUpClick = (e: React.MouseEvent) => {
        e.preventDefault();
        onSwitchToSignUp();
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
            className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center transition-all duration-300 ${isOpen ? "opacity-100 animate-fadeIn" : "opacity-0 animate-fadeOut"}`}
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
                        로그인
                    </p>

                    <div className="flex flex-col items-center gap-12 w-full mb-10">
                        {/* 이메일 입력 */}
                        <div className="w-full">
                            <div className="relative group">
                                <label
                                    className={`absolute font-['Pretendard'] font-medium text-xs text-[#A3A3A3] transition-all duration-300
                                        ${isEmailFocused || email ? "top-[-10px] opacity-100" : "top-[50%] translate-y-[-50%] opacity-0"}`}
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
                                />
                                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-[#848484]/50 group-hover:bg-[#848484] transition-all duration-300"></div>
                                <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-[#263F7C] via-[#3B66AF] to-[#035179] transition-all duration-300 group-focus-within:w-full"></div>
                                {emailError && <p className="font-['Pretendard'] text-red-500 text-xs mt-1 absolute -bottom-5 left-1">{emailError}</p>}
                            </div>
                        </div>

                        {/* 비밀번호 입력 */}
                        <div className="w-full">
                            <div className="relative group">
                                <label
                                    className={`absolute font-['Pretendard'] font-medium text-xs text-[#A3A3A3] transition-all duration-300
                                        ${isPasswordFocused || password ? "top-[-10px] opacity-100" : "top-[50%] translate-y-[-50%] opacity-0"}`}
                                >
                                    비밀번호
                                </label>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        if (passwordError) {
                                            return setPasswordError("");
                                        }
                                    }}
                                    onFocus={() => setIsPasswordFocused(true)}
                                    onBlur={() => setIsPasswordFocused(false)}
                                    placeholder={isPasswordFocused ? "" : "비밀번호를 입력해주세요."}
                                    className="w-full bg-transparent font-['Pretendard'] font-medium text-base md:text-lg text-[#A3A3A3] focus:text-white focus:outline-none py-2 pr-10 pl-1 [&:not(:placeholder-shown)]:text-white"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#A3A3A3] hover:text-white transition-colors duration-300 focus:outline-none p-1"
                                >
                                    {showPassword ? (<EyeSlashIcon />) : (<EyeIcon />)}
                                </button>
                                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-[#848484]/50 group-hover:bg-[#848484] transition-all duration-300"></div>
                                <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-[#263F7C] via-[#3B66AF] to-[#035179] transition-all duration-300 group-focus-within:w-full"></div>
                                {passwordError && <p className="font-['Pretendard'] text-red-500 text-xs mt-1 absolute -bottom-5 left-1">{passwordError}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 w-full mt-4">
                        {/* 로그인 버튼 */}
                        <form onSubmit={handleLoginSubmit}>
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
                                    로그인
                                </div>
                            </button>
                        </form>

                        {/* 회원가입 버튼 */}
                        <div className="flex justify-between">
                            <p className={`font-['Pretendard'] text-red-500 text-xs mt-1 hidden: ${loginErrorMessage ? false : true}`}>{loginErrorMessage}</p>
                            <span className="font-['Pretendard'] font-medium text-sm md:text-base text-[#A3A3A3]">
                                아직 회원이 아니신가요?{"  "}
                                <a 
                                    onClick={handleSignUpClick}
                                    className="text-[#FFFFFF] font-bold text-sm md:text-base cursor-pointer"
                                >
                                    회원가입
                                </a>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};