import { Link } from "react-router-dom";
import sesimLogo from "../../assets/images/sesim-main-logo.webp";

export const SesimLogo: React.FC = () => {
    return (
        <div className="sesim-logo">
            <Link to="/">
                <img 
                    src={sesimLogo} 
                    alt="SESIM Logo" 
                    className="w-[120px] md:w-[140px] lg:w-[160px]"
                />
            </Link>
        </div>
    );
};
