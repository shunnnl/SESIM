import { configureStore } from "@reduxjs/toolkit";
import keyinfoReducer from "./keyinfoSlice"; 
import projectReducer from "./projectSlice"; 
import apiUsageReducer from "./APIUsageSlice";

// configureStore로 스토어 설정
export const store = configureStore({
    reducer: {
        keyinfo: keyinfoReducer, 
        project: projectReducer, 
        apiUsage: apiUsageReducer,
    },
});

// RootState와 AppDispatch 타입 정의
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;  
