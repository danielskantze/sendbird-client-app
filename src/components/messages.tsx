import React, { useContext, useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { SharedServices, SharedServicesContext } from '../appcontext';
import { LayoutColumn } from './atoms/layoutColumn';
import { LayoutRow } from './atoms/layoutRow';
import * as stateUi from '../store/slices/uiState';
import * as stateMessages from '../store/slices/messages';
import { LoadMoreMessagesFn, Message, PreviousListQuery } from '../services/chat';
import { ConnectionStatus } from '../store/slices/uiState';
import { Button } from './atoms/button';

enum Action {
  None,
  LoadMore
}

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

type PreviousListQueryWrapper = {
  query?: PreviousListQuery
}

export function ChannelMessages() {
  const uiState = useAppSelector(stateUi.selector);
  const messages = useAppSelector(stateMessages.selector);
  const sharedServices = useContext(SharedServicesContext) as SharedServices;
  const dispatch = useAppDispatch();
  const lastElementRef = useRef(null);
  const [currentAction, setCurrentAction] = useState(Action.None);
  const emptyQuery:PreviousListQueryWrapper = {query: null};
  const [previousListQuery, setPreviousListQuery] = useState(emptyQuery);
  

  const incomingMessageHandler = (message: Message) => {
    dispatch(stateMessages.addMessage(message));
  };

  const addMessageHandler = async () => {
    const { chat } = sharedServices;
    const query = chat.createPreviousListQuery();
    setPreviousListQuery({query});
    const loadedMessages = (await chat.loadPreviousMessages(query)) as Array<Message>;
    dispatch(stateMessages.setMessages(loadedMessages));
    chat.setMessageHandler(incomingMessageHandler);
  };

  const onDisconnectHandler = async () => {
    sharedServices.chat.clearMessageHandler();
    setPreviousListQuery(emptyQuery);
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

  const onLoadMore = () => {
    const { chat } = sharedServices;
    const { query } = previousListQuery;
    chat.loadPreviousMessages(query)
      .then((loadedMessages:Array<Message>) => {
        dispatch(stateMessages.addMessages(loadedMessages));
      });
  };

  useEffect(onConnectionStatusChange, [uiState]);
  useEffect(() => {
    if (lastElementRef && lastElementRef.current) {
      lastElementRef.current.scrollIntoView();
    }
  }, [messages]);

  const loadMoreButton = messages.messages.length > 0 ? 
    (<LayoutRow key={'load-more'}>
      <LayoutColumn extraClasses={['center']}>
        <Button title="Load more" extraClasses={['load-more-button']} onClick={onLoadMore} />
      </LayoutColumn>
    </LayoutRow>) : 
    ('');

  return (
    <LayoutRow>
      <LayoutColumn>
        {loadMoreButton}
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
