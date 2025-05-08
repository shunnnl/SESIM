import { Link } from "react-router-dom";
import { ModelDropdown } from "../common/ModelDropdown";

const menuClass = "relative group px-2 flex flex-col items-center justify-center";
const linkClass = "text-white transition-colors duration-200 group-hover:font-bold font-medium transform transition-transform group-hover:scale-110";
const indicatorClass = "absolute -top-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#3893FF] opacity-0 group-hover:opacity-100 transition-opacity duration-200";

export const NavbarMenu: React.FC = () => {
    return (
        <div className="nav-menu flex lg:gap-[60px] md:gap-[20px] text-[18px] text-white px-8 items-center justify-center text-center">
            <div className={menuClass}>
                <Link to="/about" className={linkClass}>소개</Link>
                <div className={indicatorClass}></div>
            </div>
            <div className={menuClass}>
                <ModelDropdown />
                <div className={indicatorClass}></div>
            </div>
            <div className={menuClass}>
                <Link to="/model-inference-service" className={linkClass}>모델추론 서비스</Link>
                <div className={indicatorClass}></div>
            </div>
            <div className={menuClass}>
                <Link to="/sdk-download" className={linkClass}>SDK 다운로드</Link>
                <div className={indicatorClass}></div>
            </div>
            <div className={menuClass}>
                <Link to="/keyinfo" className={linkClass}>apiKey</Link>
                <div className={indicatorClass}></div>
            </div>
            {/*FIXME 이후에 삭제될 요소, 페이지 임시 이동*/}
        </div>
    );
};