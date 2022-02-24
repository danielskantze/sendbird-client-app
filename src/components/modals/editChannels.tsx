import React, { useState } from 'react';
import { Button } from '../atoms/button';
import { ModalDialog } from './modalDialog';
import {
    ChannelSettings,
    setChannels as updateChannels,
    selector as channelSettingsSelector,
    ChannelDescriptor,
} from '../../store/slices/channelSettings';
import { useAppDispatch, useAppSelector } from '../../store/hooks';

type EditChannelsModalProps = {
    onClose: () => void;
    onSave: () => void;
};

const SAVE_ACTION_ID = 'save';

function ListingRow(props:ChannelDescriptor) {
    return (
        <li>
            <div className="name value" title={props.title}>{props.title}</div>
            <div className="url value" title={props.url}>{props.url}</div>
            <div className="action"><Button title="delete" type="error" extraClasses={['btn-sm']} /></div>
        </li>
    );
}

type AddChannelProps = {
    onAddChannel: (url:string, title:string) => void
};

function AddRow(props:AddChannelProps) {
    const [inputUrl, setInputUrl] = useState('');
    const [inputTitle, setInputTitle] = useState('');

    const onChangeInputUrl = (e: React.FormEvent<HTMLInputElement>) => {
        setInputUrl(e.currentTarget.value);
    };

    const onChangeInputTitle = (e: React.FormEvent<HTMLInputElement>) => {
        setInputTitle(e.currentTarget.value);
    };

    const onAddChannel = () => {
        props.onAddChannel(inputUrl, inputTitle);
        setInputUrl('');
        setInputTitle('');
    };

    return (
        <li key={'add'} className="add">
            <div className="name">
                <div className="form-group">
                    <input
                        className="form-input"
                        type="text"
                        placeholder="Name"
                        value={inputTitle}
                        onChange={onChangeInputTitle}
                    />
                </div>
            </div>
            <div className="url">
                <div className="form-group">
                    <input
                        className="form-input"
                        type="text"
                        placeholder="Url"
                        value={inputUrl}
                        onChange={onChangeInputUrl}
                    />
                </div>
            </div>
            <div className="action">
                <Button title="add" onClick={onAddChannel} />
            </div>
        </li>
    );
}

export function EditChannelModal(props: EditChannelsModalProps) {
    const dispatch = useAppDispatch();
    const channelSettings: ChannelSettings = useAppSelector(channelSettingsSelector);
    const [channels, setChannels] = useState(channelSettings.channels);

    const onAction = (id: string) => {
        switch (id) {
            case SAVE_ACTION_ID:
                dispatch(updateChannels(channels));
                props.onSave();
                break;
        }
    };

    const onAddChannel = (url:string, title:string) => {
        setChannels(channels.concat([{url, title}]));
    };

    return (
        <ModalDialog
            title="Edit channels"
            isLarge={true}
            onClose={props.onClose}
            onAction={onAction}
            content={
                <ul className="table edit-list edit-channels-modal">
                    {channels.map(c => (
                        <ListingRow key={c.url} title={c.title} url={c.url} />
                    ))}
                    <AddRow onAddChannel={onAddChannel} />
                </ul>
            }
            actions={[{ title: 'Save', id: SAVE_ACTION_ID }]}
        />
    );
}
