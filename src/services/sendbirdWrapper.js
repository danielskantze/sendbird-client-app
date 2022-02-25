import * as SendBird from 'sendbird';

export function createSendbirdInstance(config) {
    return new SendBird(config);
}