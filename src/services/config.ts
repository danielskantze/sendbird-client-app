// eslint-disable-next-line @typescript-eslint/no-explicit-any
const electron = (window as any).electron;

export async function loadConfig(key:string):Promise<object> {
    return electron.loadConfig(key)
        .then(JSON.parse);
}

export async function saveConfig(key:string, config:object):Promise<void> {
    return electron.saveConfig(key, JSON.stringify(config));
}