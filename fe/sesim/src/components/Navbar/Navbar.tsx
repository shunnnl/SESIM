import React from 'react';
import { Link } from 'react-router-dom';
import { SesimLogo } from './SesimLogo';

const NavbarMenu: React.FC = () => {
    return (
        <>
            <div className="nav-menu flex gap-[60px] text-[18px] text-white">
                <Link to="/">
                    홈
                </Link>
                <Link to="/about">
                    소개
                </Link>
                <Link to="/ai-model">
                    AI모델
                </Link>
                <Link to="/model-inference-service">
                    모델추론 서비스
                </Link>
                <Link to="/docs">
                    Docs
                </Link>
            </div>
        </>
    );
};

export const Navbar: React.FC = () => {
    return (
        <nav className="sticky top-0 z-50 flex justify-between items-center h-[96px] px-[178px] border-b-2 border-white/24">
            <div className="flex items-center gap-[120px]">
                <SesimLogo />
                <NavbarMenu />
            </div>
            
            <div className="login-signup">
                <button className="text-white text-[18px]">로그인</button>
            </div>
        </nav>
    );
};