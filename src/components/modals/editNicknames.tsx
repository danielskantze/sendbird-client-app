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

export function EditNicknamesModal(props: EditNicknamesModalProps) {
    const dispatch = useAppDispatch();
    const nicknameSettings: NicknameSettings = useAppSelector(nicknameSettingsSelector);
    const [inputNickname, setInputNickname] = useState('');
    const [nicknames, setNicknames] = useState(nicknameSettings.nicknames);

    const onAction = (id: string) => {
        switch (id) {
            case SAVE_ACTION_ID:
                dispatch(updateNicknames(nicknames));
                props.onSave();
                break;
        }
    };

    const onChangeNickname = (e: React.FormEvent<HTMLInputElement>) => {
        setInputNickname(e.currentTarget.value);
    };

    const onAddNickname = () => {
        setNicknames(nicknames.concat([inputNickname]));
        setInputNickname('');
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
                        {nicknames.map((nickname: string) => (
                            <tr key={nickname}>
                                <td>{nickname}</td>
                                <td>
                                    <Button title="delete" type="error" extraClasses={['btn-sm']} />
                                </td>
                            </tr>
                        ))}
                        <tr>
                            <td>
                                <form>
                                    <div className="form-group">
                                        <input className="form-input" type="text" placeholder="Nickname" value={inputNickname} onChange={onChangeNickname}/>
                                    </div>
                                </form>
                            </td>
                            <td>
                                <Button title="add" onClick={onAddNickname}/>
                            </td>
                        </tr>
                    </tbody>
                </table>
            }
            actions={[{ title: 'Save', id: SAVE_ACTION_ID }]}
        />
    );
}
