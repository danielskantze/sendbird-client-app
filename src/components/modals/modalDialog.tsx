import * as React from "react";
import { Button } from "../atoms/button";

export type ModalDialogButtonAction = {
    title: string,
    id: string,
    type?: string
}

export interface ModalDialogProps {
    title: string,
    content: React.ReactNode,
    actions: Array<ModalDialogButtonAction>,
    onClose: () => void,
    onAction?: (actionId:string) => void,
}

export function ModalDialog(props:ModalDialogProps) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onClickClose = (e:any) => {
        e.preventDefault();
        e.stopPropagation();
        props.onClose();
    }

    function createActionHandler(id:string) {
        return function() {
            if (props.onAction) {
                props.onAction(id);
            }
        }
    }    

    return (
    <div className="modal active">
      <a href="#close" className="modal-overlay" aria-label="Close" onClick={onClickClose}></a>
      <div className="modal-container">
        <div className="modal-header">
          <a
            href="#close"
            className="btn btn-clear float-right"
            aria-label="Close"
            onClick={onClickClose}
          ></a>
          <div className="modal-title h5">{props.title}</div>
        </div>
        <div className="modal-body">
          <div className="content">
            {props.content}
          </div>
        </div>
        <div className="modal-footer">
            {props.actions.map(a => <Button key={a.id} title={a.title} onClick={createActionHandler(a.id)} />)}
        </div>
      </div>
    </div>
  );
}
