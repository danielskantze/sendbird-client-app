import React, { useEffect } from 'react';
import * as ReactDOM from 'react-dom';
import { AppTitleBar } from './components/appTitle';
import { ChannelSettings } from './components/channelSettings';
import { ChannelMessages } from './components/messages';
import { WriteArea } from './components/writeArea';
import { Provider } from 'react-redux';
import { store, initializeStore } from './store/store';
import { generateRandomId } from './services/ids';

import { SharedServices, SharedServicesContext } from './appcontext';
import { useAppDispatch, useAppSelector } from './store/hooks';
import * as stateUi from './store/slices/uiState';
import { ConnectionStatus } from './store/slices/uiState';
import * as stateApp from './store/slices/appSettings';
import { ChatService } from './services/chat';

function createChatId(appId:string, nickname:string) {
    return `${appId}_${nickname}`;
}

function firstTimeStoreInitFn(slice:string, config:object) {
    if (slice === 'app' && !('installationId' in config)) {
        return generateRandomId(8)
            .then((randomId:string) => {
                return Object.assign(config, { installationId: randomId});
            });
    } else {
        return Promise.resolve(config);
    }
}

const sharedServices:SharedServices = {
    chat: new ChatService(null),
};

function App() {
    const dispatch = useAppDispatch();
    const appState: stateApp.AppSettings = useAppSelector(stateApp.selector);
    const uiState: stateUi.UIState = useAppSelector(stateUi.selector);

    const chatConnect = async () => {
        const { chat } = sharedServices;
        const chatUserId = createChatId(appState.installationId, uiState.selectedNickname);
        await chat.connect(chatUserId, uiState.selectedNickname);
        dispatch(stateUi.setConnected());
        await chat.joinChannel(uiState.selectedChannelUrl);
        dispatch(stateUi.setJoinedChannel());
    };

    const chatDisconnect = async () => {
        const { chat } = sharedServices;
        await chat.disconnect();
        dispatch(stateUi.setDisconnected());
    };

    const onConnectionStatusChange:React.EffectCallback = () => {
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
    };

    const onAppstateChange:React.EffectCallback = () => {
        sharedServices.chat = new ChatService(appState.apiKey);
    };

    useEffect(() => { initializeStore(firstTimeStoreInitFn); }, []);
    useEffect(onAppstateChange, [appState]);
    useEffect(onConnectionStatusChange, [uiState]);

    return (
        <SharedServicesContext.Provider value={sharedServices}>
            <div className="app">
                <div className="header-area">
                    <AppTitleBar title="Sendbird Chat Client" />
                    <ChannelSettings />
                </div>
                <div className="divider"></div>
                <div className="messages-area">
                    <ChannelMessages />
                </div>
                <div className="divider"></div>
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
