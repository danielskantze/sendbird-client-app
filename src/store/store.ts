import { combineReducers, configureStore } from "@reduxjs/toolkit";
import * as appSettings from "./slices/appSettings";
import * as channelSettings from "./slices/channelSettings";
import * as nicknameSettings from "./slices/nicknameSettings";
import { BaseState } from "./slices/basetypes";

const reducer = combineReducers<BaseState>({
    app: appSettings.reducer,
    channels: channelSettings.reducer,
    nicknames: nicknameSettings.reducer
});

export const store = configureStore({ reducer });

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;