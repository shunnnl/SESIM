import { Route, Routes, useLocation } from "react-router-dom"
import { HomePage } from "../pages/HomePage";
import { DocsPage } from "../pages/DocsPage";
import { AboutPage } from "../pages/AboutPage";
import { AiModelPage } from "../pages/AiModelPage";
import { KeyInfoPage } from "../pages/KeyInfoPage";
import { UserInfoPage } from "../pages/UserInfoPage";
import { Footer } from "../components/Footer/Footer";
import { Navbar } from "../components/Navbar/Navbar";
import { CreateProjectPage } from "../pages/CreateProjectPage";
import { getPageBackgroundClass } from "../utils/backgroundUtils";
import { ModelInferenceServicePage } from "../pages/ModelInferenceServicePage";

export const MainLayout = () => {
    const location = useLocation();
    const backgroundClass = getPageBackgroundClass(location.pathname);

    return (
        <div className={backgroundClass}>
            <div>
                <Navbar />
                <main className="min-h-screen">
                    <Routes>
                        <Route path="/" element={<HomePage />}  />
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="/ai-model" element={<AiModelPage />} />
                        <Route path="/model-inference-service" element={<ModelInferenceServicePage />} />
                        <Route path="/model-inference-service/create-project" element={<CreateProjectPage />} />
                        <Route path="/docs" element={<DocsPage />} />
                        <Route path="/userinfo" element={<UserInfoPage/>} />
                        <Route path="/keyinfo" element={<KeyInfoPage/>} />
                    </Routes>
                </main>
            </div>
            <Footer />
        </div>
    );
};