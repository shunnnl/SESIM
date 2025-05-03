import React from "react";

interface PageTitleImageWithTextProps {
    title: string;
    description1: string;
    description2: string;
    backgroundImage: string;
}

export const PageTitleImageWithText: React.FC<PageTitleImageWithTextProps> = ({
    title,
    description1,
    description2,
    backgroundImage
}) => {
    return (
        <div className="relative">
            <div className="absolute z-10 w-full h-full flex items-center justify-center">
                <div className="flex flex-col justify-center items-center">
                    <h1 className="text-white text-[54px] font-bold">{title}</h1>
                    <p className="text-white text-[24px] font-normal">{description1}</p>
                    <p className="text-white text-[24px] font-normal">{description2}</p>
                </div>
            </div>
            <div className="absolute inset-0 bg-[#0A0C35]/30"></div>
            <img 
                src={backgroundImage}
                alt="PageBackground"
                className="w-full h-full object-cover"
            />
        </div>
    );
};
