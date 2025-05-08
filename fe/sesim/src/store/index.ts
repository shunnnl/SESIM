import { configureStore } from "@reduxjs/toolkit";
import keyinfoReducer from "./keyinfoSlice"; 
import projectReducer from "./projectSlice"; 
import apiUsageReducer from "./APIUsageSlice";

export const store = configureStore({
    reducer: {
        keyinfo: keyinfoReducer, 
        project: projectReducer, 
        apiUsage: apiUsageReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;  
