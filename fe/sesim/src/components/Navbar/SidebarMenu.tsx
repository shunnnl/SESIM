import React from "react";
import { Link } from "react-router-dom";

interface SidebarMenuProps {
    onClickMenu?: () => void;
}

export const SidebarMenu: React.FC<SidebarMenuProps> = ({ onClickMenu }) => {
    return (
        <div className="flex flex-col gap-[20px] text-[18px] text-white px-8 pt-[86px]">
            <Link to="/" onClick={onClickMenu}>홈</Link>
            <Link to="/about" onClick={onClickMenu}>소개</Link>
            <Link to="/ai-model" onClick={onClickMenu}>AI모델</Link>
            <Link to="/model-inference-service" onClick={onClickMenu}>모델추론 서비스</Link>
            <Link to="/sdk-download" onClick={onClickMenu}>SDK 다운로드</Link>
            <Link to="/userinfo" onClick={onClickMenu}>마이페이지</Link>
        </div>
    );
};