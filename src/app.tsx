import React, { useContext, useEffect } from 'react';
import * as ReactDOM from 'react-dom';
import { AppTitleBar } from './components/appTitleBar';
import { LayoutRow } from './components/atoms/layoutRow';
import { LayoutColumn } from './components/atoms/layoutColumn';
import { ChannelSettings } from './components/channelSettings';
import { ChannelMessages } from './components/channelMessages';
import { Button } from './components/atoms/button';
import { Provider } from 'react-redux';
import { store, initializeStore } from './store/store';
import { ChatService } from './services/chat';

import { useAppDispatch, useAppSelector } from './store/hooks';
import * as stateChannels from './store/slices/channelSettings';
import * as stateUi from './store/slices/uiState';
import * as stateApp from './store/slices/appSettings';

const DUMMY_MESSAGES = [
    {
        id: 'a',
        text: 'Hej hej',
        author: 'chatpro',
        time: new Date(),
    },
    {
        id: 'b',
        text: 'Hello',
        author: 'chatnoob',
        time: new Date(),
    },
    {
        id: 'c',
        text: 'Hello',
        author: 'chatnoob',
        time: new Date(),
    },
    {
        id: 'd',
        text: 'Hello',
        author: 'chatnoob',
        time: new Date(),
    },
    {
        id: 'e',
        text: 'Hello',
        author: 'chatnoob',
        time: new Date(),
    },
];

const sharedServices = {
    chat: new ChatService(null),
};

const SharedServicesContext = React.createContext(sharedServices);

function App() {
    const dispatch = useAppDispatch();
    const appState: stateApp.AppSettings = useAppSelector(stateApp.selector);
    const uiState: stateUi.UIState = useAppSelector(stateUi.selector);
    const channelSettings: stateChannels.ChannelSettings = useAppSelector(stateChannels.selector);

    useEffect(() => {
        initializeStore();
    }, []);

    useEffect(() => {
        sharedServices.chat = new ChatService(appState.apiKey);
    }, [appState]);

    useEffect(() => {
        if (uiState.isConnected && !sharedServices.chat.isConnected) {
            sharedServices.chat
                .connect(uiState.selectedChannelUrl, uiState.selectedNickname)
                .then(() => {
                    console.log('Connected successfully');
                })
                .catch(e => {
                    console.error('Connection failed', e);
                });
        } else if (!uiState.isConnected && sharedServices.chat.isConnected) {
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
                            <ChannelMessages messages={DUMMY_MESSAGES} />
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
