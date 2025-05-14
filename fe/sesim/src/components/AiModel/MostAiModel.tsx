import { motion } from "framer-motion";
import { CardCarousel } from "./CardCarousel";
import { BlueCircle } from "../common/BlueCircle";
import backgroundImage from "../../assets/images/carousel-bg.webp";

export const MostAiModel = () => {
    return (
        <div 
            className="bg-cover bg-center bg-no-repeat h-screen flex items-center justify-center" 
            style={{ backgroundImage: `url(${backgroundImage})` }}
        >
            <motion.div 
                className="container-padding flex flex-col items-center gap-[15px] pb-[100px] text-white"
                initial={{ opacity: 0, y: 70 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
            >
                <BlueCircle />
                <h1 className="text-[24px] md:text-[32px] lg:text-[37px] font-bold">가장 인기있는 모델</h1>
                <CardCarousel />
            </motion.div>
        </div>
    );
};