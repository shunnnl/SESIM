import { Link } from "react-router-dom";
import { ModelDropdown } from "../common/ModelDropdown";

export const NavbarMenu: React.FC = () => {
    return (
        <div className="nav-menu flex lg:gap-[60px] md:gap-[20px] text-[18px] text-white px-8 items-center justify-center text-center">
            <Link to="/about">소개</Link>
            <ModelDropdown />
            <Link to="/model-inference-service">모델추론 서비스</Link>
            <Link to="/sdk-download">SDK 다운로드</Link>
            <Link to="/keyinfo">apiKey</Link>
            {/*FIXME 이후에 삭제될 요소, 페이지 임시 이동*/}
        </div>
    );
};