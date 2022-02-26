import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FlashMessage } from '../flashMessages';
import { saveConfig } from '../../services/config';
import { BaseState } from './basetypes';

export interface UIState extends BaseState {
  selectedChannelUrl: string;
  selectedNickname: string;
  connectionStatus: ConnectionStatus;
  errors: Array<FlashMessage>;
}

export enum ConnectionStatus {
  Disconnected = 1,
  Connected,
  JoinedChannel,
}

const initialState: UIState = {
  selectedChannelUrl: '',
  selectedNickname: '',
  connectionStatus: ConnectionStatus.Disconnected,
  errors: [],
};

const PERSISTED_PROPERTIES = new Set<string>(['selectedChannelUrl', 'selectedNickname']);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type KVUntyped = Record<string, any>;

function persistedState(state: KVUntyped) {
  const persistedKeys = Object.keys(state).filter(k => PERSISTED_PROPERTIES.has(k));
  const persistedState: KVUntyped = {};
  persistedKeys.forEach(k => {
    persistedState[k] = state[k];
  });
  return persistedState as object;
}

const slice = createSlice({
  name: 'uistate',
  initialState,
  reducers: {
    setSelectedChannelUrl: (state, action: PayloadAction<string>) => {
      console.log('setSelectedChannelUrl', action.payload);
      state.selectedChannelUrl = action.payload;
      saveConfig('uistate', persistedState(state));
    },
    setSelectedNickname: (state, action: PayloadAction<string>) => {
      console.log('setSelectedNickname', action.payload);
      state.selectedNickname = action.payload;
      saveConfig('uistate', persistedState(state));
    },
    setConnected: state => {
      state.connectionStatus = ConnectionStatus.Connected;
    },
    setDisconnected: state => {
      state.connectionStatus = ConnectionStatus.Disconnected;
    },
    setJoinedChannel: state => {
      state.connectionStatus = ConnectionStatus.JoinedChannel;
    },
    addFlashMessage: (state, action: PayloadAction<FlashMessage>) => {
      const error = action.payload;
      if (state.errors.find(e => e.id === error.id)) {
        return;
      }
      state.errors = state.errors.concat([action.payload]);
    },
    clearFlashMessage: (state, action: PayloadAction<FlashMessage | string>) => {
      let eId = '';
      const { payload } = action;
      if ((payload as FlashMessage).id) {
        eId = (action.payload as FlashMessage).id;
      } else {
        eId = payload as string;
      }
      const errors = state.errors.filter(e => e.id !== eId);
      state.errors = errors;
    },
    clearFlashMessages: state => {
      state.errors = [];
    },
    initialize: (state, action: PayloadAction<object>) => {
      Object.assign(state, action.payload);
    },
  },
});

export const {
  setSelectedChannelUrl,
  setSelectedNickname,
  setConnected,
  setDisconnected,
  setJoinedChannel,
  addFlashMessage,
  clearFlashMessage,
  clearFlashMessages,
  initialize,
} = slice.actions;
export const reducer = slice.reducer;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const selector = (state: any) => state.uistate;
