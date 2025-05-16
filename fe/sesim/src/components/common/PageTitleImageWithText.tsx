import { useSelector } from "react-redux";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RootState } from "../../store";
import { BlueCircle } from "./BlueCircle";
import { LoginModal } from "../Popup/LoginModal";
import { AnimatedButton } from "./AnimatedButton";
import { SignUpModal } from "../Popup/SignUpModal";
import downscrollImage from "../../assets/images/down-scroll-icon.svg";

interface PageTitleImageWithTextProps {
    subtitle?: string;
    title: string;
    description1?: string;
    description2?: string;
    buttonText?: string;
    backgroundImage: string;
}

export const PageTitleImageWithText: React.FC<PageTitleImageWithTextProps> = ({ subtitle, title, description1, description2, buttonText, backgroundImage }) => {
    const sdkDownloadLink = "https://sesimai.s3.ap-northeast-2.amazonaws.com/sesim_ai_sdk-0.1.0-py3-none-any.whl"
    const [isAtTop, setIsAtTop] = useState(true);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
    const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);

    useEffect(() => {
        const handleScroll = () => {
            setIsAtTop(window.scrollY === 0);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleSignUpClick = () => {
        setIsLoginModalOpen(false);
        setIsSignUpModalOpen(true);
    };

    const handleLoginClick = () => {
        setIsLoginModalOpen(true);
        setIsSignUpModalOpen(false);
    };

    const handleButtonClick = () => {
        if (!isLoggedIn) {
            setIsLoginModalOpen(true);
        }
    };
    
    return (
        <div className="relative">
            <div className="grid w-full h-screen container-padding">
                <img 
                    src={backgroundImage}
                    alt="PageBackground"
                    className="w-full h-full object-cover absolute inset-0"
                />
                <motion.div
                    className="flex flex-col justify-center relative z-10 gap-[20px] "
                    initial={{ opacity: 0, y: 70 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                >
                    <motion.div 
                        className="flex flex-col gap-[5px]"
                        initial={{ opacity: 0, y: 70 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                    >
                        {subtitle && (
                            <motion.div 
                                className="flex items-center gap-[10px]"
                                initial={{ opacity: 0, y: 70 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 1, ease: "easeOut" }}
                            >
                                <BlueCircle />
                                <p className="text-white text-[16px] md:text-[20px] lg:text-lg font-normal">{subtitle}</p>
                            </motion.div>
                        )}
                        <motion.h1 
                            className="text-white text-[28px] md:text-[42px] lg:text-6xl font-bold"
                            initial={{ opacity: 0, y: 70 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: subtitle ? 0.5 : 0, ease: "easeOut" }}
                        >
                            {title}
                        </motion.h1>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 70 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: subtitle ? 0.9 : 0.4, ease: "easeOut" }}
                    >
                        {description1 && <p className="text-white text-[16px] md:text-[20px] lg:text-2xl font-normal">{description1}</p>}
                        {description2 && <p className="text-white text-[16px] md:text-[20px] lg:text-2xl font-normal">{description2}</p>}
                    </motion.div>
                    { buttonText === "서비스 이용하기" && (
                        <motion.div
                            initial={{ opacity: 0, y: 70 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: subtitle ? 1.2 : 0.7, ease: "easeOut" }}
                        >
                            <AnimatedButton
                                text="서비스 이용하기"
                                link={isLoggedIn ? "/model-inference-service/create-project" : undefined}
                                width="230px"
                                onClick={handleButtonClick}
                            />
                        </motion.div>
                    )}
                    { buttonText === "SDK 다운로드" && (
                        <motion.div
                            initial={{ opacity: 0, y: 70 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: subtitle ? 1.2 : 0.7, ease: "easeOut" }}
                        >
                            <AnimatedButton
                                text="SDK 다운로드"
                                link={sdkDownloadLink}
                                width="220px"
                            />
                        </motion.div>
                    )}
                </motion.div>
            </div>
            <AnimatePresence>
                {isAtTop && (
                    <motion.img 
                        src={downscrollImage} 
                        alt="downscroll" 
                        className="w-[40px] h-[40px] absolute bottom-[5%] left-[50%] translate-x-[-50%]" 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                    />
                )}
            </AnimatePresence>

            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
                onSwitchToSignUp={handleSignUpClick}
            />

            <SignUpModal
                isOpen={isSignUpModalOpen}
                onClose={() => setIsSignUpModalOpen(false)}
                onSwitchToLogin={handleLoginClick}
            />
        </div>
    );
};

