import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BaseState } from './basetypes';

export type ChannelDescriptor = {
  title: string;
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
    }
  }
});

export const { setChannels } = slice.actions;
export const reducer = slice.reducer;
export const selector = (state: any) => state.channels;
