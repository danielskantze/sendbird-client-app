import * as SendBird from 'sendbird';
import * as Logger from '../util/logger';
import { createSendbirdInstance } from './sendbirdWrapper';

export type MessageHandlerFn = (userId: string, nickname: string, text: string) => void;

type AnyChannelType = SendBird.GroupChannel | SendBird.OpenChannel;
export type AnyMessageType = SendBird.UserMessage | SendBird.AdminMessage | SendBird.FileMessage;

type OnMessageReceivedCallback = (channel: AnyChannelType, message: AnyMessageType) => void;

function isUserMessage(message: AnyMessageType): boolean {
    return (message as SendBird.UserMessage).sender !== undefined;
}

export class ChatService {
    private _chatAppId: string;
    private _chatUrl: string;
    private _nickname: string;
    private _userId: string;
    private _isConnected: boolean;

    private _channelHandler: SendBird.ChannelHandler;
    private _channelHandlerId: string;
    private _user: SendBird.User;
    private _channel: SendBird.OpenChannel;
    private _sendbird: SendBird.SendBirdInstance;

    constructor(chatAppId: string) {
        const config = { appId: chatAppId, localCacheEnabled: false };
        this._chatAppId = chatAppId;
        this._sendbird = createSendbirdInstance(config) as SendBird.SendBirdInstance;
    }
    get userId() {
        return this._userId;
    }
    get nickname() {
        return this._nickname;
    }
    get channel() {
        return this._channel;
    }
    get user() {
        return this._user;
    }
    get isConnected() {
        return this._isConnected;
    }
    get chatUrl() {
        return this._chatUrl;
    }
    get chatAppId() {
        return this._chatAppId;
    }
    canSend() {
        return this.isConnected && this._channel;
    }
    connect(userId: string, nickname: string) {
        this._userId = userId;
        this._nickname = nickname;
        return new Promise<void>((resolve, reject) => {
            this._sendbird.connect(this.userId, (user, error) => {
                if (error) {
                    reject(error);
                } else {
                    this._user = user;
                    this._isConnected = true;
                    Logger.main.debug('Connected', user);

                    this._sendbird.updateCurrentUserInfo(nickname, '', function (response, error) {
                        if (error) {
                            reject(error);
                            return;
                        }
                        Logger.main.debug('Profile updated');
                        resolve();
                    });
                }
            });
        });
    }
    joinChannel(url: string) {
        this._chatUrl = url;
        return new Promise<void>((resolve, reject) => {
            if (!this._sendbird || !this.isConnected) {
                reject(new Error('Not connected'));
                return;
            }
            this._sendbird.OpenChannel.getChannel(url, (channel, error) => {
                if (error) {
                    reject(error);
                    return;
                }
                channel.enter((response, error) => {
                    if (error) {
                        reject(error);
                        return;
                    }
                    this._channel = channel;
                    resolve();
                });
            });
        });
    }
    async loadMessages():Promise<Array<AnyMessageType>> {
        const listQuery = this._channel.createPreviousMessageListQuery();
        listQuery.limit = 30;
        listQuery.reverse = false;
        return new Promise((resolve, reject) => {
            console.log("Should load");
            listQuery.load(function (messageList, error) {
                console.log("Loaded", messageList, error);
                if (error) {
                    reject(error);
                } else {
                    resolve(messageList);
                }
            });    
        });
    }
    sendMessage(message: string) {
        return new Promise<void>((resolve, reject) => {
            if (!this.isConnected || !this._channel) {
                reject(Error('Not connected'));
                return;
            }
            const params = new this._sendbird.UserMessageParams();
            params.message = message;
            this._channel.sendUserMessage(params, function (msg, error) {
                if (error) {
                    reject(error);
                    return;
                }
                resolve();
            });
        });
    }
    hasMessageHandler(): boolean {
        return !!this._channelHandlerId;
    }
    setMessageHandler(handlerFn: MessageHandlerFn) {
        if (!this.isConnected || !this._channel) {
            return;
        }
        if (this._channelHandler && this._channelHandlerId) {
            this.clearMessageHandler();
        }
        this._channelHandler = new this._sendbird.ChannelHandler();
        this._channelHandlerId = 'id_' + Date.now() + Math.floor(Math.random() * 100000);
        const onMessageReceived: OnMessageReceivedCallback = (channel, message) => {
            if (isUserMessage(message)) {
                const userMessage = message as SendBird.UserMessage;
                handlerFn(userMessage.sender.userId, userMessage.sender.nickname, userMessage.message);
            }
        };
        this._channelHandler.onMessageReceived = onMessageReceived;
        this._sendbird.addChannelHandler(this._channelHandlerId, this._channelHandler);
    }
    clearMessageHandler() {
        if (!this.isConnected || !this._channel) {
            return;
        }
        if (this._channelHandler && this._channelHandlerId) {
            this._sendbird.removeChannelHandler(this._channelHandlerId);
        }
        this._channelHandler = null;
        this._channelHandlerId = null;
    }
    disconnect() {
        if (!this.isConnected) {
            return Promise.resolve();
        }
        this.clearMessageHandler();
        return new Promise<void>((resolve, reject) => {
            this._sendbird.disconnect(() => {
                this._isConnected = false;
                this._user = null;
                this._channel = null;
                resolve();
            });
        });
    }
}
