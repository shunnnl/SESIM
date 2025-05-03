import { memo } from "react";
import { Link } from "react-router-dom";
import arrowBlue from "../../assets/images/arrow-blue.png";
import arrowWhite from "../../assets/images/arrow-white.png";

const DetailButtonComponent: React.FC = () => {
    return (
        <Link to="/ai-model">
            <button 
                className="group relative flex items-center justify-center gap-[10px] border-2 border-white/24 rounded-[35px] w-[190px] h-[70px] px-[24px] py-[12px] transition-all duration-300 overflow-hidden hover:border-[#6296EF]"
                style={{ willChange: "transform, border-color" }}
            >
                <div 
                    className="absolute inset-0 bg-white rounded-[35px] transform -translate-x-full transition-transform duration-300 ease-in-out group-hover:translate-x-0"
                    style={{ willChange: "transform" }}
                />
                
                <div 
                    className="absolute inset-0 bg-[#6296EF] rounded-[35px] transform -translate-x-full transition-transform duration-300 ease-in-out delay-[150ms] group-hover:translate-x-0"
                    style={{ willChange: "transform" }}
                />
                
                <p className="relative z-10 text-white text-xl font-medium select-none">
                    자세히보기
                </p>

                <div 
                    className="relative z-10 bg-[#6296EF] rounded-full w-[30px] h-[30px] flex items-center justify-center transition-colors duration-300 group-hover:bg-white"
                    style={{ willChange: "background-color" }}
                >
                    <img 
                        src={arrowWhite} 
                        alt="arrow-right" 
                        className="absolute w-[24px] h-[24px] transition-all duration-300 ease-in-out transform group-hover:translate-x-6 group-hover:-translate-y-6 group-hover:opacity-0"
                        style={{ willChange: "transform, opacity" }}
                        loading="eager"
                    />
                    <img 
                        src={arrowBlue} 
                        alt="arrow-right-blue" 
                        className="absolute w-[24px] h-[24px] transition-all duration-300 ease-in-out transform -translate-x-6 translate-y-6 opacity-0 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100"
                        style={{ willChange: "transform, opacity" }}
                        loading="eager"
                    />
                </div>
            </button>
        </Link>
    );
};

export const DetailButton = memo(DetailButtonComponent);
