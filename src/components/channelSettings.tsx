import React, { useState } from 'react';
import { Button } from './atoms/button';
import { DropDown, DropDownItem } from './atoms/dropDown';
import { LayoutColumn } from './atoms/layoutColumn';
import { LayoutRow } from './atoms/layoutRow';
import { EditChannelModal } from './modals/editChannels';
import { EditNicknamesModal } from './modals/editNicknames';
import { ChannelDescriptor, selector as channelSettingsSelector } from '../store/slices/channelSettings';
import { selector as nicknamesSettingsSelector } from '../store/slices/nicknameSettings';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
    UIState,
    setSelectedChannelUrl,
    setSelectedNickname,
    selector as uiStateSelector,
} from '../store/slices/uiState';


function channelsToDropDownItems(channels: Array<ChannelDescriptor>): Array<DropDownItem> {
    return channels.map(c => ({ title: c.title, value: c.url } as DropDownItem));
}

function nicknamesToDropDownItems(nicknames: Array<string>): Array<DropDownItem> {
    return nicknames.map(c => ({ title: c, value: c } as DropDownItem));
}

function dropdownItemWithValue(items: Array<DropDownItem>, value:string) {
    return items.find(i => i.value === value);
}

export function ChannelSettings() {
    const dispatch = useAppDispatch();
    const uiState: UIState = useAppSelector(uiStateSelector);
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

    const onSelectChannel = (item:DropDownItem) => {
        dispatch(setSelectedChannelUrl(item.value));
    }

    const onSelectNickname = (item:DropDownItem) => {
        dispatch(setSelectedNickname(item.value));
    }

    const onConnect = () => {
        setIsConnected(true);
    };

    const channelOptions = channelsToDropDownItems(channelSettings.channels);
    const selectedChannelItem = dropdownItemWithValue(channelOptions, uiState.selectedChannelUrl);
    const nicknameOptions = nicknamesToDropDownItems(nicknameSettings.nicknames);
    const selectedNicknameItem = dropdownItemWithValue(nicknameOptions, uiState.selectedNickname);
    return (
        <div>
            {editNicknameVisible ? <EditNicknamesModal onClose={onCloseEditNicknames} onSave={onSaveNicknames} /> : ''}
            {editChannelsVisible ? <EditChannelModal onClose={onCloseEditChannels} onSave={onSaveChannels} /> : ''}
            <LayoutRow extraClasses={['channel-settings']}>
                <LayoutColumn size={4}>
                    <DropDown
                        selectTitle="Select a channel"
                        buttonTitle="..."
                        options={channelOptions}
                        selectedValue={selectedChannelItem}
                        onEdit={onEditChannels}
                        onSelect={onSelectChannel}
                        />
                </LayoutColumn>
                <LayoutColumn size={4}>
                    <DropDown
                        selectTitle="Select a nickname"
                        buttonTitle=" ... "
                        options={nicknameOptions}
                        selectedValue={selectedNicknameItem}
                        onEdit={onEditNicknames}
                        onSelect={onSelectNickname}
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
