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

export type Channel = {
  url: string,
  name: string
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

export function createChatUserId(baseId:string, suffix:string) {
    return `${baseId}_${suffix}`;
}
export class ChatService {
  private _chatAppId: string;
  private _chatUrl: string;
  private _nickname: string;
  private _userId: string;
  private _serviceUserId: string;
  private _isConnected: boolean;

  private _channelHandler: SendBird.ChannelHandler;
  private _channelHandlerId: string;
  private _user: SendBird.User;
  private _channel: SendBird.OpenChannel;
  private _sendbird: SendBird.SendBirdInstance;

  constructor(chatAppId: string, serviceUserId: string) {
    const config = { appId: chatAppId, localCacheEnabled: false };
    this._chatAppId = chatAppId;
    this._serviceUserId = serviceUserId;
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
  async connect(userId: string, nickname: string, token?:string) {
    this._userId = userId;
    this._nickname = nickname;
    const user = token ? 
      await this._sendbird.connect(this.userId, token) :
      await this._sendbird.connect(this.userId);
    this._user = user;
    this._isConnected = true;
    Logger.main.debug('Connected', user);
    await this._sendbird.updateCurrentUserInfo(nickname, '');
    Logger.main.debug('Profile updated');
  }
  async loadChannels() {
    if (!this.isConnected) {
      throw new Error("Not connected");
    }
    const listQuery = this._sendbird.OpenChannel.createOpenChannelListQuery();
    const sbChannels = await listQuery.next();
    return sbChannels.map(c => ({ url: c.url, name: c.name }));
  }
  async joinChannel(url: string) {
    if (!this._sendbird || !this.isConnected) {
      throw new Error('Not connected');
    }
    this._chatUrl = url;
    const channel = await this._sendbird.OpenChannel.getChannel(url);
    await channel.enter();
    this._channel = channel;
  }
  generateUserId(nickname:string):string {
    return createChatUserId(this._serviceUserId, nickname);
  }
  createPreviousListQuery(): PreviousListQuery {
    const listQuery = this._channel.createPreviousMessageListQuery();
    listQuery.limit = 10;
    listQuery.reverse = false;
    return listQuery;
  }
  async loadPreviousMessages(listQuery: PreviousListQuery): Promise<Array<Message>> {
    console.log('Loading');
    const messageList = await listQuery.load();
    return messageList.map(m => sbMessageToGeneralMessage(m));
  }
  async listOperators(): Promise<Array<string>> {
    const query = this._channel.createOperatorListQuery();
    query.limit = 30;
    const userList = await query.next();
    return userList.map(u => u.userId);
  }
  async sendMessage(message: string) {
    if (!this.isConnected || !this._channel) {
      throw new Error('Not connected');
    }
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
  async _deleteMessage(message: any) {
    const generalMessage = sbMessageToGeneralMessage(message);
    await this._channel.deleteMessage(message as any);
    return generalMessage;  
  }
  async deleteMessageWithId(messageId: number): Promise<Message> {
    if (!this.isConnected || !this._channel) {
      throw new Error('Not connected');
    }
    return await this.getMessage(messageId).then(m => this._deleteMessage(m));
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
  async disconnect() {
    if (!this.isConnected) {
      return Promise.resolve();
    }
    this.clearMessageHandler();
    await this._sendbird.disconnect();
    this._isConnected = false;
    this._user = null;
    this._channel = null;
  }
  // Note: Need to be connected to fetch users. If user is not connected, then use the special installationId to connect temporarily
  async getUserInfo(userId:string) {
    if (!this._serviceUserId) {
      throw new Error("serviceUserId not set");
    }
    let sb:SendBird.SendBirdInstance = this._sendbird;
    let shouldDisconnect = false;
    const config = { appId: this.chatAppId, localCacheEnabled: false };
    if (!this._isConnected) {
      sb = createSendbirdInstance(config) as SendBird.SendBirdInstance;
      shouldDisconnect = true;
    }
    const query = sb.createApplicationUserListQuery();
    query.userIdsFilter = [userId];
    await sb.connect(this._serviceUserId);
    const users = await query.next();
    if (shouldDisconnect) {
      await sb.disconnect();
    }
    return users.length > 0 ? users[0] : null;
  }
}
