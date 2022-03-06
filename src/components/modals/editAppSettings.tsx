import React, { useContext, useEffect, useState } from "react";
import ModalDialog from "./ModalDialog";
import TextField from "../atoms/TextField";
import { SettingsContext } from "../../store/contexts/app";

type EditAppSettingsModalProps = {
  onClose: () => void;
  onSave: () => void;
};

const SAVE_ACTION_ID = 'save';

export default function EditAppSettingsModal(props: EditAppSettingsModalProps) {
  const { applicationId, setApplicationId } = useContext(SettingsContext);
  const [inputValue, setInputValue] = useState('');

  const onAction = (id: string) => {
    switch (id) {
      case SAVE_ACTION_ID:
        setApplicationId(inputValue);
        props.onSave();
        break;
    }
  };

  useEffect(() => {
    setInputValue(applicationId);
  }, [applicationId]);

  const onChange = (text:string) => {
    setInputValue(text);
  };

  return (
    <ModalDialog
      title="Edit Sendbird app settings"
      isLarge={false}
      onClose={props.onClose}
      onAction={onAction}
      content={
        <form>
          <TextField label="Application ID" value={inputValue} onChange={onChange} />
        </form>
      }
      actions={[{ title: "Save", id: SAVE_ACTION_ID }]}
    />
  );
}
