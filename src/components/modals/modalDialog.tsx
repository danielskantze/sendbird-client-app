import * as React from 'react';
import { Button } from '../atoms/button';

export type ModalDialogButtonAction = {
    title: string;
    id: string;
    type?: string;
};

export interface ModalDialogProps {
    title: string;
    isLarge: boolean;
    content: React.ReactNode;
    actions: Array<ModalDialogButtonAction>;
    onClose: () => void;
    onAction?: (actionId: string) => void;
}

export function ModalDialog(props: ModalDialogProps) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onClickClose = (e: any) => {
        e.preventDefault();
        e.stopPropagation();
        props.onClose();
    };

    function createActionHandler(id: string) {
        return function () {
            if (props.onAction) {
                props.onAction(id);
            }
        };
    }
    const mainClasses = ["modal active"];
    const headerClasses = ["modal-title"];
    let divider:unknown = '';
    if (props.isLarge) {
        mainClasses.push("modal-lg");
        headerClasses.push("h3");
        divider = <div className='divider'></div>;
    } else {
        headerClasses.push("h5")
    }


    return (
        <div className={mainClasses.join(" ")}>
            <a href="#close" className="modal-overlay" aria-label="Close" onClick={onClickClose}></a>
            <div className="modal-container">
                <div className="modal-header">
                    <a
                        href="#close"
                        className="btn btn-clear float-right"
                        aria-label="Close"
                        onClick={onClickClose}></a>
                    <div className={headerClasses.join(" ")}>{props.title}</div>
                </div>
                {divider}
                <div className="modal-body">
                    <div className="content">{props.content}</div>
                </div>
                {divider}
                <div className="modal-footer">
                    {props.actions.map(a => (
                        <Button key={a.id} title={a.title} onClick={createActionHandler(a.id)} />
                    ))}
                </div>
            </div>
        </div>
    );
}
