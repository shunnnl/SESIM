import { Link } from "react-router-dom";
import sesimLogo from "../../assets/images/sesim-logo.png";

export const SesimLogoFooter: React.FC = () => {
    return (
        <div className="sesim-logo">
            <Link to="/" className="flex items-center">
                <img src={sesimLogo} alt="SESIM Logo" className="w-[64px] h-[64px]" />
                <div className="flex flex-col items-end -space-y-[10px] text-white">
                    <p className="text-[32px] font-bold">SESIM</p>
                    <p className="text-[10px] font-medium">YOUR PARTNER</p>
                </div>
            </Link>
        </div>
    );
};
