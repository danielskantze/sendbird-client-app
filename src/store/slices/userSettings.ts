import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { saveConfig } from '../../services/config';
import { BaseState } from './basetypes';

export type UserData = {
    userId: string
    name: string,
    token?: string,
}

export interface UserRepository extends BaseState {
    users: Array<UserData>;
}

const initialState: UserRepository = {
    users: [],
};

const slice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        setUsers: (state, action: PayloadAction<Array<UserData>>) => {
            state.users = action.payload;
            saveConfig('users', state);
        },
        initialize: (state, action: PayloadAction<object>) => {
            Object.assign(state, action.payload);
        },
    },
});

export function getUserData(userId:string, users:Array<UserData>):UserData {
    return users.find(n => n.userId === userId);
}

export const { setUsers, initialize } = slice.actions;
export const reducer = slice.reducer;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const selector = (state: any) => state.users;
