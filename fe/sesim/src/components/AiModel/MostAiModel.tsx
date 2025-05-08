import { motion } from "framer-motion";
import { CardCarousel } from "./CardCarousel";
import { BlueCircle } from "../common/BlueCircle";

export const MostAiModel = () => {
    return (
        <div className="text-white">
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
    );
};