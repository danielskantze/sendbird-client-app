import React, { useState } from "react";
import { ModalDialog } from "./modalDialog";
import {
  AppSettings,
  updateApplicationId,
  selector as appSettingsSelector,
} from "../../store/slices/appSettings";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { TextField } from "../atoms/textField";

type EditAppSettingsModalProps = {
  onClose: () => void;
  onSave: () => void;
};

const SAVE_ACTION_ID = 'save';

export function EditAppSettingsModal(props: EditAppSettingsModalProps) {
  const dispatch = useAppDispatch();
  const appSettings: AppSettings = useAppSelector(appSettingsSelector);
  const [applicationId, setApplicationId] = useState(appSettings.applicationId);

  const onAction = (id: string) => {
    switch (id) {
      case SAVE_ACTION_ID:
        dispatch(updateApplicationId(applicationId));
        props.onSave();
        break;
    }
  };

  const onChange = (text:string) => {
    setApplicationId(text);
  };

  return (
    <ModalDialog
      title="Edit Sendbird app settings"
      isLarge={false}
      onClose={props.onClose}
      onAction={onAction}
      content={
        <form>
          <TextField label="Application ID" value={applicationId} onChange={onChange} />
        </form>
      }
      actions={[{ title: "Save", id: SAVE_ACTION_ID }]}
    />
  );
}
