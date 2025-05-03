import React, { useState } from 'react';
import { SesimLogo } from './SesimLogo';
import { NavbarMenu } from './NavbarMenu';
import { SidebarMenu } from './SidebarMenu';

const LoginButton = () => {
    return (
        <button className="text-white text-[18px] font-bold bg-gradient-to-r from-[#5EA3EC] to-[#6C72F4] rounded-[35px] px-[22px] py-[7px]">로그인</button>
    )
}

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
            {/* 모바일 햄버거 버튼 */}
            {!sidebarOpen && (
                <button className="md:hidden z-50" onClick={() => setSidebarOpen(true)} aria-label="메뉴 열기" style={{ color: 'white', fontSize: '30px' }}>☰</button>
            )}
            {/* 모바일 사이드바 */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 flex">
                    {/* 오버레이 */}
                    <div className="fixed inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
                    {/* 사이드바 */}
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