import { combineReducers, configureStore } from '@reduxjs/toolkit';
import * as appSettings from './slices/appSettings';
import * as channelSettings from './slices/channelSettings';
import * as nicknameSettings from './slices/nicknameSettings';
import * as uiState from './slices/uiState';
import { loadConfig } from '../services/config';
import { BaseState } from './slices/basetypes';

const reducer = combineReducers<BaseState>({
    app: appSettings.reducer,
    channels: channelSettings.reducer,
    nicknames: nicknameSettings.reducer,
    uistate: uiState.reducer
});

export async function initializeStore() {
    const [appConfig, channelsConfig, nicknamesConfig, uiStateConfig] = await Promise.all([
        loadConfig('app'),
        loadConfig('channels'),
        loadConfig('nicknames'),
        loadConfig('uistate'),
    ]);
    store.dispatch(appSettings.initialize(appConfig));
    store.dispatch(channelSettings.initialize(channelsConfig));
    store.dispatch(nicknameSettings.initialize(nicknamesConfig));
    store.dispatch(uiState.initialize(uiStateConfig));
}

export const store = configureStore({ reducer });

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
