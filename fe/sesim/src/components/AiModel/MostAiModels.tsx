import { motion } from "framer-motion";
import backgroundImage from "../../assets/images/ai-model-bg.png";
import { CardCarousel } from "./CardCarousel";
import { BlueCircle } from "../common/BlueCircle";
import { PageTitleImageWithText } from "../common/PageTitleImageWithText";

export const MostAiModel = () => {
    return (
        <>
            <PageTitleImageWithText
                title="AI 모델"
                description1="SESIM은 고객 데이터를 외부로 보내지 않고,"
                description2="프라이빗 환경에서 AI 보안 모델을 맞춤형으로 제공합니다."
                backgroundImage={backgroundImage}
            />
            <div className="container-padding text-white">
                <motion.div 
                    className="flex flex-col items-center gap-[15px] py-[44px]"
                    initial={{ opacity: 0, y: 70 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                >
                    <BlueCircle />
                    <h1 className="text-[24px] md:text-[32px] lg:text-[37px] font-bold">가장 인기있는 모델</h1>
                    <CardCarousel />
                </motion.div>
            </div>
        </>
    );
};