import React, { useContext, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { SharedServices, SharedServicesContext } from '../appcontext';
import { LayoutColumn } from './atoms/layoutColumn';
import { LayoutRow } from './atoms/layoutRow';
import * as stateUi from '../store/slices/uiState';
import * as stateMessages from '../store/slices/messages';
import { Message } from '../services/chat';
import { ConnectionStatus } from '../store/slices/uiState';

type MessageProps = {
  message: Message;
};

function ChannelMessage(props: MessageProps) {
  return (
    <div className="card chat-message">
      <div className="card-header">
        <div className="tile-title">{props.message.nickname}</div>
      </div>
      <div className="card-body">
        <p>{props.message.message}</p>
      </div>
    </div>
  );
}

export function ChannelMessages() {
  const uiState = useAppSelector(stateUi.selector);
  const messages = useAppSelector(stateMessages.selector);
  const sharedServices = useContext(SharedServicesContext) as SharedServices;
  const dispatch = useAppDispatch();
  const lastElementRef = useRef(null);

  const incomingMessageHandler = (message: Message) => {
    dispatch(stateMessages.addMessage(message));
  };

  const addMessageHandler = async () => {
    const { chat } = sharedServices;
    const loadedMessages = await chat.loadMessages();
    dispatch(stateMessages.setMessages(loadedMessages));
    chat.setMessageHandler(incomingMessageHandler);
  };

  const onDisconnectHandler = async () => {
    sharedServices.chat.clearMessageHandler();
    dispatch(stateMessages.clearMessages());
  };

  const onConnectionStatusChange = () => {
    const { chat } = sharedServices;
    switch (uiState.connectionStatus) {
      case ConnectionStatus.JoinedChannel:
        if (!chat.hasMessageHandler()) {
          addMessageHandler();
        }
        break;
      case ConnectionStatus.Disconnected:
        onDisconnectHandler();
        break;
    }
  };

  useEffect(onConnectionStatusChange, [uiState]);
  useEffect(() => {
    if (lastElementRef && lastElementRef.current) {
      lastElementRef.current.scrollIntoView();
    }
  }, [messages]);

  return (
    <LayoutRow>
      <LayoutColumn>
        {messages.messages.map((m: Message, i: number) => (
          <LayoutRow key={i}>
            <LayoutColumn size={11} align={i % 2 == 0 ? 'left' : 'right'}>
              {i === messages.messages.length - 1 ? (
                <span ref={lastElementRef}>
                  <ChannelMessage message={m} />
                </span>
              ) : (
                <ChannelMessage message={m} />
              )}
            </LayoutColumn>
          </LayoutRow>
        ))}
      </LayoutColumn>
    </LayoutRow>
  );
}
