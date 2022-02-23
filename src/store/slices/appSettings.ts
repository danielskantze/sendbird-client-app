import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { BaseState } from "./basetypes";

export interface AppSettings extends BaseState {
  apiKey: string;
}

const initialState: AppSettings = {
  apiKey: "",
};

const slice = createSlice({
  name: "app",
  initialState,
  reducers: {
    updateApiKey: (state, action: PayloadAction<string>) => {
      state.apiKey = action.payload;
    },
  },
});

export const { updateApiKey } = slice.actions;
export const reducer = slice.reducer;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const selector = (state:any) => state.app;
