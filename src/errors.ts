export enum ErrorType {
  None,
  Wrapped,
  Connection,
}

export interface IError {
  id: string,
  message: string
  type: ErrorType,
  data?: unknown
}

function createErrorId() {
  return Math.random().toString(36).replace(/[^a-z]+/g, '');
}

export function createError(message:string, type:ErrorType, id?:string):IError {
  return {
    id: id ? id : createErrorId(),
    message,
    type
  }
}

export function createWrappedError(error:Error, id?:string):IError {
  return {
    id: id ? id : createErrorId(),
    message: error.message,
    type: ErrorType.Wrapped,
    data: JSON.stringify(error)
  }
}

export function unwrapError(error:IError):object {
  if (error.data) {
    return JSON.parse(error.data as string);
  }
  return null;
}