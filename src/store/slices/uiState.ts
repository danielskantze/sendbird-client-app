import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { saveConfig } from '../../services/config';
import { BaseState } from './basetypes';

export interface UIState extends BaseState {
    selectedChannelUrl: string;
    selectedNickname: string;
    isConnected: boolean;
    inChannel: boolean;
}

const initialState: UIState = {
    selectedChannelUrl: '',
    selectedNickname: '',
    isConnected: false,
    inChannel: false,
};

const PERSISTED_PROPERTIES = new Set<string>([ 
    'selectedChannelUrl',
    'selectedNickname',
]);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type KVUntyped = Record<string, any>;

function persistedState(state:KVUntyped) {
    const persistedKeys = Object.keys(state).filter(k => PERSISTED_PROPERTIES.has(k));
    const persistedState:KVUntyped = {};
    persistedKeys.forEach(k => {
        persistedState[k] = state[k]
    });
    return persistedState as object;
}

const slice = createSlice({
    name: 'uistate',
    initialState,
    reducers: {
        setSelectedChannelUrl: (state, action: PayloadAction<string>) => {
            console.log("setSelectedChannelUrl", action.payload);
            state.selectedChannelUrl = action.payload;
            saveConfig('uistate', persistedState(state));
        },
        setSelectedNickname: (state, action: PayloadAction<string>) => {
            console.log("setSelectedNickname", action.payload);
            state.selectedNickname = action.payload;
            saveConfig('uistate', persistedState(state));
        },
        setIsConnected: (state, action:PayloadAction<boolean>) => {
            console.log("setIsConnected", action.payload);
            state.isConnected = action.payload;
            // NOTE: We do not persist the connected state
        },
        setInChannel: (state, action:PayloadAction<boolean>) => {
            console.log("setIsInChannel", action.payload);
            state.inChannel = action.payload;
            // NOTE: We do not persist the connected state
        },        
        initialize: (state, action: PayloadAction<object>) => {
            Object.assign(state, action.payload);
        },
    },
});

export const { setSelectedChannelUrl, setSelectedNickname, setIsConnected, setInChannel, initialize } = slice.actions;
export const reducer = slice.reducer;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const selector = (state: any) => state.uistate;
