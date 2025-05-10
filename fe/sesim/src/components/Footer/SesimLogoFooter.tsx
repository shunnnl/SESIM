import { Link } from "react-router-dom";
import sesimLogo from "../../assets/images/sesim-footer-logo.webp";

export const SesimLogoFooter: React.FC = () => {
    return (
        <div className="sesim-logo w-fit">
            <Link to="/">
                <img 
                    src={sesimLogo} 
                    alt="SESIM Logo" 
                    className="w-[100px] md:w-[120px] lg:w-[140px]"
                />
            </Link>
        </div>
    );
};
