import React from "react";
import sesimImage from "../../assets/images/sesim-logo.png";
import backgroundImage from "../../assets/images/ai-model-detail-bg.png";

interface ImageTitleBannerWithNavProps {
    modelName: string;
    description: string;
    selectedTab: "description" | "examplecode";
    setSelectedTab: (tab: "description" | "examplecode") => void;
}

export const ImageTitleBannerWithNav: React.FC<ImageTitleBannerWithNavProps> = ({ modelName, description, selectedTab, setSelectedTab }) => {
    return (
        <div className="grid">
            <img 
                src={backgroundImage}
                alt="PageBackground"
                className="w-full h-full object-cover col-start-1 row-start-1"
            />
            <div className="relative bg-[#0A0C35]/30 flex flex-col justify-center items-center col-start-1 row-start-1 min-h-[300px] pb-[70px]">
                <div className="flex flex-col justify-center items-center text-center flex-1">
                    <div className="flex items-center">
                        <img 
                            src={sesimImage}
                            alt="sesim"
                            className="w-[100px] h-[100px]" 
                        />
                        <h1 className="text-white text-[32px] md:text-[42px] lg:text-[54px] font-bold">{modelName}</h1>
                    </div>
                    <p className="text-white text-[16px] md:text-[20px] lg:text-[24px] font-normal">
                        { description }
                    </p>
                </div>
                <div className="flex items-center justify-center gap-[100px] bg-[#000000]/40 w-full h-[70px] absolute bottom-0 left-0 z-10">
                    <button
                        className={`text-white text-[24px] font-bold hover:text-gray-300 transition-colors ${selectedTab === "description" ? "underline" : ""}`}
                        onClick={() => setSelectedTab("description")}
                    >
                        상세 설명
                    </button>
                    <div className="bg-[#ffffff]/50 w-[10px] h-[10px] rounded-full"></div>
                    <button
                        className={`text-white text-[24px] font-bold hover:text-gray-300 transition-colors ${selectedTab === "examplecode" ? "underline" : ""}`}
                        onClick={() => setSelectedTab("examplecode")}
                    >
                        예시 코드
                    </button>
                </div>
            </div>
        </div>
    );
};
