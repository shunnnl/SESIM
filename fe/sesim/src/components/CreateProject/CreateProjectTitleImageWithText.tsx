import React from "react";
import backgroundImage from "../../assets/images/create-project-bg.webp";

export const CreateProjectTitleImageWithText: React.FC = () => {
    return (
        <div className="relative z-10 grid w-full min-h-[200px] md:min-h-[300px] lg:min-h-[400px]">
            <img 
                src={backgroundImage}
                alt="PageBackground"
                className="w-full h-full object-cover col-start-1 row-start-1"
            />
            
            <div
                className="flex flex-col items-center justify-center text-center col-start-1 row-start-1"
                style={{ paddingTop: "5%" }}
            >
                <h1 className="text-white text-[28px] md:text-[32px] lg:text-5xl font-bold">프로젝트 생성</h1>
                <p className="text-white text-[16px] md:text-[20px] lg:text-2xl font-normal">보안 AI를 안전하게 배포하고 실행할 나만의 프로젝트를 구성하세요.</p>
            </div>
        </div>
    );
};
