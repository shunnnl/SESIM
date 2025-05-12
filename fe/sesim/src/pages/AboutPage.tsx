import { motion } from "framer-motion";
import { AboutSesim } from "../components/About/AboutSesim";
import backgroundImage from "../assets/images/about-bg.webp";
import { SesimFunctions } from "../components/About/SesimFunctions";
import { PageTitleImageWithText } from "../components/common/PageTitleImageWithText";

export const AboutPage: React.FC = () => {
    return (
        <div className="relative">
            <PageTitleImageWithText
                title="SESIM"
                description1="SESIM은 고객 데이터를 외부로 보내지 않고,"
                description2="프라이빗 환경에서 AI 보안 모델을 맞춤형으로 제공합니다."
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
        </div>
    );
};

