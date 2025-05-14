import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { MainRoutes } from "./MainRoutes";
import { AuthModals } from "./AuthModals";
import { Navbar } from "../components/Navbar/Navbar";
import { Footer } from "../components/Footer/Footer";
import ScrollToTop from "../components/common/ScrollToTop";
import { MypageRoutes, mypageRoutes } from "./MypageRoutes";
import { getPageBackgroundClass } from "../utils/backgroundUtils";

export const MainLayout = () => {
    const location = useLocation();
    const backgroundClass = getPageBackgroundClass(location.pathname);
    const hideFooter = location.pathname === "/model-inference-service/create-project";
    const isCreateProjectPage = location.pathname === "/model-inference-service/create-project";
    
    const mypagePaths = mypageRoutes.map(route => route.path);
    const isMypageRoute = mypagePaths.some(path => location.pathname.startsWith(path));

    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
    const [showNavbar, setShowNavbar] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        if (!isCreateProjectPage) {
            setShowNavbar(true);
            return;
        }

        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            const titleImageHeight = 400;
            
            if (currentScrollY > titleImageHeight) {
                setShowNavbar(false);
            } else {
                if (currentScrollY > lastScrollY) {
                    setShowNavbar(false);
                } else {
                    setShowNavbar(true);
                }
            }
            
            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY, isCreateProjectPage]);

    return (
        <div className={backgroundClass}>
            <ScrollToTop />
            <div className="relative">
                <div className={`${isMypageRoute ? "relative" : "fixed top-0 left-0 right-0 z-50 transition-transform duration-300"} ${!showNavbar && isCreateProjectPage ? "-translate-y-full" : ""}`}>
                    <Navbar
                        isLoginModalOpen={isLoginModalOpen}
                        setIsLoginModalOpen={setIsLoginModalOpen}
                    />
                    <AuthModals
                        isLoginModalOpen={isLoginModalOpen}
                        setIsLoginModalOpen={setIsLoginModalOpen}
                        isSignUpModalOpen={isSignUpModalOpen}
                        setIsSignUpModalOpen={setIsSignUpModalOpen}
                    />
                </div>
                <main className="min-h-screen">
                    <MainRoutes />
                    <MypageRoutes />
                </main>
            </div>
            {!hideFooter && <Footer />}
        </div>
    );
};

