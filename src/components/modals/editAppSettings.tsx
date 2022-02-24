import React, { useState } from "react";
import { ModalDialog } from "./modalDialog";
import {
  AppSettings,
  updateApiKey,
  selector as appSettingsSelector,
} from "../../store/slices/appSettings";
import { useAppDispatch, useAppSelector } from "../../store/hooks";

type EditAppSettingsModalProps = {
  onClose: () => void;
  onSave: () => void;
};

const SAVE_ACTION_ID = 'save';

export function EditAppSettingsModal(props: EditAppSettingsModalProps) {
  const dispatch = useAppDispatch();
  const appSettings: AppSettings = useAppSelector(appSettingsSelector);
  const [apiKey, setApiKey] = useState(appSettings.apiKey);

  const onAction = (id: string) => {
    switch (id) {
      case SAVE_ACTION_ID:
        dispatch(updateApiKey(apiKey));
        props.onSave();
        break;
    }
  };

  const onChange = (e: React.FormEvent<HTMLInputElement>) => {
    setApiKey(e.currentTarget.value);
  };

  return (
    <ModalDialog
      title="Edit Sendbird app settings"
      isLarge={false}
      onClose={props.onClose}
      onAction={onAction}
      content={
        <form>
          <div className="form-group">
            <label className="form-label">API key</label>
            <input
              className="form-input"
              type="text"
              placeholder="Api key"
              value={apiKey}
              onChange={onChange}
            />
          </div>
        </form>
      }
      actions={[{ title: "Save", id: SAVE_ACTION_ID }]}
    />
  );
}
