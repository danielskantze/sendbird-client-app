import React, { useContext, useEffect, useRef, useState } from 'react';
import { SharedServices, SharedServicesContext } from '../appcontext';
import { ConnectionStatus, UIContext } from '../store/contexts/ui';
import { Message, PreviousListQuery, MessageEventType } from '../services/chat';
import * as flashMessages from '../store/flashMessages';

import LayoutColumn from './atoms/LayoutColumn';
import LayoutRow from './atoms/LayoutRow';
import Button from './atoms/Button';
import ContextMenu, { ContextMenuItem, MenuAlign } from './atoms/ContextMenu';
import ConfirmAction from './modals/ConfirmAction';
import { MessagesContext } from '../store/contexts/messages';

enum Action {
  None,
  LoadMore,
}

type EditChatMessageProps = {
  extraClasses: Array<string>;
  message: Message;
  onCancel: () => void;
  onSave: (messageId: number, text: string) => void;
};

function EditChatMessage(props: EditChatMessageProps) {
  const [inputText, setInputText] = useState(props.message.message);

  const onSave = () => {
    console.log('onSave', props.message.id, inputText);
    props.onSave(props.message.id, inputText);
  };

  const onChange = (e: React.FormEvent<HTMLTextAreaElement>) => {
    setInputText(e.currentTarget.value);
  };

  return (
    <div>
      <div className={['card', ...props.extraClasses].join(' ')}>
        <div className="card-body">
          <div className="form-group">
            <textarea className="form-input" id="new-message" rows={3} onChange={onChange} value={inputText}></textarea>
          </div>
        </div>
      </div>
      <div className="actions float-right">
        <Button title={'Cancel'} extraClasses={['btn-sm', 'mx-2']} onClick={props.onCancel}></Button>
        <Button title={'Save'} extraClasses={['btn-sm']} onClick={onSave}></Button>
      </div>
    </div>
  );
}

type MessageProps = {
  message: Message;
  isOwner?: boolean;
  isOperator?: boolean;
  onDeleteItem?: (messageId: number) => void;
  onUpdateItem?: (messageId: number, text: string) => void;
};

