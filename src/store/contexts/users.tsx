import React, { createContext, useState, FC, useEffect } from 'react';
import { loadConfig } from '../../services/config';
import { persistedSetterFactory } from './helpers';

export type UserData = {
  userId: string;
  name: string;
  token?: string;
};

interface PersistedSettings {
  users: Array<UserData>;
}

export interface UserRepository extends PersistedSettings {
  setUsers?: (value: Array<UserData>) => void;
  getUserData?: (userId: string) => UserData;
}

const initialState: UserRepository = {
  users: [],
};

//create a context, with createContext api
export const UsersContext = createContext(initialState);

export const UsersContextProvider: FC = ({ children }) => {
  // this state will be shared with all components
  const [users, _setUsers] = useState(initialState.users);

  const getPeristedState = (): PersistedSettings => {
    return { users };
  };

  const persistedSetterFn = persistedSetterFactory('users', getPeristedState);
  useEffect(() => {
    loadConfig('users', {}).then((state: UserRepository) => {
      console.log('users', state);
      _setUsers(state.users);
    });
  }, []);

  return (
    <UsersContext.Provider
      value={{
        users,
        setUsers: persistedSetterFn({ users }, _setUsers),
        getUserData: (userId:string) => users.find(n => n.userId === userId),
      }}>
      {children}
    </UsersContext.Provider>
  );
};