import { memo } from "react";
import { Link } from "react-router-dom";
import arrowBlue from "../../assets/images/arrow-blue.png";
import arrowWhite from "../../assets/images/arrow-white.png";

interface SmallAnimatedButtonProps {
    text: string;
    link: string;
    onClick?: () => void;
}

const SmallAnimatedButtonComponent: React.FC<SmallAnimatedButtonProps> = ({ text, link, onClick }) => {
    return (
        <button 
            className={`group relative border-[1px] border-white rounded-full h-[40px] px-[10px] py-[4px] transition-all duration-300 overflow-hidden hover:border-[#6296EF] w-[130px]`}
            style={{ willChange: "transform, border-color" }}
            onClick={onClick}
        >
            <Link to={link} className="absolute inset-0 flex items-center justify-center gap-[4px] px-[10px] py-[4px]">
                <div 
                    className="absolute inset-0 bg-white rounded-[35px] transform -translate-x-full transition-transform duration-300 ease-in-out group-hover:translate-x-0"
                    style={{ willChange: "transform" }}
                />
                
                <div 
                    className="absolute inset-0 bg-[#6296EF] rounded-[35px] transform -translate-x-full transition-transform duration-300 ease-in-out delay-[150ms] group-hover:translate-x-0"
                    style={{ willChange: "transform" }}
                />
                
                <p className="relative z-10 text-white text-[16px] font-medium select-none whitespace-nowrap">
                    {text}
                </p>

                <div 
                    className="relative z-10 bg-[#6296EF] rounded-full w-[18px] h-[18px] flex items-center justify-center transition-colors duration-300 group-hover:bg-white shrink-0"
                    style={{ willChange: "background-color" }}
                >
                    <img 
                        src={arrowWhite} 
                        alt="arrow-right" 
                        className="absolute w-[15px] h-[15px] transition-all duration-300 ease-in-out transform group-hover:translate-x-2 group-hover:-translate-y-2 group-hover:opacity-0"
                        style={{ willChange: "transform, opacity" }}
                        loading="eager"
                    />
                    <img 
                        src={arrowBlue} 
                        alt="arrow-right-blue" 
                        className="absolute w-[15px] h-[15px] transition-all duration-300 ease-in-out transform -translate-x-2 translate-y-2 opacity-0 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100"
                        style={{ willChange: "transform, opacity" }}
                        loading="eager"
                    />
                </div>
            </Link>
        </button>
    );
};

export const SmallAnimatedButton = memo(SmallAnimatedButtonComponent);