function ChatMessage(props: MessageProps) {
  let menu: JSX.Element = null;
  const extraClasses: Array<string> = [];
  const [isEditing, setIsEditing] = useState(false);

  function formatDate(epoch: number) {
    const date = new Date(epoch);
    const dateStr = JSON.stringify(date).split('T')[0].substring(1);
    const timeStr = date.toLocaleTimeString();
    return dateStr + ' ' + timeStr;
  }

  const hasMenu = props.onDeleteItem || props.onUpdateItem;

  const onEditCancel = () => {
    setIsEditing(false);
  };

  const onEditSave = (messageId: number, text: string) => {
    setIsEditing(false);
    props.onUpdateItem(messageId, text);
  };

  if (hasMenu) {
    const onMenuItemClick = (menuItem: ContextMenuItem) => {
      console.log('Clicked item', menuItem.id);
      switch (menuItem.id) {
        case 'delete':
          setIsEditing(false);
          console.assert(props.onDeleteItem, 'Missing onDeleteItem, this is an error');
          if (props.onDeleteItem) {
            props.onDeleteItem(props.message.id);
          }
          break;
        case 'edit':
          setIsEditing(true);
          break;
      }
    };
    const menuItems = [];
    if (props.onUpdateItem) {
      menuItems.push({ id: 'edit', title: 'Edit' });
    }
    if (props.onDeleteItem) {
      menuItems.push({ id: 'delete', title: 'Delete', danger: true });
    }
    menu = <ContextMenu items={menuItems} onItem={onMenuItemClick} align={MenuAlign.Right} />;
  }

  if (props.isOwner) {
    extraClasses.push('owner');
  }

  if (props.isOperator) {
    extraClasses.push('operator');
  }

  return (
    <div className="chat-message">
      <div className="header">
        <div className="left">
          <span className="text-tiny">{formatDate(props.message.createdAt)}</span>
          <span className="nickname">{props.message.nickname}</span>
        </div>
        {menu}
      </div>
      {isEditing ? (
        <EditChatMessage
          extraClasses={extraClasses}
          onCancel={onEditCancel}
          onSave={onEditSave}
          message={props.message}
        />
      ) : (
        <div className={['card', ...extraClasses].join(' ')}>
          <div className="card-body">
            <p>{props.message.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}

type PreviousListQueryWrapper = {
  query?: PreviousListQuery;
};

let currentAction = Action.None;

export default function ChatMessages() {
  const { connectionStatus, operatorIds, addFlashMessage } = useContext(UIContext);
  const { messages, addMessage, updateMessage, deleteMessage, setMessages, clearMessages, addMessages } = useContext(MessagesContext);
  const sharedServices = useContext(SharedServicesContext) as SharedServices;
  const { chat } = sharedServices;
  const lastElementRef = useRef(null);
  const firstElementRef = useRef(null);
  const emptyQuery: PreviousListQueryWrapper = { query: null };
  const [previousListQuery, setPreviousListQuery] = useState(emptyQuery);
  const [deleteMessageId, setDeleteMessageId] = useState(null);
  let confirmDeleteModal: JSX.Element = null;
  const operatorLookup = new Set(operatorIds);
  console.log({messages});

  function incomingMessageHandler(type: MessageEventType, messageId: number, message: Message) {
    console.log(type, messageId, message);
    switch (type) {
      case MessageEventType.Added:
        addMessage(message);
        break;
      case MessageEventType.Updated:
        updateMessage(message);
        break;
      case MessageEventType.Deleted:
        deleteMessage(messageId);
        break;
    }
  }

  const addMessageHandler = async () => {
    try {
      const query = chat.createPreviousListQuery();
      setPreviousListQuery({ query });
      const loadedMessages = (await chat.loadPreviousMessages(query)) as Array<Message>;
      setMessages(loadedMessages);
      chat.setMessageHandler(incomingMessageHandler);
    } catch (e) {
      addFlashMessage(flashMessages.fromError(e, 'load-messages-error'));
    }
  };

  const onDisconnectHandler = async () => {
    try {
      chat.clearMessageHandler();
      setPreviousListQuery(emptyQuery);
      clearMessages();
    } catch (e) {
      addFlashMessage(flashMessages.fromError(e, 'clear-message-handler-error'));
    }
  };

  const onConnectionStatusChange = () => {
    const { chat } = sharedServices;
    switch (connectionStatus) {
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
      addFlashMessage(flashMessages.fromError(e));
    });
  };

  const onUpdateItem = (messageId: number, text: string) => {
    const { chat } = sharedServices;
    chat
      .updateUserMessageWithId(messageId, text)
      .then((message: Message) => {
        updateMessage(message);
      })
      .catch(e => {
        addFlashMessage(flashMessages.fromError(e));
      });
  };

  const onLoadMore = () => {
    const { chat } = sharedServices;
    const { query } = previousListQuery;
    currentAction = Action.LoadMore;
    chat
      .loadPreviousMessages(query)
      .then((loadedMessages: Array<Message>) => {
        addMessages(loadedMessages);
      })
      .catch(e => {
        addFlashMessage(flashMessages.fromError(e, 'load-more-messages-error'));
      });
  };

  const canEdit = (m: Message) => {
    return chat.userId === m.senderId;
  };

  const canDelete = (m: Message) => {
    return chat.userId === m.senderId || operatorLookup.has(chat.userId);
  };

  useEffect(onConnectionStatusChange, [connectionStatus]);
  
  // TODO: Refactor this mess. Move integration with chat service to store
  useEffect(() => { chat.setMessageHandler(incomingMessageHandler); }, [messages]);
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
    messages.length > 0 ? (
      <LayoutRow key={'load-more'}>
        <LayoutColumn extraClasses={['center', 'load-more']}>
          <span ref={firstElementRef}>
            <Button title="Load more" extraClasses={['load-more-button', 'btn-sm']} onClick={onLoadMore} />
          </span>
        </LayoutColumn>
      </LayoutRow>
    ) : (
      ''
    );

  if (deleteMessageId !== null) {
    confirmDeleteModal = (
      <ConfirmAction
        title={'Delete message?'}
        body={'The message will be deleted. This cannot be undone. '}
        onClose={() => {
          setDeleteMessageId(null);
        }}
        onConfirm={() => {
          onDeleteItem(deleteMessageId);
          setDeleteMessageId(null);
        }}
      />
    );
  }

  return (
    <LayoutRow>
      <LayoutColumn>
        {loadMoreButton}
        {messages.map((m: Message, i: number) => (
          <LayoutRow key={i}>
            <LayoutColumn size={11} align={operatorLookup.has(m.senderId) ? 'right' : 'left'}>
              <span ref={i === messages.length - 1 ? lastElementRef : null}>
                <ChatMessage
                  message={m}
                  isOwner={chat.userId === m.senderId}
                  isOperator={operatorLookup.has(m.senderId)}
                  onDeleteItem={canDelete(m) ? setDeleteMessageId : null}
                  onUpdateItem={canEdit(m) ? onUpdateItem : null}
                />
              </span>
            </LayoutColumn>
          </LayoutRow>
        ))}
        {confirmDeleteModal}
      </LayoutColumn>
    </LayoutRow>
  );
}
