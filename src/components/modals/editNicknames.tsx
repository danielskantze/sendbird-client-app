import * as React from "react";
import { Button } from "../atoms/button";
import { ModalDialog } from "./modalDialog";

type EditNicknamesModalProps = {
  onClose: () => void;
  onSave: () => void;
  nicknames: Array<string>;
};

export function EditNicknamesModal(props: EditNicknamesModalProps) {
  const onAction = (id: string) => {
    switch (id) {
      case "save":
        props.onSave();
        break;
    }
  };
  return (
    <ModalDialog
      title="Edit nicknames"
      onClose={props.onClose}
      onAction={onAction}
      content={
        <table className="table edit-list edit-nicknames-modal">
          <thead>
            <tr>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {props.nicknames.map((nickname: string) => (
              <tr key={nickname}>
                <td>{nickname}</td>
                <td>
                  <Button title="delete" type="error" extraClasses={['btn-sm']}/>
                </td>
              </tr>
            ))}
            <tr>
              <td>
                <form>
                  <div className="form-group">
                    <input
                      className="form-input"
                      type="text"
                      placeholder="Nickname"
                    />
                  </div>
                </form>
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
