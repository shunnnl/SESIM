import { Route, Routes, useLocation } from "react-router-dom"
import { HomePage } from "../pages/HomePage";
import { AboutPage } from "../pages/AboutPage";
import { AiModelPage } from "../pages/AiModelPage";
import { KeyInfoPage } from "../pages/KeyInfoPage";
import { ProjectPage } from "../pages/ProjectPage";
import { APIUsagePage } from "../pages/APIUsagePage";
import { UserInfoPage } from "../pages/UserInfoPage";
import { Footer } from "../components/Footer/Footer";
import { Navbar } from "../components/Navbar/Navbar";
import { SdkDownloadPage } from "../pages/SdkDownloadPage";
import { AiModelDetailPage } from "../pages/AiModelDetailPage";
import { CreateProjectPage } from "../pages/CreateProjectPage";
import { getPageBackgroundClass } from "../utils/backgroundUtils";
import { ModelInferenceServicePage } from "../pages/ModelInferenceServicePage";

export const MainLayout = () => {
    const location = useLocation();
    const backgroundClass = getPageBackgroundClass(location.pathname);

    // Footer를 숨길 경로
    const hideFooter = location.pathname === "/model-inference-service/create-project";

    return (
        <div className={backgroundClass}>
            <div>
                <Navbar />
                <main className="min-h-screen">
                    <Routes>
                        <Route path="/" element={<HomePage />}  />
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="/ai-model" element={<AiModelPage />} />
                        <Route path="/ai-model/:modelId" element={<AiModelDetailPage />} />
                        <Route path="/model-inference-service" element={<ModelInferenceServicePage />} />
                        <Route path="/model-inference-service/create-project" element={<CreateProjectPage />} />
                        <Route path="/sdk-download" element={<SdkDownloadPage />} />
                        <Route path="/userinfo" element={<UserInfoPage />} />
                        <Route path="/keyinfo" element={<KeyInfoPage />} />
                        <Route path="/project" element={<ProjectPage />} />
                        <Route path="/apiusage" element={<APIUsagePage />} />
                    </Routes>
                </main>
            </div>
            {!hideFooter && <Footer />}
        </div>
    );
};