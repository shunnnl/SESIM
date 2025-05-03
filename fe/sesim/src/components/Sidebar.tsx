import React from "react";
import { NavLink } from "react-router-dom";
import { LuChartColumnIncreasing } from "react-icons/lu";
import { FaFolder, FaUserAlt, FaKey } from "react-icons/fa";

export const Sidebar: React.FC = () => {
    const getNavLinkClass = ({ isActive }: { isActive: boolean }) =>
        `flex items-center gap-2 pl-4 pt-2 pb-2 pr-3 rounded-full transition duration-200 ${isActive ? "bg-gray-600 font-semibold" : "hover:bg-gray-600"}`;
    return (
        <div className="w-[250px] h-full text-white pt-6 pr-6 flex flex-col border-r border-gray-400">
            <div className="mb-8 flex items-center gap-4">
                {/* 동그란 텍스트 */}
                <div className="w-12 h-12 bg-blue-500 text-white flex items-center justify-center rounded-full">
                    김
                </div>

                {/* 사용자 정보 */}
                <div>
                    <div className="text-sm text-gray-400">welcome 🤚</div>
                    <div className="text-xl font-semibold">김싸피</div>
                </div>
            </div>

            {/* 네비게이션 메뉴 */}
            <nav className="flex flex-col gap-4">
                <NavLink to="/userinfo" className={getNavLinkClass}>
                    <FaUserAlt className="text-xl text-gray-400" />
                    회원정보
                </NavLink>

                <NavLink to="/settings" className={getNavLinkClass}>
                    <LuChartColumnIncreasing className="text-lg text-gray-400" />
                    API사용량 / 금액
                </NavLink>

                <NavLink to="/help" className={getNavLinkClass}>
                    <FaFolder className="text-xl text-gray-400" />
                    프로젝트
                </NavLink>

                <NavLink to="/keyinfo" className={getNavLinkClass}>
                    <FaKey className="text-sm text-gray-400" />
                    키 정보
                </NavLink>
            </nav>
        </div>
    );
};
