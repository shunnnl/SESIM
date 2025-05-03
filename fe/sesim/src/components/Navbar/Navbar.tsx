import React, { useState } from "react";
import { SesimLogo } from "./SesimLogo";
import { NavbarMenu } from "./NavbarMenu";
import { SidebarMenu } from "./SidebarMenu";
import { LoginButton } from "./LoginButton";

export const Navbar: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    return (
        <nav className="flex justify-between items-center px-4 border-b-2 border-white/ md:px-12 h-[86px]">
            <div className="flex items-center lg:gap-[120px] md:gap-2" >
                <SesimLogo />
                <div className="hidden md:flex gap-8">
                    <NavbarMenu />
                </div>
            </div>
            <div className="hidden md:block">
                <LoginButton />
            </div>
            {!sidebarOpen && (
                <button className="md:hidden z-50" onClick={() => setSidebarOpen(true)} aria-label="메뉴 열기" style={{ color: 'white', fontSize: '30px' }}>☰</button>
            )}
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 flex">
                    <div className="fixed inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
                    <div className="ml-auto w-2/3 max-w-xs h-full bg-black shadow-lg flex flex-col animate-slideInRight relative">
                        <button className="absolute top-4 right-4 text-white text-2xl" onClick={() => setSidebarOpen(false)} aria-label="메뉴 닫기">✕</button>
                        <SidebarMenu onClickMenu={() => setSidebarOpen(false)} />
                        <div className="px-8 py-4 mt-auto">
                            <button className="text-white text-[18px] w-full text-left">로그인</button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};