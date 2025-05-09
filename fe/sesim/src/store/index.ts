import { configureStore } from "@reduxjs/toolkit";
import createProjectInfoReducer from "./createProjectInfoSlice";
import aiModelReducer from "./aiModelSlice";
import keyinfoReducer from "./keyinfoSlice"; 
import projectReducer from "./projectSlice"; 
import apiUsageReducer from "./APIUsageSlice";
import authReducer from "./authSlice";

export const store = configureStore({
    reducer: {
        createProjectInfo: createProjectInfoReducer,
        aiModel: aiModelReducer,
        keyinfo: keyinfoReducer, 
        project: projectReducer, 
        apiUsage: apiUsageReducer,
        auth: authReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;