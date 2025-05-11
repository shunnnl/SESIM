import { SesimLogoFooter } from "./SesimLogoFooter"
import { useLocation } from "react-router-dom";

export const Footer = () => {
    const location = useLocation();

    return (
        <div className={`${location.pathname === "/ai-model" ? "bg-black" : ""}`}>
            <div className="border-t-2 border-white/20 mt-auto px-4 md:px-[68px] py-2 md:py-[17px]">
                <div className="text-white/60 flex flex-col gap-2 md:gap-4">
                    <SesimLogoFooter />
                    
                    <div className="ml-2 md:ml-4 font-medium text-[12px] md:text-[14px]">
                        <p><span className="font-bold">(주)세심 | </span>대표자 : 손은주</p>
                    </div>
                    <div className="flex gap-2 ml-2 md:ml-4 font-medium text-[12px] md:text-[14px]">
                        <p className="font-bold">본사</p>
                        <p>
                            경북 구미시 3공단 3로 302
                            <br />
                            전화 번호 : 054-1234-5678 | 팩스번호 : 054-1234-5678
                        </p>
                    </div>
                </div>
            </div>
            <div className="border-t-2 border-white/20 mt-auto px-4 md:px-[68px] py-1 md:py-[5px]">
                <p className="flex justify-end gap-2 ml-2 md:ml-4 font-medium text-white/50 text-[8px] md:text-[10px]">
                    Copyright © URP. All Rights Reserved. designed by shimkwkr
                </p>
            </div>
        </div>
    )
};
