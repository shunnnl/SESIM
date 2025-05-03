import { Link } from "react-router-dom";
import sesimLogo from "../../assets/images/sesim-logo.png";

export const SesimLogo: React.FC = () => {
    return (
        <div className="sesim-logo">
            <Link to="/" className="flex items-center">
                <img src={sesimLogo} alt="SESIM Logo" className="w-[60px] h-[60px]" />
                <div className="flex flex-col -space-y-[10px] text-white">
                    <p className="text-[32px] font-bold">SESIM</p>
                    <p className="text-[10px] font-medium">세심하게 설계된, 세심한 보안</p>
                </div>
            </Link>
        </div>
    );
};
