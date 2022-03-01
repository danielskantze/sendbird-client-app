import React, { useContext, useState } from 'react';
import { Button } from './atoms/button';
import { DropDown, DropDownItem } from './atoms/dropDown';
import { LayoutColumn } from './atoms/layoutColumn';
import { LayoutRow } from './atoms/layoutRow';
import { EditNicknamesModal } from './modals/editNicknames';
import {
  ChannelDescriptor,
  setChannels as updateChannels,
  selector as channelSettingsSelector,
} from '../store/slices/channelSettings';
import { selector as nicknamesSettingsSelector } from '../store/slices/nicknameSettings';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import * as stateUi from '../store/slices/uiState';
import * as stateApp from '../store/slices/appSettings';
import { SharedServices, SharedServicesContext } from '../appcontext';
import { Channel, createChatUserId } from '../services/chat';
import { RefreshIcon } from './icons/refreshIcon';
import { MoreIcon } from './icons/moreIcon';
import * as flashMessages from '../store/flashMessages';

function channelsToDropDownItems(channels: Array<ChannelDescriptor>): Array<DropDownItem> {
  return channels.map(c => ({ title: c.name, value: c.url } as DropDownItem));
}

function nicknamesToDropDownItems(nicknames: Array<string>): Array<DropDownItem> {
  return nicknames.map(c => ({ title: c, value: c } as DropDownItem));
}

function dropdownItemWithValue(items: Array<DropDownItem>, value: string) {
  return items.find(i => i.value === value);
}

export function ChannelSettings() {
  const dispatch = useAppDispatch();
  const [isRefreshingChannels, setIsRefreshingChannels] = useState(false);

  const sharedServices = useContext(SharedServicesContext) as SharedServices;
  const uiState: stateUi.UIState = useAppSelector(stateUi.selector);
  const [editNicknameVisible, setEditNicknameVisible] = useState(false);
  const appState: stateApp.AppSettings = useAppSelector(stateApp.selector);

  const nicknameSettings = useAppSelector(nicknamesSettingsSelector);
  const channelSettings = useAppSelector(channelSettingsSelector);

  const onEditNicknames = () => {
    setEditNicknameVisible(true);
  };

  const onCloseEditNicknames = () => {
    setEditNicknameVisible(false);
  };

  const onSaveNicknames = (selectedItem?:string) => {
    console.log("onSaveNicknames");
    dispatch(stateUi.setDisconnected());
    setEditNicknameVisible(false);
    if (selectedItem) {
      dispatch(stateUi.setSelectedNickname(selectedItem));
    } else {
      dispatch(stateUi.setSelectedNickname(null));
    }
  };

  const onRefreshChannel = async () => {
    const { chat } = sharedServices;
    const chatUserId = createChatUserId(appState.installationId, uiState.selectedNickname);
    setIsRefreshingChannels(true);
    let channels:Array<Channel> = [];
    try {
      if (!chat.isConnected) {
        await chat.connect(chatUserId, uiState.selectedNickname);
        channels = await chat.loadChannels();
        await chat.disconnect();
      } else {
        channels = await chat.loadChannels();
      }
      setIsRefreshingChannels(false);
      if (!uiState.selectedChannelUrl && channels.length) {
        dispatch(stateUi.setSelectedChannelUrl(channels[0].url));
      }
      dispatch(updateChannels(channels));
    } catch (e) {
      setIsRefreshingChannels(false);
      dispatch(stateUi.addFlashMessage(flashMessages.fromError(e)));
    }
  };

  const onSelectChannel = (item: DropDownItem) => {
    dispatch(stateUi.setSelectedChannelUrl(item.value));
    dispatch(stateUi.setDisconnected());
  };

  const onSelectNickname = (item: DropDownItem) => {
    dispatch(stateUi.setSelectedNickname(item.value));
    dispatch(stateUi.setDisconnected());
  };

  const onConnect = () => {
    dispatch(stateUi.setConnected());
  };

  const onDisconnect = () => {
    dispatch(stateUi.setDisconnected());
  };

  const canConnect = () => {
    return (!!uiState.selectedNickname) && (!!uiState.selectedChannelUrl);
  };

  const channelOptions = channelsToDropDownItems(channelSettings.channels);
  const selectedChannelItem = dropdownItemWithValue(channelOptions, uiState.selectedChannelUrl);
  const nicknameOptions = nicknamesToDropDownItems(nicknameSettings.nicknames);
  const selectedNicknameItem = dropdownItemWithValue(nicknameOptions, uiState.selectedNickname);
  return (
    <div className="channel-settings-container">
      {editNicknameVisible ? <EditNicknamesModal onClose={onCloseEditNicknames} onSave={onSaveNicknames} selectedNickname={selectedNicknameItem ? selectedNicknameItem.value : null} /> : ''}
      <LayoutRow extraClasses={['channel-settings']}>
        <LayoutColumn size={6}>
          <label className="text-tiny">Channel</label>
          <DropDown
            selectTitle="Select a channel"
            buttonTitle={(<RefreshIcon size={18} />)}
            options={channelOptions}
            disabled={isRefreshingChannels}
            selectedValue={selectedChannelItem}
            extraCssClasses={['channel-selector']}
            maxLength={46}
            onEdit={onRefreshChannel}
            onSelect={onSelectChannel}
          />
        </LayoutColumn>
        <LayoutColumn size={4}>
          <label className="text-tiny">Nickname</label>
          <DropDown
            selectTitle="Select a nickname"
            buttonTitle={(<MoreIcon />)}
            options={nicknameOptions}
            maxLength={24}
            selectedValue={selectedNicknameItem}
            onEdit={onEditNicknames}
            onSelect={onSelectNickname}
          />
        </LayoutColumn>
        <LayoutColumn size={2} align="right">
          <div className="float-right">
            { uiState.connectionStatus === stateUi.ConnectionStatus.Disconnected ? (
              <Button title="Connect" onClick={onConnect} disabled={!canConnect()} />
            ) : (
              <Button title="Disconnect" onClick={onDisconnect} />
            )}
          </div>
        </LayoutColumn>
      </LayoutRow>
    </div>
  );
}
