import { Link } from "react-router-dom";
import sesimLogo from "../../assets/images/sesim-main-logo.webp";

export const SesimLogo: React.FC = () => {
    return (
        <div className="sesim-logo">
            <Link to="/">
                <img 
                    src={sesimLogo} 
                    alt="SESIM Logo" 
                    className="w-[80px] md:w-[100px] lg:w-[120px]"
                />
            </Link>
        </div>
    );
};
