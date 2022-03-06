import { saveConfig } from '../../services/config';

export function persistedSetter<S, T>(configKey:string, stateFn:() => S, kv:Record<string, T>, setFn:(v:T) => void) {
  return (v:T) => {
    const state = stateFn();
    for (const k in kv) {
      if (k in state) {
        (state as any)[k] = v;
        break;
      }
    }
    setFn(v);
    saveConfig(configKey, (state as unknown) as object);
  }
}

// This one exists just to trigger the persist function after saving

export function persistedSetterFactory<S>(configKey:string, stateFn:() => S) {
  return (kv:Record<string, any>, setFn:(v:any) => void) => {
    return (v:any) => {
      const state = stateFn();
      for (const k in kv) {
        if (k in state) {
          (state as any)[k] = v;
          break;
        }
      }
      setFn(v);
      saveConfig(configKey, (state as unknown) as object);
    }  
  }
}