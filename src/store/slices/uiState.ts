import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { saveConfig } from '../../services/config';
import { BaseState } from './basetypes';

export interface UIState extends BaseState {
    selectedChannelUrl: string;
    selectedNickname: string;
}

const initialState: UIState = {
    selectedChannelUrl: '',
    selectedNickname: '',
};

const slice = createSlice({
    name: 'uistate',
    initialState,
    reducers: {
        setSelectedChannelUrl: (state, action: PayloadAction<string>) => {
            console.log("setSelectedChannelUrl", action.payload);
            state.selectedChannelUrl = action.payload;
            saveConfig('uistate', state);
        },
        setSelectedNickname: (state, action: PayloadAction<string>) => {
            console.log("setSelectedNickname", action.payload);
            state.selectedNickname = action.payload;
            saveConfig('uistate', state);
        },
        initialize: (state, action: PayloadAction<object>) => {
            Object.assign(state, action.payload);
        },
    },
});

export const { setSelectedChannelUrl, setSelectedNickname, initialize } = slice.actions;
export const reducer = slice.reducer;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const selector = (state: any) => state.uistate;
