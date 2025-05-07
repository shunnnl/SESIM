import { configureStore } from "@reduxjs/toolkit";
import awsSessionReducer from "./awsSessionSlice";

export const store = configureStore({
    reducer: {
        awsSession: awsSessionReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;