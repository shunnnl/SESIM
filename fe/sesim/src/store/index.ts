import { configureStore } from "@reduxjs/toolkit";
import createProjectInfoReducer from "./createProjectInfoSlice";
import keyinfoReducer from "./keyinfoSlice"; 
import projectReducer from "./projectSlice"; 
import apiUsageReducer from "./APIUsageSlice";

export const store = configureStore({
    reducer: {
        createProjectInfo: createProjectInfoReducer,
        keyinfo: keyinfoReducer, 
        project: projectReducer, 
        apiUsage: apiUsageReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
