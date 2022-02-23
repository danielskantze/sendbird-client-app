// eslint-disable-next-line @typescript-eslint/no-explicit-any
const electron = (window as any).electron;

export async function loadConfig() {
    return electron.loadConfig();
}

export async function saveConfig(config:unknown) {
    return electron.saveConfig(config);      
}