import React, { createContext, useState, FC, useEffect } from 'react';
import { generateRandomId } from '../../services/ids';
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
    loadConfig('app', {})
    .then(c => {
      // generate a random installationId unless it exists since before
      const settings = c as ApplicationSettings;
      if (!settings.installationId) {
        return generateRandomId(8).then((r:string) => {
          settings.installationId = r;
          return settings;
        });
      }
      return settings;
    })
    .then(settings => {
      _setInstallationId(settings.installationId);
      _setApplicationId(settings.applicationId || initialState.applicationId);
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