export class Logger {
    info(...params:Array<unknown>) {
        console.log.apply(null, params);
    }
    debug(...params:Array<unknown>) {
      console.log.apply(null, params);
    }
    error(...params:Array<unknown>) {
      console.error.apply(null, params);
    }
  }

  export const main = new Logger();