import React from "react";
import backgroundImage from "../../assets/images/ai-model-detail-bg.webp";

interface ImageTitleBannerWithNavProps {
    modelName: string;
    description: string;
    selectedTab: "description" | "examplecode";
    setSelectedTab: (tab: "description" | "examplecode") => void;
}

export const ImageTitleBannerWithNav: React.FC<ImageTitleBannerWithNavProps> = ({ modelName, description, selectedTab, setSelectedTab }) => {
    return (
        <div className="grid grid w-full min-h-[200px] md:min-h-[300px] lg:min-h-[400px]">
            <img
                src={backgroundImage}
                alt="PageBackground"
                className="w-full h-full object-cover col-start-1 row-start-1"
            />
            <div className="relative bg-[#0A0C35]/30 flex flex-col justify-center items-center col-start-1 row-start-1 min-h-[300px] pb-[70px]">
                <div className="flex flex-col justify-center items-center text-center flex-1"
                    style={{ paddingTop: "5%" }}
                >
                    <h1 className="text-white text-[28px] md:text-[42px] lg:text-[54px] font-bold">{modelName}</h1>
                    <p className="text-white text-[16px] md:text-[20px] lg:text-[24px] font-normal">
                        { description }
                    </p>
                </div>
                <div className="flex items-center justify-center gap-[32px] md:gap-[60px] lg:gap-[100px] bg-[#000000]/40 w-full h-[48px] md:h-[60px] lg:h-[70px] absolute bottom-0 left-0 z-10">
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
                </div>
            </div>
        </div>
    );
};
