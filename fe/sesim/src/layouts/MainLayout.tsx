import { useState } from "react";
import { useLocation } from "react-router-dom";
import { MainRoutes } from "./MainRoutes";
import { AuthModals } from "./AuthModals";
import { Navbar } from "../components/Navbar/Navbar";
import { Footer } from "../components/Footer/Footer";
import { getPageBackgroundClass } from "../utils/backgroundUtils";

export const MainLayout = () => {
    const location = useLocation();
    const backgroundClass = getPageBackgroundClass(location.pathname);
    const hideFooter = location.pathname === "/model-inference-service/create-project";

    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);

    return (
        <div className={backgroundClass}>
            <div>
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
                <main className="min-h-screen">
                    <MainRoutes />
                </main>
            </div>
            {!hideFooter && <Footer />}
        </div>
    );
};