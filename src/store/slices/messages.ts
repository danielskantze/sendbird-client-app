import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Message } from "../../services/chat";
import { BaseState } from "./basetypes";

export interface MessageRepository extends BaseState {
  messages: Array<Message>;
}

const initialState: MessageRepository = {
  messages: []
};

const slice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<Message>) => {
      const message = action.payload;
      if (state.messages.find(m => m.id === message.id)) {
        return;
      }
      state.messages = state.messages.concat([message]);
    },
    setMessages: (state, action: PayloadAction<Array<Message>>) => {
      const messages = action.payload;
      state.messages = messages.concat();
    },
    clearMessages: (state) => {
      state.messages = [];
    },
    initialize: (state) => {
      state.messages = [];
    },
  },
});

export const { addMessage, setMessages, clearMessages, initialize } = slice.actions;
export const reducer = slice.reducer;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const selector = (state:any) => state.messages;
