import React, { useContext, useState } from 'react';
import Button from './atoms/Button';
import DropDown, { DropDownItem } from './atoms/DropDown';
import LayoutColumn from './atoms/LayoutColumn';
import LayoutRow from './atoms/LayoutRow';
import EditUsersModal from './modals/EditUsers';
import { ConnectionStatus, UIContext } from '../store/contexts/ui';
import { SharedServices, SharedServicesContext } from '../appcontext';
import { Channel } from '../services/chat';
import RefreshIcon from './icons/RefreshIcon';
import MoreIcon from './icons/MoreIcon';
import * as flashMessages from '../store/flashMessages';
import { UsersContext, UserData } from '../store/contexts/users';
import { ChannelsContext, ChannelDescriptor } from '../store/contexts/channels';

function channelsToDropDownItems(channels: Array<ChannelDescriptor>): Array<DropDownItem> {
  return channels.map(c => ({ title: c.name, value: c.url } as DropDownItem));
}

function usersToDropDownItems(users: Array<UserData>, operatorIds: Array<string>): Array<DropDownItem> {
  const lookup = new Set(operatorIds);
  return users.map(
    c =>
      ({
        title: lookup.has(c.userId) ? '⭐ ' + c.name : c.name,
        value: c.userId,
      } as DropDownItem)
  );
}

function dropdownItemWithValue(items: Array<DropDownItem>, value: string) {
  return items.find(i => i.value === value);
}

export default function ChannelSettings() {
  const [isRefreshingChannels, setIsRefreshingChannels] = useState(false);

  const sharedServices = useContext(SharedServicesContext) as SharedServices;
  const [editUserVisible, setEditUserVisible] = useState(false);
  const { channels, setChannels } = useContext(ChannelsContext);

  const {
    connectionStatus,
    selectedChannelUrl,
    operatorIds,
    selectedUserId,
    setConnected,
    setDisconnected,
    setSelectedUserId,
    setSelectedChannelUrl,
    addFlashMessage,
  } = useContext(UIContext);
  const { users } = useContext(UsersContext);
  const channelOptions = channelsToDropDownItems(channels);
  const selectedChannelItem = dropdownItemWithValue(channelOptions, selectedChannelUrl);
  const usersOptions = usersToDropDownItems(users, operatorIds);
  const selectedUser = dropdownItemWithValue(usersOptions, selectedUserId);

  const onEditUsers = () => {
    setEditUserVisible(true);
  };

  const onCloseEditUsers = () => {
    setEditUserVisible(false);
  };

  const onSaveUsers = (userId?: string) => {
    setDisconnected();
    setEditUserVisible(false);
    setSelectedUserId(userId || null);
  };

  const onRefreshChannel = async () => {
    const { chat } = sharedServices;
    setIsRefreshingChannels(true);
    let channels: Array<Channel> = [];
    try {
      channels = await chat.loadChannels();
      setIsRefreshingChannels(false);
      if (!selectedChannelUrl && channels.length) {
        setSelectedChannelUrl(channels[0].url);
      }
      setChannels(channels);
    } catch (e) {
      setIsRefreshingChannels(false);
      addFlashMessage(flashMessages.fromError(e));
    }
  };

  const onSelectChannel = (item: DropDownItem) => {
    setSelectedChannelUrl(item.value);
    setDisconnected();
  };

  const onSelectUser = (item: DropDownItem) => {
    setSelectedUserId(item.value);
    setDisconnected();
  };

  const onConnect = () => {
    setConnected();
  };

  const onDisconnect = () => {
    setDisconnected();
  };

  const canConnect = () => {
    return !!selectedUserId && !!selectedChannelUrl;
  };

  return (
    <div className="channel-settings-container">
      {editUserVisible ? (
        <EditUsersModal onClose={onCloseEditUsers} onSave={onSaveUsers} selectedUserId={selectedUser?.value} />
      ) : (
        ''
      )}
      <LayoutRow extraClasses={['channel-settings']}>
        <LayoutColumn size={6}>
          <label className="text-tiny">Channel</label>
          <DropDown
            selectTitle="Select a channel"
            buttonTitle={<RefreshIcon size={18} />}
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
            buttonTitle={<MoreIcon />}
            options={usersOptions}
            maxLength={24}
            selectedValue={selectedUser}
            onEdit={onEditUsers}
            onSelect={onSelectUser}
          />
        </LayoutColumn>
        <LayoutColumn size={2} align="right">
          <div className="float-right">
            {connectionStatus === ConnectionStatus.Disconnected ? (
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
