import React, { createContext, useState, FC } from 'react';
import { Message } from "../../services/chat";

export type UserData = {
  userId: string;
  name: string;
  token?: string;
};

export interface MessageRepository {
  messages: Array<Message>,
  setUsers?: (value: Array<UserData>) => void,
  getUserData?: (userId: string) => UserData,
  addMessage?: (message:Message) => void,
  addMessages?: (items:Array<Message>) => void,
  updateMessage?: (message:Message) => void,
  deleteMessage?:(messageId:number) => void,
  clearMessages?: () => void,
  setMessages?: (items:Array<Message>) => void,
}

const initialState: MessageRepository = {
  messages: []
};

function messageSortFn(a:Message, b:Message):number {
  return a.createdAt - b.createdAt;
}

function deleteDuplicates(messages:Array<Message>) {
  let i = 0;
  while (i < (messages.length - 1)) {
    if (messages[i].id === messages[i + 1].id) {
      messages.splice(i, 1);
      continue;
    }
    i++;
  }
}


//create a context, with createContext api
export const MessagesContext = createContext(initialState);

export const MessagesContextProvider: FC = ({ children }) => {
  // this state will be shared with all components
  const [messages, setMessages] = useState(initialState.messages);

  function addMessage(message:Message) {
    if (messages.find(m => m.id === message.id)) {
      return;
    }
    setMessages(messages.concat([message]));
  }

  function addMessages(items:Array<Message>) {
    const concatenated = messages.concat(items).sort(messageSortFn);
    deleteDuplicates(concatenated);
    setMessages(concatenated);
  }

  function updateMessage(message:Message) {
    const index = messages.findIndex(m => m.id === message.id);
    if (index >= 0) {
      messages[index] = message;
      setMessages(messages.concat());
    }
  }

  function deleteMessage(messageId:number) {
    const index = messages.findIndex(m => m.id === messageId);
    if (index >= 0) {
      messages.splice(index, 1);
      setMessages(messages.concat());
    }
  }

  function clearMessages() {
    setMessages([]);
  }

  return (
    <MessagesContext.Provider
      value={{
        messages,
        addMessage,
        addMessages,
        updateMessage,
        deleteMessage,
        clearMessages,
        setMessages
      }}>
      {children}
    </MessagesContext.Provider>
  );
};