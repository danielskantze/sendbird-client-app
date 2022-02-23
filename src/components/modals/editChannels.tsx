import React, { useState } from 'react';
import { Button } from '../atoms/button';
import { ModalDialog } from './modalDialog';
import {
    ChannelSettings,
    setChannels as updateChannels,
    selector as channelSettingsSelector,
} from '../../store/slices/channelSettings';
import { useAppDispatch, useAppSelector } from '../../store/hooks';

type EditChannelsModalProps = {
    onClose: () => void;
    onSave: () => void;
};

const SAVE_ACTION_ID = 'save';

export function EditChannelModal(props: EditChannelsModalProps) {
    const dispatch = useAppDispatch();
    const channelSettings: ChannelSettings = useAppSelector(channelSettingsSelector);
    const [inputUrl, setInputUrl] = useState('');
    const [inputTitle, setInputTitle] = useState('');
    const [channels, setChannels] = useState(channelSettings.channels);

    const onAction = (id: string) => {
        switch (id) {
            case SAVE_ACTION_ID:
                dispatch(updateChannels(channels));
                props.onSave();
                break;
        }
    };

    const onChangeInputUrl = (e: React.FormEvent<HTMLInputElement>) => {
        setInputUrl(e.currentTarget.value);
    };

    const onChangeInputTitle = (e: React.FormEvent<HTMLInputElement>) => {
        setInputTitle(e.currentTarget.value);
    };

    const onAddChannel = () => {
        const channelData = { title: inputTitle, url: inputUrl };
        setChannels(channels.concat([channelData]));
        setInputUrl('');
        setInputTitle('');
    };

    return (
        <ModalDialog
            title="Edit channels"
            onClose={props.onClose}
            onAction={onAction}
            content={
                <table className="table edit-list edit-channels-modal">
                    <thead>
                        <tr>
                            <th></th>
                            <th></th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {channels.map(c => (
                            <tr key={c.url}>
                                <td>{c.title}</td>
                                <td>{c.url}</td>
                                <td>
                                    <Button title="delete" type="error" extraClasses={['btn-sm']} />
                                </td>
                            </tr>
                        ))}
                        <tr>
                            <td>
                                <div className="form-group">
                                    <input
                                        className="form-input"
                                        type="text"
                                        placeholder="Name"
                                        value={inputTitle}
                                        onChange={onChangeInputTitle}
                                    />
                                </div>
                            </td>
                            <td>
                                <div className="form-group">
                                    <input
                                        className="form-input"
                                        type="text"
                                        placeholder="Url"
                                        value={inputUrl}
                                        onChange={onChangeInputUrl}
                                    />
                                </div>
                            </td>
                            <td>
                                <Button title="add" onClick={onAddChannel} />
                            </td>
                        </tr>
                    </tbody>
                </table>
            }
            actions={[{ title: 'Save', id: SAVE_ACTION_ID }]}
        />
    );
}
