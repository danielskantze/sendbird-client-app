import { createContext } from 'react';
import { ChatService } from './services/chat';

const initialState = {
    chat: new ChatService(null, null),
};

export type SharedServices = {
    chat:ChatService
}

export const SharedServicesContext = createContext(initialState);
