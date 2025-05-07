import { configureStore } from "@reduxjs/toolkit";
import createProjectInfoReducer from "./createProjectInfoSlice";

export const store = configureStore({
    reducer: {
        createProjectInfo: createProjectInfoReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;