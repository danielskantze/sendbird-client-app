import React, { useContext, useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { SharedServices, SharedServicesContext } from '../appcontext';
import { LayoutColumn } from './atoms/layoutColumn';
import { LayoutRow } from './atoms/layoutRow';
import * as stateUi from '../store/slices/uiState';
import * as stateMessages from '../store/slices/messages';
import { Message, PreviousListQuery, MessageEventType } from '../services/chat';
import { ConnectionStatus } from '../store/slices/uiState';
import { Button } from './atoms/button';
import * as flashMessages from '../store/flashMessages';

enum Action {
  None,
  LoadMore,
}

type MessageMenuItem = {
  id: string;
  title: string;
};

type MessageMenuItemsProps = {
  items: Array<MessageMenuItem>;
  onItemClick: (item: MessageMenuItem) => void;
};

function MessagePopover(props: MessageMenuItemsProps) {
  function createClickFn(item: MessageMenuItem) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (e: any) => {
      e.preventDefault();
      e.stopPropagation();
      props.onItemClick(item);
    };
  }

  return (
    <div className="popover popover-right message-menu">
      <div className="menu-button text text-primary">⋯</div>
      <div className="popover-container">
        <div className="card">
          <div className="card-body">
            {props.items.map(i => (
              <div key={i.id} className="item" onClick={createClickFn(i)}>
                {i.title}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

type MessageProps = {
  message: Message;
  hasMenu?: boolean;
  onDeleteItem?: (messageId: number) => void;
};

function ChatMessage(props: MessageProps) {
  let menu: JSX.Element = null;

  if (props.hasMenu) {
    const onMenuItemClick = (menuItem: MessageMenuItem) => {
      console.log('Clicked item', menuItem.id);
      if (menuItem.id === 'delete') {
        console.assert(props.onDeleteItem, 'Missing onDeleteItem, this is an error');
        if (props.onDeleteItem) {
          props.onDeleteItem(props.message.id);
        }
      }
    };
    menu = <MessagePopover items={[{ id: 'delete', title: 'Delete' }]} onItemClick={onMenuItemClick} />;
  }

  return (
    <div className="card chat-message" data-sender-id={props.message.senderId}>
      <div className="card-header">
        <div className="tile-title">{props.message.nickname}</div>
        <div className="menu-button-container">{menu}</div>
      </div>
      <div className="card-body">
        <p>{props.message.message}</p>
      </div>
    </div>
  );
}

type PreviousListQueryWrapper = {
  query?: PreviousListQuery;
};

let currentAction = Action.None;

export function ChatMessages() {
  const uiState = useAppSelector(stateUi.selector);
  const messages = useAppSelector(stateMessages.selector);
  const sharedServices = useContext(SharedServicesContext) as SharedServices;
  const dispatch = useAppDispatch();
  const lastElementRef = useRef(null);
  const firstElementRef = useRef(null);
  const emptyQuery: PreviousListQueryWrapper = { query: null };
  const [previousListQuery, setPreviousListQuery] = useState(emptyQuery);
  const [operatorIds, setOperatorIds] = useState(new Set<string>());

  const incomingMessageHandler = (type: MessageEventType, messageId: number, message: Message) => {
    switch (type) {
      case MessageEventType.Added:
        dispatch(stateMessages.addMessage(message));
        break;
      case MessageEventType.Updated:
        dispatch(stateMessages.updateMessage(message));
        break;
      case MessageEventType.Deleted:
        dispatch(stateMessages.deleteMessage(messageId));
        break;
    }
  };

  const addMessageHandler = async () => {
    const { chat } = sharedServices;
    try {
      const query = chat.createPreviousListQuery();
      setPreviousListQuery({ query });
      const loadedMessages = (await chat.loadPreviousMessages(query)) as Array<Message>;
      setOperatorIds(chat.operatorIds);
      dispatch(stateMessages.setMessages(loadedMessages));
      chat.setMessageHandler(incomingMessageHandler);
    } catch (e) {
      dispatch(stateUi.addFlashMessage(flashMessages.fromError(e, 'load-messages-error')));
    }
  };

  const onDisconnectHandler = async () => {
    try {
      sharedServices.chat.clearMessageHandler();
      setPreviousListQuery(emptyQuery);
      setOperatorIds(new Set<string>());
      dispatch(stateMessages.clearMessages());
    } catch (e) {
      dispatch(stateUi.addFlashMessage(flashMessages.fromError(e, 'clear-message-handler-error')));
    }
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

  const onDeleteItem = (messageId: number) => {
    const { chat } = sharedServices;
    chat.deleteMessageWithId(messageId).catch(e => {
      dispatch(stateUi.addFlashMessage(flashMessages.fromError(e)));
    });
  };

  const onLoadMore = () => {
    const { chat } = sharedServices;
    const { query } = previousListQuery;
    currentAction = Action.LoadMore;
    chat
      .loadPreviousMessages(query)
      .then((loadedMessages: Array<Message>) => {
        dispatch(stateMessages.addMessages(loadedMessages));
      })
      .catch(e => {
        dispatch(stateUi.addFlashMessage(flashMessages.fromError(e, 'load-more-messages-error')));
      });
  };

  useEffect(onConnectionStatusChange, [uiState]);
  useEffect(() => {
    if (currentAction === Action.LoadMore) {
      if (firstElementRef && firstElementRef.current) {
        firstElementRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      if (lastElementRef && lastElementRef.current) {
        lastElementRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
    currentAction = Action.None;
  }, [messages]);

  const loadMoreButton =
    messages.messages.length > 0 ? (
      <LayoutRow key={'load-more'}>
        <LayoutColumn extraClasses={['center']}>
          <span ref={firstElementRef}>
            <Button title="Load more" extraClasses={['load-more-button', 'btn-sm']} onClick={onLoadMore} />
          </span>
        </LayoutColumn>
      </LayoutRow>
    ) : (
      ''
    );

  return (
    <LayoutRow>
      <LayoutColumn>
        {loadMoreButton}
        {messages.messages.map((m: Message, i: number) => (
          <LayoutRow key={i}>
            <LayoutColumn size={11} align={operatorIds.has(m.senderId) ? 'right' : 'left'}>
              {i === messages.messages.length - 1 ? (
                <span ref={lastElementRef}>
                  <ChatMessage message={m} />
                </span>
              ) : (
                <ChatMessage
                  message={m}
                  hasMenu={sharedServices.chat.userId === m.senderId}
                  onDeleteItem={sharedServices.chat.userId === m.senderId ? onDeleteItem : null}
                />
              )}
            </LayoutColumn>
          </LayoutRow>
        ))}
      </LayoutColumn>
    </LayoutRow>
  );
}
