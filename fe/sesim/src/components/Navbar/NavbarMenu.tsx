import { Link } from "react-router-dom";
import { ModelDropdown } from "../common/ModelDropdown";

const menuClass = "relative group px-2 flex flex-col items-center justify-center";
const linkClass = "text-white transition-colors duration-200 group-hover:font-bold font-medium transform transition-transform group-hover:scale-110";
const indicatorClass = "absolute -top-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#3893FF] opacity-0 group-hover:opacity-100 transition-opacity duration-200";

export const NavbarMenu: React.FC = () => {
    return (
        <div className="z-20 nav-menu flex flex-row flex-nowrap items-center justify-center text-center gap-3 md:gap-1 lg:gap-8 xl:gap-[60px] text-[15px] md:text-[17px] lg:text-[18px] text-white pl-6">
            <div className={`${menuClass} whitespace-nowrap`}>
                <Link
                    to="/about"
                    className={linkClass}
                >
                    소개
                </Link>
                <div className={indicatorClass}></div>
            </div>
            <div className={`${menuClass} whitespace-nowrap`}>
                <ModelDropdown />
                <div className={indicatorClass}></div>
            </div>
            <div className={`${menuClass} whitespace-nowrap`}>
                <Link
                    to="/model-inference-service"
                    className={linkClass}
                >
                    모델추론 서비스
                </Link>
                <div className={indicatorClass}></div>
            </div>
            <div className={`${menuClass} whitespace-nowrap`}>
                <Link
                    to="/sdk-download"
                    className={linkClass}
                >
                    SDK 다운로드
                </Link>
                <div className={indicatorClass}></div>
            </div>
        </div>
    );
};