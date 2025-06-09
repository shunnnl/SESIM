import { useDispatch } from "react-redux";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { login } from "../../services/authService";
import { EyeIcon, EyeSlashIcon } from "../common/Icons";
import { login as loginAction } from "../../store/authSlice";

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
    const [isEmailShaking, setIsEmailShaking] = useState(false);
    const [isPasswordShaking, setIsPasswordShaking] = useState(false);
    const [isEmailFocused, setIsEmailFocused] = useState(false);
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);
    const [showErrorBox, setShowErrorBox] = useState(false);

    const dispatch = useDispatch();

    const handleClose = () => {
        setEmail("");
        setPassword("");
        setEmailError("");
        setPasswordError("");
        setLoginErrorMessage("");
        setShowPassword(false);
        setShowErrorBox(false);
        onClose();
    };


    const validateLoginForm = () => {
        let isValid = true;

        setEmailError("");
        setPasswordError("");
        setIsEmailShaking(false);
        setIsPasswordShaking(false);

        if (!email) {
            setEmailError("이메일을 입력해주세요.");
            setIsEmailShaking(true);
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setEmailError("유효한 이메일 형식이 아닙니다.");
            setIsEmailShaking(true);
            isValid = false;
        }

        if (!password) {
            setPasswordError("비밀번호를 입력해주세요.");
            setIsPasswordShaking(true);
            isValid = false;
        }

        setTimeout(() => {
            setIsEmailShaking(false);
            setIsPasswordShaking(false);
        }, 500);

        return isValid;
    };

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const isValid = validateLoginForm();

        if (isValid) {
            try {
                const response = await login({ email, password });

                if (response.success) {
                    const { email, nickname } = response.data;
                    const { accessToken } = response.data.token;

                    console.log("로그인 성공:", response.data);
                    dispatch(loginAction({ email, nickname, accessToken }));

                    handleClose();
                } else {
                    console.log("로그인 실패:", response.data);
                    setLoginErrorMessage("로그인 정보를 다시 확인해주세요.");
                    setShowErrorBox(true);

                    setTimeout(() => {
                        setShowErrorBox(false);
                    }, 3000);
                }
            } catch (error) {
                console.error("로그인 실패:", error);

                setLoginErrorMessage("네트워크 통신 오류가 발생했습니다.");
                setShowErrorBox(true);

                setTimeout(() => {
                    setShowErrorBox(false);
                }, 3000);
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

            document.body.style.overflow = "hidden";
        } else {
            const timer = setTimeout(() => {
                setShouldRender(false);
            }, 300);

            document.body.style.overflow = "unset";

            return () => clearTimeout(timer);
        }
    }, [isOpen]);


    useEffect(() => {
        const handleEscKey = (event: KeyboardEvent) => {
            if (event.key === "Escape" && isOpen) {
                handleClose();
            }
        };

        window.addEventListener("keydown", handleEscKey);
        return () => {
            window.removeEventListener("keydown", handleEscKey);
        };
    }, [isOpen]);

    if (!shouldRender && !isOpen) {
        return null;
    }

    return (
        <div className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center transition-all duration-300 overflow-y-auto scrollbar-custom ${isOpen ? "opacity-100 animate-fadeIn" : "opacity-0 animate-fadeOut"}`}>
            <div className="relative w-full max-w-[500px] mx-auto">
                <motion.div
                    className="w-full rounded-[30px] transform transition-all duration-300"
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 50, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
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
                        className="flex flex-col items-center w-full py-10 sm:py-12 md:py-16 px-6 sm:px-10 md:px-16 rounded-[28px] bg-[#020207]/80"
                    >
                        <p className="font-['Pretendard'] font-bold text-3xl md:text-4xl text-center text-white mb-10">
                            로그인
                        </p>

                        <div className="flex flex-col items-center gap-12 w-full pb-10 p-2">
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
                                    <div className={`absolute bottom-0 left-0 w-full h-[1px] ${isEmailShaking ? "bg-red-500 animate-shake" : "bg-[#848484]/50 group-hover:bg-[#848484]"} transition-all duration-300`}></div>
                                    <div className={`absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-[#263F7C] via-[#3B66AF] to-[#035179] group-focus-within:w-full transition-all duration-300`}></div>
                                    {emailError && <p className="font-['Pretendard'] text-red-500 text-xs mt-1 absolute -bottom-5 left-1">{emailError}</p>}
                                </div>
                            </div>

                            {/* 비밀번호 입력 */}
                            <div className="w-full">
                                <div className="relative group">
                                    <label
                                        className={`absolute font-['Pretendard'] font-medium text-xs text-[#A3A3A3] transition-all duration-300 ${isPasswordFocused || password ? "top-[-10px] opacity-100" : "top-[50%] translate-y-[-50%] opacity-0"}`}
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
                                    <div className={`absolute bottom-0 left-0 w-full h-[1px] ${isPasswordShaking ? "bg-red-500 animate-shake" : "bg-[#848484]/50 group-hover:bg-[#848484]"} transition-all duration-300`}></div>
                                    <div className={`absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-[#263F7C] via-[#3B66AF] to-[#035179] group-focus-within:w-full transition-all duration-300`}></div>
                                    {passwordError && <p className="font-['Pretendard'] text-red-500 text-xs mt-1 absolute -bottom-5 left-1">{passwordError}</p>}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 w-full">
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

                            {/* 에러 메시지 박스 */}
                            <AnimatePresence>
                                {showErrorBox && (
                                    <motion.div
                                        className="relative w-full mb-2"
                                        initial={{ opacity: 0, y: -20, scaleY: 0, height: 0 }}
                                        animate={{
                                            opacity: 1,
                                            y: 0,
                                            scaleY: 1,
                                            height: "auto",
                                            transition: {
                                                type: "spring",
                                                stiffness: 300,
                                                damping: 20
                                            }
                                        }}
                                        exit={{
                                            opacity: 0,
                                            y: -10,
                                            scaleY: 0,
                                            height: 0,
                                            transition: {
                                                duration: 0.3,
                                                ease: "easeInOut"
                                            }
                                        }}
                                    >
                                        <motion.div
                                            className="absolute inset-0 rounded-[12px] p-[1px]"
                                            style={{
                                                background: "linear-gradient(to right, #FF4040, #FF7373)",
                                                WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                                                WebkitMaskComposite: "xor",
                                                maskComposite: "exclude",
                                                pointerEvents: "none",
                                            }}
                                            animate={{
                                                opacity: [0.5, 1, 0.5],
                                            }}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                                ease: "easeInOut"
                                            }}
                                        ></motion.div>
                                        <div className="w-full py-2 px-4 rounded-[12px] bg-[#3A1A1A]/60 backdrop-blur-md">
                                            <motion.p
                                                className="font-['Pretendard'] text-red-400 text-sm text-center"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.2 }}
                                            >
                                                {loginErrorMessage}
                                            </motion.p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* 회원가입 버튼 */}
                            <div className="flex justify-end">
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
                    </motion.div>
                </motion.div>

                {/* 닫기 버튼 */}
                <button
                    onClick={handleClose}
                    className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-12 h-12 flex items-center justify-center rounded-full border-2 border-[#A3A3A3]/30 text-[#A3A3A3] hover:border-white hover:text-white transition-all duration-300 bg-[#020207]/80 backdrop-blur-sm"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>
            </div>
        </div>
    );
};