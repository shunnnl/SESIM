import React from "react";
import { IconType } from "react-icons";
import { NavLink } from "react-router-dom";
import { LuChartColumnIncreasing, LuFolder } from "react-icons/lu";

interface TabbarNavItemProps {
    to: string;
    icon: IconType;
    label: string;
};

const TabbarNavItem: React.FC<TabbarNavItemProps> = ({ to, icon: Icon, label }) => {
    return (
        <div>
            <NavLink
                to={to}
                className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-t-2xl transition duration-200 text-sm
                    ${isActive ? "bg-[#04101D] font-semibold text-white" : "font-medium text-gray-400 hover:bg-[#04101D]"}`
                }
            >
                {({ isActive }) => (
                    <>
                        <div className="flex-1 flex items-center gap-3 whitespace-nowrap truncate">
                            <Icon className={`text-xl ${isActive ? "text-white" : "text-gray-400"}`} />
                            {label}
                        </div>
                    </>
                )}
            </NavLink>
        </div>
    );
};

export const Tabbar: React.FC = () => {
    return (
        <div className="w-full bg-[#1D2433]">
            <div className="flex flex-row container-padding content-end justify-between pt-2 pd-1">
                {/* 네비게이션 메뉴 */}
                <div className="flex flex-row items-center gap-5">
                    <TabbarNavItem
                        to="/apiusage"
                        icon={LuChartColumnIncreasing}
                        label="API 사용 대시보드"
                    />
                    <TabbarNavItem
                        to="/project"
                        icon={LuFolder}
                        label="프로젝트"
                    />
                </div>

                {/* 사용자 정보 */}
                <div className="flex flex-row items-center gap-3">
                    <div className="text-sm font-medium text-gray-400">
                        {localStorage.getItem("email")}
                    </div>
                </div>
            </div>
        </div>
    );
};