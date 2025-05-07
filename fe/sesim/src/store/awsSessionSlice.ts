import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AwsSessionState {
    accessKey: string;
    secretKey: string;
    sessionToken: string;
    arnId: number | null;
}

const initialState: AwsSessionState = {
    accessKey: "",
    secretKey: "",
    sessionToken: "",
    arnId: null,
}

export const awsSessionSlice = createSlice({
    name: "awsSession",
    initialState,
    reducers: {
        setAwsSession: (state, action: PayloadAction<AwsSessionState>) => {
            state.accessKey = action.payload.accessKey;
            state.secretKey = action.payload.secretKey;
            state.sessionToken = action.payload.sessionToken;
            state.arnId = action.payload.arnId;
        },
        clearAwsSession: (state) => {
            state.accessKey = '';
            state.secretKey = '';
            state.sessionToken = '';
            state.arnId = null;
        },
    },
});

export const { setAwsSession, clearAwsSession } = awsSessionSlice.actions;
export default awsSessionSlice.reducer;
