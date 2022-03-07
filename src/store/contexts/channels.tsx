import React, { createContext, useState, FC, useEffect } from 'react';
import { loadConfig } from '../../services/config';
import { persistedSetterFactory } from './helpers';

export type ChannelDescriptor = {
  name: string;
  url: string;
};

export interface PersistedState {
  channels: Array<ChannelDescriptor>;
}

export interface ChannelSettings extends PersistedState {
  setChannels?: (items:Array<ChannelDescriptor>) => void
}

const initialState: ChannelSettings = {
  channels: [],
};

//create a context, with createContext api
export const ChannelsContext = createContext(initialState);

export const ChannelsContextProvider: FC = ({ children }) => {
  // this state will be shared with all components
  const [channels, _setChannels] = useState(initialState.channels);

  const getPeristedState = (): PersistedState => {
    return { channels };
  };

  const persistedSetterFn = persistedSetterFactory('channels', getPeristedState);

  useEffect(() => {
    loadConfig('channels', {}).then(c => {
      const state = c as PersistedState;
      _setChannels(state.channels);
    });
  }, []);

  return (
    <ChannelsContext.Provider
      value={{
        channels,
        setChannels: persistedSetterFn({channels}, _setChannels)
      }}>
      {children}
    </ChannelsContext.Provider>
  );
};