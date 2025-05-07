import { configureStore } from "@reduxjs/toolkit";
import keyinfoReducer from "./keyinfoSlice"; // keyinfoSlice import

// RootState와 AppDispatch 타입 정의
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;  // AppDispatch 추가

// configureStore로 스토어 설정
const store = configureStore({
    reducer: {
        keyinfo: keyinfoReducer, // keyinfoSlice의 리듀서를 스토어에 연결
    },
});

export default store;
