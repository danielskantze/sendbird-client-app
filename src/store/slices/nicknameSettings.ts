import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BaseState } from './basetypes';

export interface NicknameSettings extends BaseState {
  nicknames: Array<string>;
}

const initialState: NicknameSettings = {
    nicknames: [],
};

const slice = createSlice({
  name: 'nicknames',
  initialState,
  reducers: {
    setNicknames: (state, action: PayloadAction<Array<string>>) => {
      state.nicknames = action.payload;
    }
  }
});

export const { setNicknames } = slice.actions;
export const reducer = slice.reducer;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const selector = (state: any) => state.nicknames;
