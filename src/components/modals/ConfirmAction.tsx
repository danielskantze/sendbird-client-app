import React from "react";
import ModalDialog from "./ModalDialog";

type ConfirmActionModalProps = {
  title: string,
  body: string,
  onClose: () => void,
  onConfirm: () => void,
};

const CONFIRM_ACTION_ID = 'delete';

export default function ConfirmAction(props: ConfirmActionModalProps) {

  const onAction = (id: string) => {
    switch (id) {
      case CONFIRM_ACTION_ID:
        props.onConfirm();
        break;
    }
  };

  return (
    <ModalDialog
      title={props.title}
      isLarge={false}
      onClose={props.onClose}
      onAction={onAction}
      content={
        <p>{props.body}</p>
      }
      actions={[{ title: "Delete", id: CONFIRM_ACTION_ID, color: 'danger' }]}
    />
  );
}
