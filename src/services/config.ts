// eslint-disable-next-line @typescript-eslint/no-explicit-any
const electron = (window as any).electron;

export async function loadConfig(key:string, defaultConfig?:object):Promise<object> {
    const defaultConfigOrNull = defaultConfig ? JSON.stringify(defaultConfig) : null;
    return electron.loadConfig(key, defaultConfigOrNull)
        .then(JSON.parse);
}

export async function saveConfig(key:string, config:object):Promise<void> {
    return electron.saveConfig(key, JSON.stringify(config));
}