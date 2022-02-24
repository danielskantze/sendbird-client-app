import React, { useState } from 'react';
import { Button } from '../atoms/button';
import { ModalDialog } from './modalDialog';
import {
    NicknameSettings,
    setNicknames as updateNicknames,
    selector as nicknameSettingsSelector,
} from '../../store/slices/nicknameSettings';
import { useAppDispatch, useAppSelector } from '../../store/hooks';

type EditNicknamesModalProps = {
    onClose: () => void;
    onSave: () => void;
};

const SAVE_ACTION_ID = 'save';

type ListingRowProps = {
    nickname: string
};

function ListingRow(props:ListingRowProps) {
    return (
        <li>
            <div className="nickname value" title={props.nickname}>{props.nickname}</div>
            <div className="action"><Button title="delete" type="error" extraClasses={['btn-sm']} /></div>
        </li>
    );
}

type AddRowProps = {
    onAddRow: (nickname:string) => void
};

function AddRow(props:AddRowProps) {
    const [inputName, setInputName] = useState('');

    const onChangeInputName = (e: React.FormEvent<HTMLInputElement>) => {
        setInputName(e.currentTarget.value);
    };

    const onAddChannel = () => {
        props.onAddRow(inputName);
        setInputName('');
    };

    return (
        <li key={'add'} className="add">
            <div className="nickname">
                <div className="form-group">
                    <input
                        className="form-input"
                        type="text"
                        placeholder="Name"
                        value={inputName}
                        onChange={onChangeInputName}
                    />
                </div>
            </div>
            <div className="action">
                <Button title="add" onClick={onAddChannel} />
            </div>
        </li>
    );
}

export function EditNicknamesModal(props: EditNicknamesModalProps) {
    const dispatch = useAppDispatch();
    const nicknameSettings: NicknameSettings = useAppSelector(nicknameSettingsSelector);
    const [nicknames, setNicknames] = useState(nicknameSettings.nicknames);

    const onAction = (id: string) => {
        switch (id) {
            case SAVE_ACTION_ID:
                dispatch(updateNicknames(nicknames));
                props.onSave();
                break;
        }
    };

    const onAddNickname = (nickname:string) => {
        setNicknames(nicknames.concat([nickname]));
    };

    return (
        <ModalDialog
            title="Edit nicknames"
            isLarge={true}
            onClose={props.onClose}
            onAction={onAction}
            content={
                <ul className="table edit-list edit-channels-modal">
                    {nicknames.map(c => (
                        <ListingRow key={c} nickname={c} />
                    ))}
                    <AddRow onAddRow={onAddNickname} />
                </ul>
            }
            actions={[{ title: 'Save', id: SAVE_ACTION_ID }]}
        />
    );
}
