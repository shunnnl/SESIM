import React from "react";
import { IconType } from "react-icons";
import { NavLink } from "react-router-dom";
import { LuChartColumnIncreasing, LuFolder } from "react-icons/lu";

interface SidebarNavItemProps {
    to: string;
    icon: IconType;
    label: string;
}

const SidebarNavItem: React.FC<SidebarNavItemProps> = ({ to, icon: Icon, label }) => {
    return (
        <NavLink 
            to={to}
            className={({ isActive }) => 
                `flex items-center gap-3 px-[20px] py-[12px] rounded-full transition duration-200 ${isActive ? "bg-[#242B3A] font-semibold text-white" : "font-medium text-gray-400 hover:bg-[#242B3A]"}`
        }>
            {({ isActive }) => (
                <>
                    <Icon className={`text-xl ${isActive ? "text-white" : "text-gray-400"}`} />
                    {label}
                </>
            )}
        </NavLink>
    );
};

export const Sidebar: React.FC = () => {
    return (
        <div className="w-[280px] h-full text-white pt-[48px] pr-[48px] flex flex-col border-r-2 border-[#242B3A]">
            <div className="mb-8 flex items-center gap-5">
                {/* 사용자 정보 */}
                <div className="flex flex-row justify-center items-center p-[10px] w-[48px] h-[48px] bg-gradient-to-r from-[#5EA3EC] to-[#6C72F4] rounded-[30px]">
                    <span className="font-bold text-xl leading-[21px] text-white">
                        {localStorage.getItem("nickname")?.charAt(0)}
                    </span>
                </div>
                
                <div>
                    <div className="text-xl font-bold">{localStorage.getItem("nickname")}</div>
                    <div className="text-sm font-medium text-gray-400">{localStorage.getItem("email")}</div>
                </div>
            </div>

            {/* 네비게이션 메뉴 */}
            <nav className="flex flex-col gap-5">
                <SidebarNavItem 
                    to="/apiusage" 
                    icon={LuChartColumnIncreasing} 
                    label="API사용량 / 금액" 
                />
                <SidebarNavItem 
                    to="/project" 
                    icon={LuFolder} 
                    label="프로젝트" 
                />
            </nav>
        </div>
    );
};
