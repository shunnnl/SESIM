import { motion } from "framer-motion";
import backgroundImage from "../assets/images/about-bg.webp";
import { SesimFunctions } from "../components/About/SesimFunctions";
import { PageTitleImageWithText } from "../components/common/PageTitleImageWithText";
import { SesimFunctionsDescription } from "../components/About/SesimFunctionsDescription";

export const AboutPage: React.FC = () => {
    return (
        <div className="relative">
            <PageTitleImageWithText
                subtitle="About SESIM"
                title="SESIM은 어떤 서비스인가요?"
                description1="SESIM은 기업 고객이 보유한 로그 데이터를 기반으로"
                description2="자체적인 보안 AI 모델을 학습·운영할 수 있도록 지원하는 SaaS 플랫폼입니다."
                backgroundImage={backgroundImage}
            />
            <div className="container-padding">
                <motion.div
                    className="text-white my-[88px] relative z-10"
                    initial={{ opacity: 0, y: 70 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                    viewport={{ once: true, amount: 0.2 }}
                >
                    <SesimFunctions />
                </motion.div>

                <motion.div
                    className="text-white my-[88px] relative z-10"
                    initial={{ opacity: 0, y: 70 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                    viewport={{ once: true, amount: 0.2 }}
                >
                    <SesimFunctionsDescription />
                </motion.div>
            </div>

            <div
                className="absolute top-[52%] left-1/2 -translate-y-1/2 -translate-x-1/2 w-[200px] h-[200px] rounded-full"
                style={{
                    background: "#15305F",
                    boxShadow: "0 0 160px 120px #15305F, 0 0 320px 240px #15305F",
                    opacity: 0.3,
                    zIndex: 0
                }}
            ></div>

            <div
                className="absolute top-[85%] left-1/2 -translate-y-1/2 -translate-x-1/2 w-[300px] h-[300px] rounded-full"
                style={{
                    background: "#15305F",
                    boxShadow: "0 0 160px 120px #15305F, 0 0 320px 240px #15305F",
                    opacity: 0.3,
                    zIndex: 0
                }}
            ></div>
        </div>
    );
};

