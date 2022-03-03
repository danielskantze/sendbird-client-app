import React, { useContext, useState } from 'react';
import Button from './atoms/Button';
import DropDown, { DropDownItem } from './atoms/DropDown';
import LayoutColumn from './atoms/LayoutColumn';
import LayoutRow from './atoms/LayoutRow';
import EditUsersModal from './modals/EditUsers';
import {
  ChannelDescriptor,
  setChannels as updateChannels,
  selector as channelSettingsSelector,
} from '../store/slices/channelSettings';
import { getUserData, UserData, selector as usersSettingsSelector } from '../store/slices/userSettings';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import * as stateUi from '../store/slices/uiState';
import { SharedServices, SharedServicesContext } from '../appcontext';
import { Channel } from '../services/chat';
import RefreshIcon from './icons/RefreshIcon';
import MoreIcon from './icons/MoreIcon';
import * as flashMessages from '../store/flashMessages';

function channelsToDropDownItems(channels: Array<ChannelDescriptor>): Array<DropDownItem> {
  return channels.map(c => ({ title: c.name, value: c.url } as DropDownItem));
}

function usersToDropDownItems(users: Array<UserData>): Array<DropDownItem> {
  return users.map(c => ({ title: c.name, value: c.userId } as DropDownItem));
}

function dropdownItemWithValue(items: Array<DropDownItem>, value: string) {
  return items.find(i => i.value === value);
}

export default function ChannelSettings() {
  const dispatch = useAppDispatch();
  const [isRefreshingChannels, setIsRefreshingChannels] = useState(false);

  const sharedServices = useContext(SharedServicesContext) as SharedServices;
  const uiState: stateUi.UIState = useAppSelector(stateUi.selector);
  const [editUserVisible, setEditUserVisible] = useState(false);

  const usersSettings = useAppSelector(usersSettingsSelector);
  const channelSettings = useAppSelector(channelSettingsSelector);

  const onEditUsers = () => {
    setEditUserVisible(true);
  };

  const onCloseEditUsers = () => {
    setEditUserVisible(false);
  };

  const onSaveUsers = (selectedUserId?:string) => {
    dispatch(stateUi.setDisconnected());
    setEditUserVisible(false);
    if (selectedUserId) {
      dispatch(stateUi.setSelectedUserId(selectedUserId));
    } else {
      dispatch(stateUi.setSelectedUserId(null));
    }
  };

  const onRefreshChannel = async () => {
    const { chat } = sharedServices;
    setIsRefreshingChannels(true);
    let channels:Array<Channel> = [];
    try {
      channels = await chat.loadChannels();
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

  const onSelectUser = (item: DropDownItem) => {
    dispatch(stateUi.setSelectedUserId(item.value));
    dispatch(stateUi.setDisconnected());
  };

  const onConnect = () => {
    dispatch(stateUi.setConnected());
  };

  const onDisconnect = () => {
    dispatch(stateUi.setDisconnected());
  };

  const canConnect = () => {
    return (!!uiState.selectedUserId) && (!!uiState.selectedChannelUrl);
  };
  const channelOptions = channelsToDropDownItems(channelSettings.channels);
  const selectedChannelItem = dropdownItemWithValue(channelOptions, uiState.selectedChannelUrl);
  const usersOptions = usersToDropDownItems(usersSettings.users);
  const selectedUser = dropdownItemWithValue(usersOptions, uiState.selectedUserId);
  return (
    <div className="channel-settings-container">
      {editUserVisible ? <EditUsersModal onClose={onCloseEditUsers} onSave={onSaveUsers} selectedUserId={selectedUser?.value} /> : ''}
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
          <label className="text-tiny">User</label>
          <DropDown
            selectTitle="Select a user"
            buttonTitle={(<MoreIcon />)}
            options={usersOptions}
            maxLength={24}
            selectedValue={selectedUser}
            onEdit={onEditUsers}
            onSelect={onSelectUser}
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
