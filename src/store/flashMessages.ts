export enum FlashMessageType {
  Info,
  Warning,
  Error,
}

export interface FlashMessage {
  id: string,
  message: string
  type: FlashMessageType,
  data?: unknown
}

function createId() {
  return Math.random().toString(36).replace(/[^a-z]+/g, '');
}

export function createMessage(message:string, type:FlashMessageType, id?:string):FlashMessage {
  return {
    id: id ? id : createId(),
    message,
    type
  }
}

export function fromError(error:Error, id?:string):FlashMessage {
  return {
    id: id ? id : createId(),
    message: error.message,
    type: FlashMessageType.Error,
    data: JSON.stringify(error)
  }
}

export function createInfo(message:string, id?:string):FlashMessage {
  return createMessage(message, FlashMessageType.Info, id);
}

export function createWarning(message:string, id?:string):FlashMessage {
  return createMessage(message, FlashMessageType.Warning, id);
}

export function createError(message:string, id?:string):FlashMessage {
  return createMessage(message, FlashMessageType.Error, id);
}


export function unwrapError(message:FlashMessage):object {
  if (message.type === FlashMessageType.Error && message.data) {
    return JSON.parse(message.data as string);
  }
  return null;
}