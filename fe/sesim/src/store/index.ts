import { configureStore } from "@reduxjs/toolkit";
import keyinfoReducer from "./keyinfoSlice"; 
import projectReducer from "./projectSlice"; 

export const store = configureStore({
    reducer: {
        keyinfo: keyinfoReducer, 
        project: projectReducer, 
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;  
