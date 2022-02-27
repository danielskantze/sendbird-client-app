import * as SendBird from 'sendbird';
import * as Logger from '../util/logger';
import { createSendbirdInstance } from './sendbirdWrapper';

export enum MessageType {
  User = 1,
  Admin,
  File,
  Unknown,
}

export enum MessageEventType {
  Added,
  Deleted,
  Updated
}

export type Message = {
  id: number;
  createdAt: number;
  message: string;
  nickname: string;
  type: MessageType;
  senderId: string;
};

type AnyChannelType = SendBird.GroupChannel | SendBird.OpenChannel;

export type AnyMessageType = SendBird.UserMessage | SendBird.AdminMessage | SendBird.FileMessage;

export type MessageHandlerFn = (type:MessageEventType, messageId:number, message?: Message) => void;

export type LoadMoreMessagesFn = () => Promise<Array<Message>>;

export type PreviousListQuery = SendBird.PreviousMessageListQuery;

type OnMessageUpdateOrAddCallback = (channel: AnyChannelType, message: AnyMessageType) => void;

type OnMessageDeleteCallback = (channel: AnyChannelType, messageId: number) => void;

function sbMessageToGeneralMessage(sbMessage: AnyMessageType): Message {
  const message: Message = {
    id: sbMessage.messageId,
    createdAt: sbMessage.createdAt,
    message: '',
    nickname: '',
    type: MessageType.Unknown,
    senderId: '',
  };
  if (sbMessage.isUserMessage) {
    const userMessage = sbMessage as SendBird.UserMessage;
    message.message = userMessage.message;
    message.nickname = userMessage.sender.nickname;
    message.type = MessageType.User;
    message.senderId = userMessage.sender.userId;
  } else if (sbMessage.isAdminMessage) {
    const adminMessage = sbMessage as SendBird.AdminMessage;
    message.message = adminMessage.message;
    message.type = MessageType.Admin;
    message.senderId = '';
  } else if (sbMessage.isFileMessage) {
    const fileMessage = sbMessage as SendBird.FileMessage;
    message.message = '<FILE ATTACHMENT>';
    message.nickname = fileMessage.sender.nickname;
    message.type = MessageType.File;
    message.senderId = fileMessage.sender.userId;
  }
  return message;
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
  get operatorIds(): Set<string> {
    if (this._channel) {
      return new Set(this._channel.operators.map(o => o.userId));
    }
    return new Set();
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
  createPreviousListQuery(): PreviousListQuery {
    const listQuery = this._channel.createPreviousMessageListQuery();
    listQuery.limit = 10;
    listQuery.reverse = false;
    return listQuery;
  }
  async loadPreviousMessages(listQuery: PreviousListQuery): Promise<Array<Message>> {
    return new Promise((resolve, reject) => {
      console.log('Loading');
      listQuery.load(function (messageList, error) {
        if (error) {
          reject(error);
        } else {
          resolve(messageList.map(m => sbMessageToGeneralMessage(m)));
        }
      });
    });
  }
  async listOperators(): Promise<Array<string>> {
    const query = this._channel.createOperatorListQuery();
    query.limit = 30;
    return new Promise((resolve, reject) => {
      query.next((userList: Array<SendBird.User>, error) => {
        if (error) {
          reject(error);
        } else {
          resolve(userList.map(u => u.userId));
        }
      });
    });
  }
  sendMessage(message: string) {
    return new Promise<Message>((resolve, reject) => {
      if (!this.isConnected || !this._channel) {
        reject(new Error('Not connected'));
        return;
      }
      const params = new this._sendbird.UserMessageParams();
      params.message = message;
      this._channel.sendUserMessage(params, function (msg, error) {
        if (error) {
          reject(error);
          return;
        }
        resolve(sbMessageToGeneralMessage(msg));
      });
    });
  }
  getMessage(messageId: number): Promise<AnyMessageType> {
    const params = new this._sendbird.MessageRetrievalParams();
    params.messageId = messageId;
    params.channelType = 'open';
    params.channelUrl = this._chatUrl;
    return new Promise((resolve, reject) => {
      this._sendbird.BaseMessage.getMessage(params, (message, error) => {
        if (error) {
          reject(error);
        } else {
          resolve(message);
        }
      });
    });
  }
  _deleteMessage(message: any) {
    const generalMessage = sbMessageToGeneralMessage(message);
    return new Promise<Message>((resolve, reject) => {
      this._channel.deleteMessage(message as any, (response, error) => {
        if (error) {
          reject(error);
        } else {
          resolve(generalMessage);
        }
      });
    });
  }
  deleteMessageWithId(messageId: number): Promise<Message> {
    if (!this.isConnected || !this._channel) {
      Promise.reject(new Error('Not connected'));
      return;
    }
    return this.getMessage(messageId).then(m => this._deleteMessage(m));
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
    const onMessageReceived: OnMessageUpdateOrAddCallback = (channel, message) => {
      const gm = sbMessageToGeneralMessage(message);
      handlerFn(MessageEventType.Added, gm.id, gm);
    };
    const onMessageDeleted: OnMessageDeleteCallback = (channel, messageId) => {
      handlerFn(MessageEventType.Deleted, messageId);
    };
    const onMessageUpdated: OnMessageUpdateOrAddCallback = (channel, message) => {
      const gm = sbMessageToGeneralMessage(message);
      handlerFn(MessageEventType.Updated, gm.id, gm);
    };
    this._channelHandler.onMessageReceived = onMessageReceived;
    this._channelHandler.onMessageDeleted = onMessageDeleted;
    this._channelHandler.onMessageUpdated = onMessageUpdated;
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
