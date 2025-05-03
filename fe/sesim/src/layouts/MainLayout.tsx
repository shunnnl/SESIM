import { Route, Routes, useLocation } from "react-router-dom"
import { HomePage } from "../pages/HomePage";
import { DocsPage } from "../pages/DocsPage";
import { AboutPage } from "../pages/AboutPage";
import { AiModelPage } from "../pages/AiModelPage";
import { Navbar } from "../components/Navbar/Navbar";
import { ModelInferenceServicePage } from "../pages/ModelInferenceServicePage";

export const MainLayout = () => {
    const location = useLocation();
    const isHomePage = location.pathname === '/';

    return (
        <div className={`${isHomePage ? 'bg-cyber-security bg-cover bg-center bg-no-repeat min-h-screen' : ''}`}>
            <Navbar />
            <main className="w-full px-4 sm:px-6 md:px-8 lg:px-[178px] max-w-[1564px] mx-auto">
                <Routes>
                    <Route path="/" element={<HomePage />}  />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/ai-model" element={<AiModelPage />} />
                    <Route path="/model-inference-service" element={<ModelInferenceServicePage />} />
                    <Route path="/docs" element={<DocsPage />} />
                </Routes>
            </main>
        </div>
    );
};