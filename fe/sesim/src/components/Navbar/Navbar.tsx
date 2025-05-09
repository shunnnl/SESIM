import React, { useState } from "react";
import { SesimLogo } from "./SesimLogo";
import { RootState } from "../../store";
import { NavbarMenu } from "./NavbarMenu";
import { SidebarMenu } from "./SidebarMenu";
import { LoginButton } from "./LoginButton";
import { logout } from "../../store/authSlice";
import { LoginModal } from "../Popup/LoginModal";
import { SignUpModal } from "../Popup/SignUpModal";
import { useDispatch, useSelector } from "react-redux";

export const Navbar: React.FC = () => {
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.auth.user);
    const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);

    const handleSignUpClick = () => {
        setIsLoginModalOpen(false);
        setIsSignUpModalOpen(true);
    };


    const handleLoginClick = () => {
        setIsLoginModalOpen(true);
        setIsSignUpModalOpen(false);
    };


    const handleLoginModalOpen = () => {
        setSidebarOpen(false);
        setIsLoginModalOpen(!isLoginModalOpen);
    };


    const handleLogout = () => {
        dispatch(logout());
    };

    return (
        <nav className="flex justify-between items-center px-4 border-b-2 border-white/20 md:px-12 h-[86px]">
            <div className="flex items-center lg:gap-[120px] md:gap-2" >
                <SesimLogo />
                <div className="hidden md:flex gap-8">
                    <NavbarMenu />
                </div>
            </div>
            <div className="hidden md:block">
                {isLoggedIn ? (
                    <div
                        className="flex flex-row items-center justify-between py-[10px] px-[10px] lg:px-[16px] lg:w-[144px] border border-white/80 rounded-[50px] cursor-pointer"
                    >
                        <span className="hidden lg:block font-semibold text-[16px] leading-[21px] text-white flex-none order-0">
                            {user?.nickname}
                        </span>
                        <div className="flex flex-row justify-center items-center p-[10px] w-[30px] h-[30px] bg-gradient-to-r from-[#5EA3EC] to-[#6C72F4] rounded-[30px] flex-none order-1">
                            <span className="font-bold text-[14px] leading-[21px] text-white flex-none order-0">
                                {user?.nickname.charAt(0)}
                            </span>
                        </div>
                    </div>
                ) : (
                    <LoginButton onClickLoginModal={handleLoginModalOpen} />
                )}
            </div>
            {!sidebarOpen && (
                <button
                    className="md:hidden z-50"
                    onClick={() => setSidebarOpen(true)} aria-label="메뉴 열기"
                    style={{ color: "white", fontSize: "30px" }}
                >
                    ☰
                </button>
            )}
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 flex">
                    <div
                        className="fixed inset-0 bg-black/60"
                        onClick={() => setSidebarOpen(false)}
                    />
                    <div
                        className="ml-auto w-2/3 max-w-xs h-full bg-black shadow-lg flex flex-col animate-slideInRight relative"
                    >
                        <button
                            className="absolute top-4 right-4 text-white text-2xl"
                            onClick={() => setSidebarOpen(false)}
                            aria-label="메뉴 닫기"
                        >
                            ✕
                        </button>
                        <SidebarMenu onClickMenu={() => setSidebarOpen(false)} />
                        {isLoggedIn ? (
                            <div className="px-8 py-4 mt-auto">
                                <button
                                    className="text-white text-[18px] w-full text-left"
                                    onClick={handleLogout}
                                >
                                    로그아웃
                                </button>
                            </div>
                        ) : (
                            <div className="px-8 py-4 mt-auto">
                                <button
                                    className="text-white text-[18px] w-full text-left"
                                    onClick={handleLoginModalOpen}
                                >
                                    로그인
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
                onSwitchToSignUp={handleSignUpClick}
            />
            <SignUpModal
                isOpen={isSignUpModalOpen}
                onClose={() => setIsSignUpModalOpen(false)}
                onSwitchToLogin={handleLoginClick}
            />
        </nav>
    );
};