import { motion } from "framer-motion";
import React, { useState, useEffect } from "react";
import { AboutPage } from "./AboutPage";
import downscrollImage from "../assets/images/down-scroll-icon.svg";
import { AnimatedButton } from "../components/common/AnimatedButton";
import mainBackgroundImage from "../assets/images/cyber-security-bg.webp";
import { ScrollToTopButton } from "../components/common/ScrollToTopButton";
import { SnapScrollContainer } from "../components/common/SnapScrollContainer";

const MainText = () => {
    return (
        <motion.p 
            className="text-2xl md:text-4xl lg:text-5xl font-bold"
            initial={{ opacity: 0, y: 70 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
        >
            민감한 데이터를 지키는
            <br />
            가장 신뢰할 수 있는 AI 보안 솔루션
        </motion.p>
    )
};


const SubText = () => {
    return (
        <motion.p 
            className="text-md md:text-xl font-medium"
            initial={{ opacity: 0, y: 70 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
        >
            AI가 고객 인프라 내부에서 직접 작동하여
            <br />
            외부 유출 없이 보안 위협을 실시간으로 감지합니다.  
        </motion.p>
    )
};


const AnimatedDetailButton = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 70 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1, ease: "easeOut" }}
        >
            <AnimatedButton 
                text="서비스 이용하러 가기" 
                link="/model-inference-service"
                width="280px"
            />
        </motion.div>
    )
};


export const HomePage: React.FC = () => {
    const [isAtTop, setIsAtTop] = useState(true);
    const [isShowScrollToTop, setIsShowScrollToTop] = useState(false);
    useEffect(() => {
        const handleScroll = () => {
            setIsAtTop(window.scrollY === 0);
            setIsShowScrollToTop(window.scrollY > 200);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            <SnapScrollContainer>
                <div
                    className="bg-cover bg-center bg-no-repeat h-screen gap-8 md:gap-12 lg:gap-[72px] text-white snap-start relative"
                    style={{ backgroundImage: `url(${mainBackgroundImage})`}}
                >
                    <div className="container-padding flex flex-col justify-center h-full gap-[40px]">
                        <div className="flex flex-col gap-4 md:gap-6 lg:gap-[24px] text-white ">
                            <MainText />
                            <SubText />
                        </div>
                        <div>
                            <AnimatedDetailButton />
                        </div>
                        {isAtTop && (
                            <motion.img
                                src={downscrollImage}
                                alt="downscroll"
                                className="w-[40px] h-[40px] absolute bottom-[5%] left-1/2 -translate-x-1/2"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                            />
                        )}
                    </div>
                </div>
            </SnapScrollContainer>

            <AboutPage />
            <ScrollToTopButton show={isShowScrollToTop} />
        </>
    );
};
