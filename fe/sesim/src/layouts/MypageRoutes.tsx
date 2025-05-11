import { Routes, Route } from "react-router-dom";
import { KeyInfoPage } from "../pages/KeyInfoPage";
import { ProjectPage } from "../pages/ProjectPage";
import { APIUsagePage } from "../pages/APIUsagePage";
import { UserInfoPage } from "../pages/UserInfoPage";

export const mypageRoutes = [
    { path: "/userinfo", element: <UserInfoPage /> },
    { path: "/keyinfo", element: <KeyInfoPage /> },
    { path: "/project", element: <ProjectPage /> },
    { path: "/apiusage", element: <APIUsagePage /> },
];

export const MypageRoutes = () => {
    return (
        <Routes>
            {mypageRoutes.map(route => (
                <Route key={route.path} path={route.path} element={route.element} />
            ))}
        </Routes>
    );
};
