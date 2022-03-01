import React, { useEffect } from 'react';
import * as ReactDOM from 'react-dom';
import { AppTitleBar } from './components/appTitle';
import { ChannelSettings } from './components/channelSettings';
import { ChatMessages } from './components/messages';
import { WriteArea } from './components/writeArea';
import { Provider } from 'react-redux';
import { store, initializeStore } from './store/store';
import { generateRandomId } from './services/ids';

import { SharedServices, SharedServicesContext } from './appcontext';
import { useAppDispatch, useAppSelector } from './store/hooks';
import * as stateUi from './store/slices/uiState';
import { ConnectionStatus } from './store/slices/uiState';
import * as stateApp from './store/slices/appSettings';
import { ChatService, createChatUserId } from './services/chat';
import * as flashMessages from './store/flashMessages';
import { FlashMessage } from './components/atoms/flashMessage';

type NotConnectedPlaceholderProps = {
  hasApplicationId: boolean;
  hasChannel: boolean;
  hasNickname: boolean;
};

function NotConnectedPlaceholder(props: NotConnectedPlaceholderProps) {
  let instructions = '';
  if (!props.hasApplicationId) {
    instructions = 'Missing Sendbird application ID. Press App settings to set one up.';
  } else if (!props.hasChannel) {
    instructions = 'Missing channel. Please refresh your channels and pick one. ';
  } else if (!props.hasNickname) {
    instructions = 'Missing nickname. Please add a nickname and select one. ';
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

function firstTimeStoreInitFn(slice: string, config: object) {
  if (slice === 'app' && !('installationId' in config)) {
    return generateRandomId(8).then((randomId: string) => {
      return Object.assign(config, { installationId: randomId });
    });
  } else {
    return Promise.resolve(config);
  }
}

const sharedServices: SharedServices = {
  chat: new ChatService(null),
};

function App() {
  const dispatch = useAppDispatch();
  const appState: stateApp.AppSettings = useAppSelector(stateApp.selector);
  const uiState: stateUi.UIState = useAppSelector(stateUi.selector);

  const chatConnect = async () => {
    const { chat } = sharedServices;
    const chatUserId = createChatUserId(appState.installationId, uiState.selectedNickname);
    try {
      await chat.connect(chatUserId, uiState.selectedNickname);
      dispatch(stateUi.setConnected());
      await chat.joinChannel(uiState.selectedChannelUrl);
      dispatch(stateUi.setJoinedChannel());
    } catch (e) {
      dispatch(
        stateUi.addFlashMessage(
          flashMessages.createError(
            'Unable to connect - make sure you are online and that your appKey is correct',
            'connect'
          )
        )
      );
      dispatch(stateUi.setDisconnected());
    }
  };

  const chatDisconnect = async () => {
    const { chat } = sharedServices;
    try {
      await chat.disconnect();
      dispatch(stateUi.setDisconnected());
    } catch (e) {
      dispatch(stateUi.addFlashMessage(flashMessages.fromError(e)));
    }
  };

  const onConnectionStatusChange: React.EffectCallback = () => {
    const { chat } = sharedServices;
    const { connectionStatus } = uiState;
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
    console.log(uiState);
  };

  const onAppstateChange: React.EffectCallback = () => {
    sharedServices.chat = new ChatService(appState.applicationId);
  };

  const onAckError = (id: string) => {
    dispatch(stateUi.clearFlashMessage(id));
  };

  useEffect(() => {
    initializeStore(firstTimeStoreInitFn).catch(e => {
      dispatch(stateUi.addFlashMessage(flashMessages.fromError(e)));
    });
  }, []);
  useEffect(onAppstateChange, [appState]);
  useEffect(onConnectionStatusChange, [uiState]);

  return (
    <SharedServicesContext.Provider value={sharedServices}>
      <div className="app">
        <div className="flash-messages">
          {uiState.errors.map(e => (
            <FlashMessage key={e.id} id={e.id} type="error" message={e.message} onClear={onAckError} />
          ))}
        </div>
        <div className="header-area">
          <AppTitleBar title="Sendbird Chat Client" />
          <ChannelSettings />
        </div>
        <div className="divider no-bottom-margin"></div>
        <div className="messages-area">
          {uiState.connectionStatus === ConnectionStatus.JoinedChannel ? (
            <ChatMessages />
          ) : (
            <NotConnectedPlaceholder
              hasApplicationId={appState.applicationId?.length > 0}
              hasChannel={uiState.selectedChannelUrl?.length > 0}
              hasNickname={uiState.selectedNickname?.length > 0}
            />
          )}
        </div>
        <div className="divider no-top-margin"></div>
        <div className="write-area">
          <WriteArea />
        </div>
      </div>
    </SharedServicesContext.Provider>
  );
}

function render() {
  ReactDOM.render(
    <Provider store={store}>
      <App />
    </Provider>,
    document.getElementById('root')
  );
}

render();
