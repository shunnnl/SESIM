import { configureStore } from "@reduxjs/toolkit";
import createProjectInfoReducer from "./createProjectInfoSlice";
import aiModelReducer from "./aiModelSlice";

export const store = configureStore({
    reducer: {
        createProjectInfo: createProjectInfoReducer,
        aiModel: aiModelReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;