import React, { useEffect } from 'react';
import * as ReactDOM from 'react-dom';
import { AppTitleBar } from './components/appTitleBar';
import { LayoutRow } from './components/atoms/layoutRow';
import { LayoutColumn } from './components/atoms/layoutColumn';
import { ChannelSettings } from './components/channelSettings';
import { ChannelMessages } from './components/channelMessages';
import { Button } from './components/atoms/button';
import { Provider } from 'react-redux';
import { store, initializeStore } from './store/store';
import { generateRandomId } from './services/ids';

import { SharedServices, SharedServicesContext } from './appcontext';
import { useAppDispatch, useAppSelector } from './store/hooks';
import * as stateUi from './store/slices/uiState';
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

    useEffect(() => { initializeStore(firstTimeStoreInitFn); }, []);
    useEffect(() => { sharedServices.chat = new ChatService(appState.apiKey); }, [appState]);

    useEffect(() => {
        if (uiState.isConnected && !sharedServices.chat.isConnected) {
            const chatUserId = createChatId(appState.installationId, uiState.selectedNickname);
            sharedServices.chat
                .connect(chatUserId, uiState.selectedNickname)
                .then(() => {
                    return sharedServices.chat.joinChannel(uiState.selectedChannelUrl);
                })
                .then(() => {
                    console.log("Joined successfully");
                    dispatch(stateUi.setInChannel(true));
                })
                .catch(e => {
                    console.error('Connection failed', e);
                });
        } else if (!uiState.isConnected && sharedServices.chat.isConnected) {
            console.log("Should disconnect");
            sharedServices.chat
                .disconnect()
                .then(() => {
                    console.log('Disconnected successfully');
                })
                .catch(e => {
                    console.error('Disconnection failed', e);
                });
        }
    }, [uiState]);

    return (
        <SharedServicesContext.Provider value={sharedServices}>
            <div className="app">
                <div className="header-area">
                    <AppTitleBar title="Sendbird Chat Client" />
                    <ChannelSettings />
                </div>
                <div className="divider"></div>
                <div className="messages-area">
                    <LayoutRow>
                        <LayoutColumn>
                            <ChannelMessages />
                        </LayoutColumn>
                    </LayoutRow>
                </div>
                <div className="divider"></div>
                <div className="write-area">
                    <LayoutRow>
                        <LayoutColumn size={10}>
                            <div className="form-group">
                                <textarea
                                    className="form-input"
                                    id="new-message"
                                    placeholder="Textarea"
                                    rows={3}></textarea>
                            </div>
                        </LayoutColumn>
                        <LayoutColumn size={2} extraClasses={['write-actions']}>
                            <Button title="Send" />
                        </LayoutColumn>
                    </LayoutRow>
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
