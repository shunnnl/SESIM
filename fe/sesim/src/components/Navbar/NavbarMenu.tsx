import { Link } from "react-router-dom";

export const NavbarMenu: React.FC = () => {
    return (
        <div className="nav-menu flex lg:gap-[60px] md:gap-[20px] text-[18px] text-white px-8 items-center justify-center text-center">
            <Link to="/">홈</Link>
            <Link to="/about">소개</Link>
            <Link to="/ai-model">AI모델</Link>
            <Link to="/model-inference-service">모델추론 서비스</Link>
            <Link to="/docs">Docs</Link>
        </div>
    );
};