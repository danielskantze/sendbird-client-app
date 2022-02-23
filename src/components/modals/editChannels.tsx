import * as React from "react";
import { Button } from "../atoms/button";
import { ModalDialog } from "./modalDialog";

export type ChannelDescriptor = {
  title: string;
  url: string;
};

type EditChannelsModalProps = {
  onClose: () => void;
  onSave: () => void;
  channels: Array<ChannelDescriptor>;
};

export function EditChannelModal(props: EditChannelsModalProps) {
  const onAction = (id: string) => {
    switch (id) {
      case "save":
        props.onSave();
        break;
    }
  };
  return (
    <ModalDialog
      title="Edit channels"
      onClose={props.onClose}
      onAction={onAction}
      content={
        <table className="table edit-list edit-channels-modal">
          <thead>
            <tr>
              <th></th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {props.channels.map((c: ChannelDescriptor) => (
              <tr key={c.url}>
                <td>{c.title}</td>
                <td>{c.url}</td>
                <td>
                  <Button
                    title="delete"
                    type="error"
                    extraClasses={["btn-sm"]}
                  />
                </td>
              </tr>
            ))}
            <tr>
              <td>
                <div className="form-group">
                  <input
                    className="form-input"
                    type="text"
                    placeholder="Name"
                  />
                </div>
              </td>
              <td>
                <div className="form-group">
                  <input
                    className="form-input"
                    type="text"
                    placeholder="Url"
                  />
                </div>
              </td>              
              <td>
                <Button title="add" />
              </td>
            </tr>
          </tbody>
        </table>
      }
      actions={[{ title: "Save", id: "save" }]}
    />
  );
}
