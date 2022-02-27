import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { saveConfig } from '../../services/config';
import { BaseState } from './basetypes';

export type ChannelDescriptor = {
    name: string;
    url: string;
};

export interface ChannelSettings extends BaseState {
    channels: Array<ChannelDescriptor>;
}

const initialState: ChannelSettings = {
    channels: [],
};

const slice = createSlice({
    name: 'channels',
    initialState,
    reducers: {
        setChannels: (state, action: PayloadAction<Array<ChannelDescriptor>>) => {
            state.channels = action.payload;
            saveConfig('channels', state);
        },
        initialize: (state, action: PayloadAction<object>) => {
            Object.assign(state, action.payload);
        },
    },
});

export const { setChannels, initialize } = slice.actions;
export const reducer = slice.reducer;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const selector = (state: any) => state.channels;
