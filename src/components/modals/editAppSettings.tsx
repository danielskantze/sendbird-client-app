import * as React from "react";
import { ModalDialog } from "./modalDialog";

type EditAppSettingsModalProps = {
  onClose: () => void;
  onSave: () => void;
};

export function EditAppSettingsModal(props: EditAppSettingsModalProps) {
    const onAction = (id:string) => {
        switch (id) {
            case 'save':
                props.onSave();
                break;
        }
    }
  return (
    <ModalDialog
      title="Edit Sendbird app settings"
      onClose={props.onClose}
      onAction={onAction}
      content={
        <form>
          <div className="form-group">
            <label className="form-label">API key</label>
            <input className="form-input" type="text" placeholder="Api key" />
          </div>
        </form>
      }
      actions={[{ title: "Save", id: "save" }]}
    />
  );
}
