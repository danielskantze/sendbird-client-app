import React, { createContext, useState, FC, useEffect } from 'react';
import { loadConfig } from '../../services/config';
import { persistedSetterFactory } from './helpers';
import { FlashMessage } from '../flashMessages';

interface PersistedState {
  selectedChannelUrl: string;
  selectedUserId: string;
}

export interface UIState extends PersistedState {
  operatorIds: Array<string>,
  connectionStatus: ConnectionStatus,
  errors: Array<FlashMessage>,
  setSelectedChannelUrl?: (value: string) => void,
  setSelectedUserId?: (value: string) => void,
  setOperatorIds?: (value: Array<string>) => void,
  setConnectionStatus?: (value: ConnectionStatus) => void,
  setConnected?: () => void,
  setDisconnected?: () => void,
  setJoinedChannel?: () => void,
  addFlashMessage?: (message:FlashMessage) => void,
  clearFlashMessage?: (messageOrId:FlashMessage | string) => void,
  clearFlashMessages?: () => void
}

export enum ConnectionStatus {
  Disconnected = 1,
  Connected,
  JoinedChannel,
}

const initialState: UIState = {
  selectedChannelUrl: '',
  selectedUserId: '',
  operatorIds: new Array<string>(),
  connectionStatus: ConnectionStatus.Disconnected,
  errors: [],
};

export const UIContext = createContext(initialState);

export const UIContextProvider: FC = ({ children }) => {
  const [selectedChannelUrl, _setSelectedChannelUrl] = useState(initialState.selectedChannelUrl);
  const [selectedUserId, _setelectedUserId] = useState(initialState.selectedUserId);
  const [operatorIds, setOperatorIds] = useState(initialState.operatorIds);
  const [connectionStatus, setConnectionStatus] = useState(initialState.connectionStatus);
  const [errors, setErrors] = useState(initialState.errors);
  
  const getPeristedState = ():PersistedState => {
    return { selectedChannelUrl, selectedUserId };
  }

  const addFlashMessage = (message:FlashMessage) => {
    if (errors.find(e => e.id === message.id)) {
      return;
    }
    setErrors(errors.concat([message]));
  };

  const clearFlashMessage = (messageOrId: FlashMessage | string) => {
    let eId = '';
    if ((messageOrId as FlashMessage).id) {
      eId = (messageOrId as FlashMessage).id;
    } else {
      eId = messageOrId as string;
    }    
    setErrors(errors.filter(e => e.id !== eId));
  };

  const clearFlashMessages = () => {
    setErrors([]);
  };

  useEffect(() => {
    loadConfig('ui', {}).then(c => {
      if (c) {
        const state = c as PersistedState;
        _setSelectedChannelUrl(state.selectedChannelUrl || initialState.selectedChannelUrl);
        _setelectedUserId(state.selectedUserId || initialState.selectedUserId);
      }
    });
  }, []);

  const persistedSetterFn = persistedSetterFactory('ui', getPeristedState);
  
  return (
    <UIContext.Provider
      value={{
        selectedUserId,
        setSelectedUserId: persistedSetterFn({ selectedUserId }, _setelectedUserId),
        selectedChannelUrl,
        setSelectedChannelUrl: persistedSetterFn({ selectedChannelUrl }, _setSelectedChannelUrl),
        operatorIds,
        setOperatorIds,
        connectionStatus,
        setConnected: () => { setConnectionStatus(ConnectionStatus.Connected) },
        setDisconnected: () => { setConnectionStatus(ConnectionStatus.Disconnected) },
        setJoinedChannel: () => { setConnectionStatus(ConnectionStatus.JoinedChannel) },
        errors,
        addFlashMessage,
        clearFlashMessage,
        clearFlashMessages,
      }}>
      {children}
    </UIContext.Provider>
  );
};