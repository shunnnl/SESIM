import React from "react";
import { BlueCircle } from "./BlueCircle";
import { AnimatedButton } from "./AnimatedButton";

interface PageTitleImageWithTextProps {
    subtitle?: string;
    title: string;
    description1?: string;
    description2?: string;
    buttonText?: string;
    backgroundImage: string;
}

export const PageTitleImageWithText: React.FC<PageTitleImageWithTextProps> = ({ subtitle, title, description1, description2, buttonText, backgroundImage }) => {
    const sdkDownloadLink = "https://sesimai.s3.ap-northeast-2.amazonaws.com/sesim_ai_sdk-0.1.0-py3-none-any.whl"
    
    return (
        <div className="grid w-full h-screen relative">
            <img 
                src={backgroundImage}
                alt="PageBackground"
                className="w-full h-full object-cover absolute inset-0"
            />
            
            <div
                className="flex flex-col justify-center ml-[12%] relative z-10 gap-[20px]"
                style={{ paddingTop: "5%" }}
            >
                <div className="flex flex-col gap-[5px]">
                    {subtitle && (
                        <div className="flex items-center gap-[10px]">
                            <BlueCircle />
                            <p className="text-white text-[16px] md:text-[20px] lg:text-lg font-normal">{subtitle}</p>
                        </div>
                    )}
                    <h1 className="text-white text-[28px] md:text-[42px] lg:text-5xl font-bold">{title}</h1>
                </div>
                <div>
                    {description1 && <p className="text-white text-[16px] md:text-[20px] lg:text-xl font-normal">{description1}</p>}
                    {description2 && <p className="text-white text-[16px] md:text-[20px] lg:text-xl font-normal">{description2}</p>}
                </div>
                { buttonText === "프로젝트 생성하기" && (
                    <div>
                        <AnimatedButton
                            text="프로젝트 생성하기"
                            link="/model-inference-service/create-project"
                            width="250px"
                        />
                    </div>
                )}
                { buttonText === "SDK 다운로드" && (
                    <div>
                        <AnimatedButton
                            text="SDK 다운로드"
                            link={sdkDownloadLink}
                            width="220px"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};
