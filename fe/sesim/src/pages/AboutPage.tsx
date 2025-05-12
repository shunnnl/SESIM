import { motion } from "framer-motion";
import { AboutSesim } from "../components/About/AboutSesim";
import backgroundImage from "../assets/images/about-bg.webp";
import { SesimFunctions } from "../components/About/SesimFunctions";
import { SnapScrollContainer } from "../components/common/SnapScrollContainer";
import { PageTitleImageWithText } from "../components/common/PageTitleImageWithText";

export const AboutPage: React.FC = () => {
    return (
        <SnapScrollContainer>
            <PageTitleImageWithText
                subtitle="About SESIM"
                title="SESIM은 어떤 서비스인가요?"
                description1="SESIM은 기업 고객이 보유한 로그 데이터를 기반으로"
                description2="자체적인 보안 AI 모델을 학습·운영할 수 있도록 지원하는 SaaS 플랫폼입니다."
                backgroundImage={backgroundImage}
            />

            <motion.div 
                className="container-padding text-white my-[88px] relative z-10"
                initial={{ opacity: 0, y: 70 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
            >
                <AboutSesim />
            </motion.div>

            <motion.div
                className="container-padding text-white my-[88px] relative z-10"
                initial={{ opacity: 0, y: 70 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                viewport={{ once: true, amount: 0.2 }}
            >
                <SesimFunctions />
            </motion.div>

            <div
                className="absolute top-1/2 left-0 -translate-y-1/2 w-[150px] h-[150px] rounded-full"
                style={{
                    background: "#063584", 
                    boxShadow: "0 0 160px 120px #063584, 0 0 320px 240px #063584",
                    opacity: 0.4,
                    zIndex: 0
                }}
            ></div>
            <div
                className="absolute top-[90%] right-0 -translate-y-1/2 w-[150px] h-[150px] rounded-full"
                style={{
                    background: "#063584", 
                    boxShadow: "0 0 160px 120px #063584, 0 0 320px 240px #063584",
                    opacity: 0.4,
                    zIndex: 0
                }}
            ></div>
        </SnapScrollContainer>
    );
};

