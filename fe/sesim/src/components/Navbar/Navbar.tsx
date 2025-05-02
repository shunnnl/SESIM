import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SesimLogo } from './SesimLogo';

const NavbarMenu: React.FC<{ onClickMenu?: () => void }> = ({ onClickMenu }) => {
    return (
        <div className="nav-menu flex lg:gap-[60px] md:gap-[20px] text-[18px] text-white px-8 items-center justify-center text-center">
            <Link to="/" onClick={onClickMenu}>홈</Link>
            <Link to="/about" onClick={onClickMenu}>소개</Link>
            <Link to="/ai-model" onClick={onClickMenu}>AI모델</Link>
            <Link to="/model-inference-service" onClick={onClickMenu}>모델추론 서비스</Link>
            <Link to="/docs" onClick={onClickMenu}>Docs</Link>
        </div>
    );
};

export const Navbar: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    return (
        <nav className="flex justify-between items-center px-4 border-b-2 border-white/ md:px-12 h-[86px]">
            <div className="flex items-center lg:gap-[120px] md:gap-8" >
                <SesimLogo />
                <div className="hidden md:flex gap-8">
                    <NavbarMenu />
                </div>
            </div>
            <div className="hidden md:block">
                <button className="text-white text-[18px]">로그인</button>
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
                        <NavbarMenu onClickMenu={() => setSidebarOpen(false)} />
                        <div className="px-8 py-4 mt-auto">
                            <button className="text-white text-[18px] w-full text-left">로그인</button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

// tailwind.config.js에 아래 애니메이션 추가 필요
// theme: {
//   extend: {
//     keyframes: {
//       slideInRight: {
//         '0%': { transform: 'translateX(100%)' },
//         '100%': { transform: 'translateX(0)' },
//       },
//     },
//     animation: {
//       slideInRight: 'slideInRight 0.3s ease-out',
//     },
//   },
// },