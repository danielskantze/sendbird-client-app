/* eslint-disable import/no-named-as-default */
import React, { useContext, useEffect } from 'react';
import * as ReactDOM from 'react-dom';
import AppTitleBar from './components/AppTitleBar';
import ChannelSettings from './components/ChannelSettings';
import ChatMessages from './components/ChatMessages';
import WriteArea from './components/WriteArea';

import { SharedServices, SharedServicesContext } from './appcontext';
import { ChatService } from './services/chat';
import * as flashMessages from './store/flashMessages';
import FlashMessage from './components/atoms/FlashMessage';
import { SettingsContext, SettingsProvider } from './store/contexts/app';
import { ConnectionStatus, UIContext, UIContextProvider } from './store/contexts/ui';
import { UsersContext, UsersContextProvider } from './store/contexts/users';
import { MessagesContextProvider } from './store/contexts/messages';
import { ChannelsContextProvider } from './store/contexts/channels';

type NotConnectedPlaceholderProps = {
  hasApplicationId: boolean;
  hasChannel: boolean;
  hasUser: boolean;
};

function NotConnectedPlaceholder(props: NotConnectedPlaceholderProps) {
  let instructions = '';
  if (!props.hasApplicationId) {
    instructions = 'Missing Sendbird application ID. Press App settings to set one up.';
  } else if (!props.hasChannel) {
    instructions = 'Missing channel. Please refresh your channels and pick one. ';
  } else if (!props.hasUser) {
    instructions = 'Missing user. Please add a user and select one. ';
  } else {
    instructions = 'Hit Connect to start.';
  }
  return (
    <div className="empty not-connected-placeholder">
      <p className="empty-title h5">You are not connected</p>
      <p className="empty-subtitle">{instructions}</p>
    </div>
  );
}

const sharedServices: SharedServices = {
  chat: new ChatService(null, null),
};

function App() {
  const { applicationId, installationId } = useContext(SettingsContext);
  const {
    selectedUserId,
    selectedChannelUrl,
    connectionStatus,
    errors,
    setConnected,
    setJoinedChannel,
    setDisconnected,
    setOperatorIds,
    addFlashMessage,
    clearFlashMessage,
  } = useContext(UIContext);
  const { getUserData } = useContext(UsersContext);

  const chatConnect = async () => {
    const { chat } = sharedServices;
    const chatUserId = selectedUserId;
    const userData = getUserData(chatUserId);
    try {
      await chat.connect(chatUserId, userData.name, userData.token);
      setConnected();
      await chat.joinChannel(selectedChannelUrl);
      setOperatorIds(Array.from(chat.operatorIds));
      setJoinedChannel();
    } catch (e) {
      console.error(e);
      addFlashMessage(
        flashMessages.createError(
          'Unable to connect - make sure you are online and that your appKey is correct',
          'connect'
        )
      );
      setOperatorIds([]);
      setDisconnected();
    }
  };

  const chatDisconnect = async () => {
    const { chat } = sharedServices;
    try {
      await chat.disconnect();
      setOperatorIds([]);
      setDisconnected();
    } catch (e) {
      addFlashMessage(flashMessages.fromError(e));
    }
  };

  const onConnectionStatusChange: React.EffectCallback = () => {
    const { chat } = sharedServices;
    switch (connectionStatus) {
      case ConnectionStatus.Connected:
        if (!chat.isConnected) {
          chatConnect();
        }
        break;
      case ConnectionStatus.Disconnected:
        if (chat.isConnected) {
          chatDisconnect();
        }
        break;
    }
  };

  const onAppstateChange: React.EffectCallback = () => {
    sharedServices.chat = new ChatService(applicationId, installationId);
  };

  const onAckError = (id: string) => {
    clearFlashMessage(id);
  };

  useEffect(onAppstateChange, [applicationId, installationId]);
  useEffect(onConnectionStatusChange, [connectionStatus]);

  return (
    <SharedServicesContext.Provider value={sharedServices}>
      <div className="app">
        <div className="flash-messages">
          {errors.map(e => (
            <FlashMessage key={e.id} id={e.id} type="error" message={e.message} onClear={onAckError} />
          ))}
        </div>
        <div className="header-area">
          <AppTitleBar title="Sendbird Chat Client" />
          <ChannelSettings />
        </div>
        <MessagesContextProvider>
          <div className="divider no-bottom-margin"></div>
          <div className="messages-area">
            {connectionStatus === ConnectionStatus.JoinedChannel ? (
              <ChatMessages />
            ) : (
              <NotConnectedPlaceholder
                hasApplicationId={applicationId?.length > 0}
                hasChannel={selectedChannelUrl?.length > 0}
                hasUser={selectedUserId?.length > 0}
              />
            )}
          </div>
          <div className="divider no-top-margin"></div>
          <div className="write-area">
            <WriteArea />
          </div>
        </MessagesContextProvider>
      </div>
    </SharedServicesContext.Provider>
  );
}

function StatefulApp() {
  return (
    <SettingsProvider>
      <UIContextProvider>
        <ChannelsContextProvider>
          <UsersContextProvider>
            <App />
          </UsersContextProvider>
        </ChannelsContextProvider>
      </UIContextProvider>
    </SettingsProvider>
  );
}

function render() {
  ReactDOM.render(<StatefulApp />, document.getElementById('root'));
}

render();
