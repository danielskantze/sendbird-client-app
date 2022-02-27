import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { saveConfig } from '../../services/config';
import { BaseState } from "./basetypes";

export interface AppSettings extends BaseState {
  applicationId: string;
  installationId: string;
}

const initialState: AppSettings = {
  applicationId: "",
  installationId: ''
};

const slice = createSlice({
  name: "app",
  initialState,
  reducers: {
    updateApplicationId: (state, action: PayloadAction<string>) => {
      state.applicationId = action.payload;
      saveConfig('app', state);
    },
    initialize: (state, action: PayloadAction<object>) => {
      Object.assign((state), action.payload);
    },
  },
});

export const { updateApplicationId, initialize } = slice.actions;
export const reducer = slice.reducer;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const selector = (state:any) => state.app;
