import { Link } from "react-router-dom";
import sesimLogo from "../../assets/images/sesim-logo.png";

export const SesimLogo: React.FC = () => {
    return (
        <div className="sesim-logo">
            <Link to="/" className="flex flex-row flex-nowrap whitespace-nowrap items-center">
                <img src={sesimLogo} alt="SESIM Logo" className="w-[40px] h-[40px] md:w-[50px] md:h-[50px] lg:w-[60px] lg:h-[60px]" />
                <div className="flex flex-col -space-y-[6px] md:-space-y-[8px] lg:-space-y-[10px] text-white ml-1 md:ml-1">
                    <p className="text-[20px] md:text-[26px] lg:text-[32px] font-bold">SESIM</p>
                    <p className="text-[8px] md:text-[9px] lg:text-[10px] font-medium">세심하게 설계된, 세심한 보안</p>
                </div>
            </Link>
        </div>
    );
};
