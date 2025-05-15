import React from "react";
import { motion } from "framer-motion";
import backgroundImage from "../../assets/images/ai-model-detail-bg.webp";

interface ImageTitleBannerWithNavProps {
    modelName: string;
    description: string;
    selectedTab: "description" | "examplecode";
    setSelectedTab: (tab: "description" | "examplecode") => void;
}

export const ImageTitleBannerWithNav: React.FC<ImageTitleBannerWithNavProps> = ({ modelName, description, selectedTab, setSelectedTab }) => {
    return (
        <div className="relative">
            <div className="grid w-full h-screen container-padding">
                <img
                    src={backgroundImage}
                    alt="PageBackground"
                    className="w-full h-full object-cover absolute inset-0"
                />
                <div className="relative flex flex-col justify-center items-center col-start-1 row-start-1 min-h-[300px] pb-[70px]">
                    <div className="flex flex-col justify-center items-center text-center flex-1 gap-[10px]" style={{ paddingTop: "5%" }}>
                        <motion.h1
                            className="text-white text-[28px] md:text-[42px] lg:text-6xl font-bold"
                            initial={{ opacity: 0, y: 60 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1.2, ease: "easeOut" }}
                        >
                            {modelName}
                        </motion.h1>
                        <motion.p
                            className="w-[63%] text-white text-[16px] md:text-[20px] lg:text-2xl font-normal"
                            initial={{ opacity: 0, y: 60 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
                        >
                            {description}
                        </motion.p>
                    </div>
                    <motion.div
                        className="absolute z-30 flex items-center justify-center gap-[32px] md:gap-[60px] lg:gap-[100px] bg-[#000000]/40 w-full h-[48px] md:h-[60px] lg:h-[70px] absolute bottom-0 left-0 z-10"
                        initial={{ opacity: 0, y: 60 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0, ease: "easeOut" }}
                    >
                        <button
                            className={`text-white text-[18px] md:text-[22px] lg:text-[24px] font-bold hover:text-gray-300 transition-colors ${selectedTab === "description" ? "underline" : ""}`}
                            onClick={() => setSelectedTab("description")}
                        >
                            상세 설명
                        </button>
                        <div className="bg-[#ffffff]/50 w-[8px] md:w-[10px] h-[8px] md:h-[10px] rounded-full"></div>
                        <button
                            className={`text-white text-[18px] md:text-[22px] lg:text-[24px] font-bold hover:text-gray-300 transition-colors ${selectedTab === "examplecode" ? "underline" : ""}`}
                            onClick={() => setSelectedTab("examplecode")}
                        >
                            예시 코드
                        </button>
                    </motion.div>
                </div>
            </div>
        </div>
        
    );
};
