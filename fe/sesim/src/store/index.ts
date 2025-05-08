import { configureStore } from "@reduxjs/toolkit";
import keyinfoReducer from "./keyinfoSlice"; 

export const store = configureStore({
    reducer: {
        keyinfo: keyinfoReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 
