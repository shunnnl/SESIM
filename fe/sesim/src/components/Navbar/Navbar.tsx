import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import React, { useState, useEffect, useRef } from "react";
import { SesimLogo } from "./SesimLogo";
import { RootState } from "../../store";
import { NavbarMenu } from "./NavbarMenu";
import { SidebarMenu } from "./SidebarMenu";
import { LoginButton } from "./LoginButton";
import { UserDropdown } from "./UserDropdown";
import { logout } from "../../store/authSlice";


interface NavbarProps {
    isLoginModalOpen: boolean;
    setIsLoginModalOpen: (open: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
    isLoginModalOpen,
    setIsLoginModalOpen,
}) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isScrolled, setIsScrolled] = useState(false);

    const user = useSelector((state: RootState) => state.auth.user);
    const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const triggerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleLoginModalOpen = () => {
        setSidebarOpen(false);
        setIsLoginModalOpen(!isLoginModalOpen);
    };

    const handleLogout = () => {
        dispatch(logout());
        navigate("/");
        setIsDropdownOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                isDropdownOpen &&
                triggerRef.current &&
                !triggerRef.current.contains(event.target as Node) &&
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => { document.removeEventListener("mousedown", handleClickOutside); };
    }, [isDropdownOpen]);

    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY;
            setIsScrolled(scrollPosition > 0);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`border-b-2 border-white/20 sticky top-0 z-50 transition-all duration-400 ${isScrolled ? 'backdrop-blur-md bg-black/50' : ''}`}>
            <div className="flex justify-between items-center h-[50px] md:h-[70px] lg:h-[86px] container-padding">
                <div className="flex items-center gap-4 md:gap-1 lg:gap-[40px]" >
                    <SesimLogo />
                    <div className="hidden md:flex">
                        <NavbarMenu />
                    </div>
                </div>
                <div className="hidden md:block">
                    {isLoggedIn && user ? (
                        <div className="relative">
                            <div
                                ref={triggerRef}
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className={`flex flex-row items-center py-[10px] px-[10px] lg:px-[16px] lg:gap-[10px] border border-white/50 rounded-[50px] cursor-pointer min-w-fit hover:border-white/0 hover:shadow-[0px_0px_15px_rgba(116,208,244,0.4)] transition-all duration-300 ${isDropdownOpen ? "border-white/0 shadow-[0px_0px_15px_rgba(116,208,244,0.4)]" : ""}`}
                            >
                                <span className="hidden lg:block font-semibold text-[16px] leading-[21px] text-white flex-none order-0">
                                    {user?.nickname}
                                </span>
                                <div className="flex flex-row justify-center items-center p-[10px] w-[30px] h-[30px] bg-gradient-to-r from-[#5EA3EC] to-[#6C72F4] rounded-[30px] flex-none order-1">
                                    <span className="font-bold text-[14px] leading-[21px] text-white flex-none order-0">
                                        {user?.nickname?.charAt(0)}
                                    </span>
                                </div>
                                <div ref={dropdownRef}>
                                    <UserDropdown
                                        isOpen={isDropdownOpen}
                                        onClose={() => setIsDropdownOpen(false)}
                                        onLogout={handleLogout}
                                    />
                                </div>
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
                                    <div className="flex flex-col space-y-2 gap-1 mb-3">
                                        <div className="w-full border-t border-white/20 my-1"></div>
                                        <div className="flex flex-row justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <div className="flex justify-center items-center p-[6px] w-[24px] h-[24px] bg-gradient-to-r from-[#5EA3EC] to-[#6C72F4] rounded-full">
                                                    <span className="font-bold text-[12px] text-white">
                                                        {user?.nickname?.charAt(0)}
                                                    </span>
                                                </div>
                                                <span className="font-semibold text-[18px] text-white">
                                                    {user?.nickname}
                                                </span>
                                            </div>
                                            <button
                                                className="text-white/70 text-[14px] self-end hover:text-white transition-colors"
                                                onClick={handleLogout}
                                            >
                                                로그아웃
                                            </button>
                                        </div>
                                    </div>
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
            </div>
        </nav>
    );
};