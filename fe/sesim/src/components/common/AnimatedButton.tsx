import { memo } from "react";
import { Link } from "react-router-dom";
import arrowBlue from "../../assets/images/arrow-blue.png";
import arrowWhite from "../../assets/images/arrow-white.png";

interface AnimatedButtonProps {
    text: string;
    link: string;
    width?: string;
}

const AnimatedButtonComponent: React.FC<AnimatedButtonProps> = ({ text, link, width }) => {
    return (
        <button 
            className={`group relative border-2 border-white/24 rounded-[35px] h-[70px] px-[24px] py-[12px] transition-all duration-300 overflow-hidden hover:border-[#6296EF] ${width ? `w-[${width}]` : 'w-[190px]'}`}
            style={{ willChange: "transform, border-color" }}
        >
            <Link to={link} className="absolute inset-0 flex items-center justify-center gap-[10px] px-[24px] py-[12px]">
                <div 
                    className="absolute inset-0 bg-white rounded-[35px] transform -translate-x-full transition-transform duration-300 ease-in-out group-hover:translate-x-0"
                    style={{ willChange: "transform" }}
                />
                
                <div 
                    className="absolute inset-0 bg-[#6296EF] rounded-[35px] transform -translate-x-full transition-transform duration-300 ease-in-out delay-[150ms] group-hover:translate-x-0"
                    style={{ willChange: "transform" }}
                />
                
                <p className="relative z-10 text-white text-xl font-medium select-none whitespace-nowrap">
                    {text}
                </p>

                <div 
                    className="relative z-10 bg-[#6296EF] rounded-full w-[30px] h-[30px] flex items-center justify-center transition-colors duration-300 group-hover:bg-white shrink-0"
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
            </Link>
        </button>
    );
};

export const AnimatedButton = memo(AnimatedButtonComponent);