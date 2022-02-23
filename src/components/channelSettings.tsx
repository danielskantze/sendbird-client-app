import React, { useState } from 'react';
import { Button } from './atoms/button';
import { DropDown, DropDownItem } from './atoms/dropDown';
import { LayoutColumn } from './atoms/layoutColumn';
import { LayoutRow } from './atoms/layoutRow';
import { EditChannelModal } from './modals/editChannels';
import { EditNicknamesModal } from './modals/editNicknames';
import { ChannelDescriptor, selector as channelSettingsSelector } from '../store/slices/channelSettings';
import { selector as nicknamesSettingsSelector } from '../store/slices/nicknameSettings';
import { useAppSelector } from '../store/hooks';

function channelsToDropDownItems(channels: Array<ChannelDescriptor>): Array<DropDownItem> {
    return channels.map(c => ({ title: c.title, value: c.url } as DropDownItem));
}

function nicknamesToDropDownItems(channels: Array<string>): Array<DropDownItem> {
    return channels.map(c => ({ title: c, value: c } as DropDownItem));
}

export function ChannelSettings() {
    const [editNicknameVisible, setEditNicknameVisible] = useState(false);
    const [editChannelsVisible, setEditChannelsVisible] = useState(false);
    const [isConnected, setIsConnected] = useState(false);

    const nicknameSettings = useAppSelector(nicknamesSettingsSelector);
    const channelSettings = useAppSelector(channelSettingsSelector);

    const onEditNicknames = () => {
        setEditNicknameVisible(true);
    };

    const onCloseEditNicknames = () => {
        setEditNicknameVisible(false);
    };

    const onSaveNicknames = () => {
        setIsConnected(false);
        setEditNicknameVisible(false);
    };

    const onEditChannels = () => {
        setEditChannelsVisible(true);
    };

    const onCloseEditChannels = () => {
        setEditChannelsVisible(false);
    };

    const onSaveChannels = () => {
        setIsConnected(false);
        setEditChannelsVisible(false);
    };

    const onConnect = () => {
        setIsConnected(true);
    };

    return (
        <div>
            {editNicknameVisible ? <EditNicknamesModal onClose={onCloseEditNicknames} onSave={onSaveNicknames} /> : ''}
            {editChannelsVisible ? <EditChannelModal onClose={onCloseEditChannels} onSave={onSaveChannels} /> : ''}
            <LayoutRow extraClasses={['channel-settings']}>
                <LayoutColumn size={4}>
                    <DropDown
                        selectTitle="Select a channel"
                        buttonTitle="..."
                        options={channelsToDropDownItems(channelSettings.channels)}
                        onEdit={onEditChannels}
                        />
                </LayoutColumn>
                <LayoutColumn size={4}>
                    <DropDown
                        selectTitle="Select a nickname"
                        buttonTitle=" ... "
                        options={nicknamesToDropDownItems(nicknameSettings.nicknames)}
                        onEdit={onEditNicknames}
                    />
                </LayoutColumn>
                <LayoutColumn size={2} align="right">
                    <div className="float-right">
                        <Button title={isConnected ? "Disconnect" : "Connnect"} onClick={onConnect} />
                    </div>
                </LayoutColumn>
            </LayoutRow>
        </div>
    );
}
