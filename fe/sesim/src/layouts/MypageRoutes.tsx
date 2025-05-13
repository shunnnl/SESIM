import { Routes, Route } from "react-router-dom";
import { ProjectPage } from "../pages/ProjectPage";
import { APIUsagePage } from "../pages/APIUsagePage";

export const mypageRoutes = [
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
