import React, { useState } from 'react';
import { Button } from '../atoms/button';
import { ModalDialog } from './modalDialog';
import {
  NicknameSettings,
  setNicknames as updateNicknames,
  selector as nicknameSettingsSelector,
} from '../../store/slices/nicknameSettings';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { TextField } from '../atoms/textField';

type EditNicknamesModalProps = {
  onClose: () => void;
  onSave: () => void;
};

const SAVE_ACTION_ID = 'save';

type ListingRowProps = {
  nickname: string;
  onDeleteItem: (nickname:string) => void
};

function ListingRow(props: ListingRowProps) {
    const onClick = () => {
        return props.onDeleteItem(props.nickname);
    }
  return (
    <li>
      <div className="nickname value" title={props.nickname}>
        {props.nickname}
      </div>
      <div className="action">
        <Button title="delete" type="error" extraClasses={['btn-sm']} onClick={onClick} />
      </div>
    </li>
  );
}

type AddRowProps = {
  onAddRow: (nickname: string) => void;
};

function AddRow(props: AddRowProps) {
  const [inputName, setInputName] = useState('');

  const onChangeInputName = (text: string) => {
    setInputName(text);
  };

  const onAddChannel = () => {
    props.onAddRow(inputName);
    setInputName('');
  };

  return (
    <li key={'add'} className="add">
      <div className="nickname">
        <TextField label="Nickname" value={inputName} onChange={onChangeInputName} />
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

  const onAddNickname = (nickname: string) => {
    setNicknames(nicknames.concat([nickname]));
  };

  const createDeleteNicknameFn = (nickname: string) => {
    return () => {
        setNicknames(nicknames.filter(n => n !== nickname));
    };
  };

  return (
    <ModalDialog
      title="Edit nicknames"
      isLarge={false}
      onClose={props.onClose}
      onAction={onAction}
      content={
        <div>
          <ul className="table edit-list edit-channels-items">
            {nicknames.map(c => (
              <ListingRow key={c} nickname={c} onDeleteItem={createDeleteNicknameFn(c)} />
            ))}
          </ul>
        </div>
      }
      footerContent={
        <ul className="table edit-list edit-channels-add">
          <AddRow onAddRow={onAddNickname} />
        </ul>
      }
      actions={[{ title: 'Save', id: SAVE_ACTION_ID }]}
    />
  );
}
