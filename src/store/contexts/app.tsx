import React, { createContext, useState, FC, useEffect } from 'react';
import { loadConfig } from '../../services/config';
import { persistedSetterFactory } from './helpers';

interface PersistedSettings {
  applicationId: string;
  installationId: string;
}

export interface ApplicationSettings extends PersistedSettings {
  setApplicationId?: (value: string) => void;
  setInstallationId?: (value: string) => void;
}

const initialState: ApplicationSettings = {
  applicationId: '',
  installationId: '',
};

//create a context, with createContext api
export const SettingsContext = createContext(initialState);

export const SettingsProvider: FC = ({ children }) => {
  // this state will be shared with all components
  const [applicationId, _setApplicationId] = useState(initialState.applicationId);
  const [installationId, _setInstallationId] = useState(initialState.installationId);
  
  const getPeristedState = ():PersistedSettings => {
    return { applicationId, installationId };
  }

  useEffect(() => {
    loadConfig('app', {}).then(c => {
      const settings = c as ApplicationSettings;
      _setApplicationId(settings.applicationId);
      _setInstallationId(settings.installationId);
    });
  }, []);

  const persistedSetterFn = persistedSetterFactory('app', getPeristedState);
  
  return (
    <SettingsContext.Provider
      value={{
        applicationId,
        setApplicationId: persistedSetterFn({ applicationId }, _setApplicationId),
        installationId,
        setInstallationId: persistedSetterFn({ installationId }, _setInstallationId),
      }}>
      {children}
    </SettingsContext.Provider>
  );
};