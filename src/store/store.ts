import { combineReducers, configureStore, ActionCreatorWithOptionalPayload } from '@reduxjs/toolkit';
import * as appSettings from './slices/appSettings';
import * as channelSettings from './slices/channelSettings';
import * as userSettings from './slices/userSettings';
import * as uiState from './slices/uiState';
import * as messages from './slices/messages';
import { loadConfig } from '../services/config';
import { BaseState } from './slices/basetypes';

const reducer = combineReducers<BaseState>({
    app: appSettings.reducer,
    channels: channelSettings.reducer,
    users: userSettings.reducer,
    uistate: uiState.reducer,
    messages: messages.reducer
});

type StoreInitItem = {
    slice: string,
    actionFn: ActionCreatorWithOptionalPayload<object>
};

export type ConfigMutatorFn = (slice:string, config:object) => Promise<object>;

export async function initializeStore(configMutatorFn?:ConfigMutatorFn) {
    const initItems:Array<StoreInitItem> = [
        { slice: 'app', actionFn: appSettings.initialize },
        { slice: 'channels', actionFn: channelSettings.initialize },
        { slice: 'users', actionFn: userSettings.initialize },
        { slice: 'uistate', actionFn: uiState.initialize },
        { slice: 'messages', actionFn: messages.clearMessages },
    ];
    let configs = await Promise.all(initItems.map(i => loadConfig(i.slice, {})));
    if (configMutatorFn) {
        configs = await Promise.all(configs.map((c, i) => configMutatorFn(initItems[i].slice, c)));
    }
    configs.map((c, i) => store.dispatch(initItems[i].actionFn(c)));
    initItems.map(i => store.dispatch(i.actionFn));
}

export const store = configureStore({ reducer });

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
