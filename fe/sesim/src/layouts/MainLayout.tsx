import { useState } from "react";
import { useLocation } from "react-router-dom";
import { MainRoutes } from "./MainRoutes";
import { AuthModals } from "./AuthModals";
import { MypageRoutes, mypageRoutes } from "./MypageRoutes";
import { Navbar } from "../components/Navbar/Navbar";
import { Footer } from "../components/Footer/Footer";
import ScrollToTop from "../components/common/ScrollToTop";
import { getPageBackgroundClass } from "../utils/backgroundUtils";

export const MainLayout = () => {
    const location = useLocation();
    const backgroundClass = getPageBackgroundClass(location.pathname);
    const hideFooter = location.pathname === "/model-inference-service/create-project";
    
    const mypagePaths = mypageRoutes.map(route => route.path);
    const isMypageRoute = mypagePaths.some(path => location.pathname.startsWith(path));

    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);

    return (
        <div className={backgroundClass}>
            <ScrollToTop />
            <div className="relative">
                <div className={`${isMypageRoute ? "relative" : "fixed top-0 left-0 right-0 z-50"}`}>
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

