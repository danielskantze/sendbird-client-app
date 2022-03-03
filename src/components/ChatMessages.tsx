import React, { useContext, useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { SharedServices, SharedServicesContext } from '../appcontext';
import LayoutColumn from './atoms/LayoutColumn';
import LayoutRow from './atoms/LayoutRow';
import * as stateUi from '../store/slices/uiState';
import * as stateMessages from '../store/slices/messages';
import { Message, PreviousListQuery, MessageEventType } from '../services/chat';
import { ConnectionStatus } from '../store/slices/uiState';
import Button from './atoms/Button';
import * as flashMessages from '../store/flashMessages';
import MoreIcon from './icons/MoreIcon';
import { cssCl } from '../util/styling';

enum Action {
  None,
  LoadMore,
}

type MessageMenuItem = {
  id: string;
  title: string;
  danger?: boolean;
};

type MessageMenuItemsProps = {
  isVisible: boolean,
  items: Array<MessageMenuItem>;
  onItem: (item: MessageMenuItem) => void;
  onTrigger: () => void;
};

function MessagePopover(props: MessageMenuItemsProps) {
  function createClickFn(item: MessageMenuItem) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (e: any) => {
      e.preventDefault();
      e.stopPropagation();
      props.onItem(item);
    };
  }
  function onTrigger(e:React.MouseEvent<HTMLAnchorElement, MouseEvent>) {
    console.log("onTrigger");
    e.preventDefault();
    e.stopPropagation();
    props.onTrigger();
  }

  console.log("PROPS.isVisible", props.isVisible);

  return (
    <div className={cssCl("message-menu", [props.isVisible, "visible"])}>
      <div className="menu-button text text-primary">
        <a href="#" onClick={onTrigger}>
          <MoreIcon />
        </a>
      </div>
        <div className="card">
          <ul className="card-body menu">
            {props.items.map(i => (
              <li key={i.id} className={cssCl("item menu-item text-dark", [!!i.danger, "text-error"])}>
                <a href="#" onClick={createClickFn(i)}>{i.title}</a>
              </li>
            ))}
          </ul>
      </div>
    </div>
  );
}

type EditChatMessageProps = {
  extraClasses: Array<string>,
  message: Message,
  onCancel: () => void,
  onSave:(messageId:number, text:string) => void,
};

function EditChatMessage(props: EditChatMessageProps) {
  const [inputText, setInputText] = useState(props.message.message);
    
  const onSave = () => {
    console.log("onSave", props.message.id, inputText);
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
            <textarea
              className="form-input"
              id="new-message"
              rows={3}
              onChange={onChange}
              value={inputText}></textarea>
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
  showMenu: boolean;
  onDeleteItem?: (messageId: number) => void;
  onUpdateItem?: (messageId: number, text:string) => void;
  onClickMenu: (messageId: number) => void;
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

  const onCancelEdit = () => {
    setIsEditing(false);
  }

  const onClickMenuTrigger = () => {
    props.onClickMenu(props.message.id);
  };

  console.log("MESSAGE", props.message.id, props.showMenu);

  if (hasMenu) {
    const onMenuItemClick = (menuItem: MessageMenuItem) => {
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
    menu = <MessagePopover items={menuItems} onItem={onMenuItemClick} onTrigger={onClickMenuTrigger} isVisible={props.showMenu} />;
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
        <EditChatMessage extraClasses={extraClasses} onCancel={onCancelEdit} onSave={props.onUpdateItem} message={props.message} />
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
  const uiState = useAppSelector(stateUi.selector);
  const messages = useAppSelector(stateMessages.selector);
  const sharedServices = useContext(SharedServicesContext) as SharedServices;
  const { chat } = sharedServices;
  const dispatch = useAppDispatch();
  const lastElementRef = useRef(null);
  const firstElementRef = useRef(null);
  const emptyQuery: PreviousListQueryWrapper = { query: null };
  const [previousListQuery, setPreviousListQuery] = useState(emptyQuery);
  const [operatorIds, setOperatorIds] = useState(new Set<string>());
  const [menuMessageId, setMenuMessageId] = useState(null);

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
      chat.clearMessageHandler();
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

  const onUpdateItem = (messageId: number, text:string) => {
    const { chat } = sharedServices;
    chat.updateUserMessageWithId(messageId, text).catch(e => {
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

  const canEdit = (m:Message) => {
    return chat.userId === m.senderId
  };

  const canDelete = (m:Message) => {
    return chat.userId === m.senderId ||
      chat.operatorIds.has(chat.userId);
  };

  const onShowMenu = (messageId:number) => {
    setMenuMessageId(messageId);
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
        <LayoutColumn extraClasses={['center', 'load-more']}>
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
              <span ref={i === messages.messages.length - 1 ? lastElementRef : null}>
                <ChatMessage
                  message={m}
                  isOwner={chat.userId === m.senderId}
                  isOperator={operatorIds.has(m.senderId)}
                  onDeleteItem={canDelete(m) ? onDeleteItem : null}
                  onUpdateItem={canEdit(m) ? onUpdateItem : null}
                  onClickMenu={onShowMenu}
                  showMenu={m.id === menuMessageId}
                />
              </span>
            </LayoutColumn>
          </LayoutRow>
        ))}
      </LayoutColumn>
    </LayoutRow>
  );
}
