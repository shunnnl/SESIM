import React from "react";
import aboutImage from "../../assets/images/about-bg.png";
import sesimLogo from "../../assets/images/sesim-logo.png";

export const ImageTitleBanner: React.FC = () => {
    return (
        <div className="grid">
            <img 
                src={aboutImage}
                alt="PageBackground"
                className="w-full h-full object-cover col-start-1 row-start-1"
            />
            <div className="bg-[#0A0C35]/30 flex items-center justify-center col-start-1 row-start-1">
                <div className="flex flex-col justify-center items-center gap-[15px] text-center">
                    <div className="flex items-center">
                        <img src={sesimLogo} alt="SESIM Logo" className="w-[80px] h-[80px]" />
                        <div className="flex flex-col -space-y-[23px] text-white">
                            <p className="text-[60px] font-bold">SESIM</p>
                            <p className="text-[15px] font-medium">세심하게 설계된, 세심한 보안</p>
                        </div>
                    </div>
                    <div>
                        <p className="text-white text-[16px] md:text-[20px] lg:text-[24px] font-normal">SESIM은 고객 데이터를 외부로 보내지 않고,</p>
                        <p className="text-white text-[16px] md:text-[20px] lg:text-[24px] font-normal">프라이빗 환경에서 AI 보안 모델을 맞춤형으로 제공합니다.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
