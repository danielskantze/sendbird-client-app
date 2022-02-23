import * as React from "react";
import { Button } from "./atoms/button";
import { DropDown } from "./atoms/dropDown";
import { LayoutColumn } from "./atoms/layoutColumn";
import { LayoutRow } from "./atoms/layoutRow";
import { EditChannelModal } from "./modals/editChannels";
import { EditNicknamesModal } from "./modals/editNicknames";

export function ChannelSettings() {
  const [editNicknameVisible, setEditNicknameVisible] = React.useState(false);
  const [editChannelsVisible, setEditChannelsVisible] = React.useState(false);

  const onEditNicknames = () => {
    setEditNicknameVisible(true);
  };

  const onCloseEditNicknames = () => {
    setEditNicknameVisible(false);
  };

  const onSaveNicknames = () => {
    setEditNicknameVisible(false);
  };

  const onEditChannels = () => {
    setEditChannelsVisible(true);
  };

  const onCloseEditChannels = () => {
    setEditChannelsVisible(false);
  };

  const onSaveChannels = () => {
    setEditChannelsVisible(false);
  };

  return (
    <div>
      {editNicknameVisible ? (
        <EditNicknamesModal
          onClose={onCloseEditNicknames}
          onSave={onSaveNicknames}
          nicknames={["chatpro", "bettan", "olofolof"]}
        />
      ) : (
        ""
      )}
      {editChannelsVisible ? (
        <EditChannelModal
          onClose={onCloseEditChannels}
          onSave={onSaveChannels}
          channels={[{title: "Coupleness developer channel", url: "http://www.example.com"}]}
        />
      ) : (
        ""
      )}      
      <LayoutRow extraClasses={["channel-settings"]}>
        <LayoutColumn size={4}>
          <DropDown
            selectTitle="Select a channel"
            buttonTitle="..."
            options={[]}
            onEdit={onEditChannels}
          />
        </LayoutColumn>
        <LayoutColumn size={4}>
          <DropDown
            selectTitle="Select a nickname"
            buttonTitle=" ... "
            options={[]}
            onEdit={onEditNicknames}
          />
        </LayoutColumn>
        <LayoutColumn size={2} align="right">
          <div className="float-right">
            <Button title="Connect" />
          </div>
        </LayoutColumn>
      </LayoutRow>
    </div>
  );
}
