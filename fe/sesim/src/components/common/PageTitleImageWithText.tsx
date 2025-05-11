import React from "react";

interface PageTitleImageWithTextProps {
    title: string;
    description1?: string;
    description2?: string;
    backgroundImage: string;
}

export const PageTitleImageWithText: React.FC<PageTitleImageWithTextProps> = ({ title, description1, description2, backgroundImage }) => {
    return (
        <div className="grid w-full min-h-[200px] md:min-h-[300px] lg:min-h-[400px]">
            <img 
                src={backgroundImage}
                alt="PageBackground"
                className="w-full h-full object-cover col-start-1 row-start-1"
            />
            
            <div
                className="flex flex-col items-center justify-center text-center col-start-1 row-start-1"
                style={{ paddingTop: "5%" }}
            >
                <h1 className="text-white text-[28px] md:text-[42px] lg:text-[54px] font-bold">{title}</h1>
                {description1 && <p className="text-white text-[16px] md:text-[20px] lg:text-[24px] font-normal">{description1}</p>}
                {description2 && <p className="text-white text-[16px] md:text-[20px] lg:text-[24px] font-normal">{description2}</p>}
            </div>
        </div>
    );
};
