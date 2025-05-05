import React from "react";

interface PageTitleImageWithTextProps {
    title: string;
    description1?: string;
    description2?: string;
    backgroundImage: string;
}

export const PageTitleImageWithText: React.FC<PageTitleImageWithTextProps> = ({ title, description1, description2, backgroundImage }) => {
    return (
        <div className="grid">
            <img 
                src={backgroundImage}
                alt="PageBackground"
                className="w-full h-full object-cover col-start-1 row-start-1"
            />
            <div className="bg-[#0A0C35]/30 flex items-center justify-center col-start-1 row-start-1">
                <div className="flex flex-col justify-center items-center text-center">
                    <h1 className="text-white text-[32px] md:text-[42px] lg:text-[54px] font-bold">{title}</h1>
                    {description1 && <p className="text-white text-[16px] md:text-[20px] lg:text-[24px] font-normal">{description1}</p>}
                    {description2 && <p className="text-white text-[16px] md:text-[20px] lg:text-[24px] font-normal">{description2}</p>}
                </div>
            </div>
        </div>
    );
};
