import React, { useContext, useState } from 'react';
import { Button } from '../atoms/button';
import { ModalDialog } from './modalDialog';
import {
  NicknameSettings,
  setNicknames as updateNicknames,
  selector as nicknameSettingsSelector,
} from '../../store/slices/nicknameSettings';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { TextField } from '../atoms/textField';
import { cssCl } from '../../util/styling';
import { SharedServices, SharedServicesContext } from '../../appcontext';

type EditNicknamesModalProps = {
  selectedNickname?: string;
  onClose: () => void;
  onSave: (lastAdded: string) => void;
};

const SAVE_ACTION_ID = 'save';

enum AddType {
  New,
  ExistingUser,
}

type ListingRowProps = {
  nickname: string;
  onDeleteItem: (nickname: string) => void;
};

function ListingRow(props: ListingRowProps) {
  const onClick = () => {
    return props.onDeleteItem(props.nickname);
  };
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
  placeholder: string;
  onAddRow: (input: string) => void;
};

function AddRow(props: AddRowProps) {
  const [inputValue, setInputvalue] = useState('');

  const onChangeInputValue = (text: string) => {
    setInputvalue(text);
  };

  const onClickAdd = () => {
    props.onAddRow(inputValue);
    setInputvalue('');
  };

  return (
    <li key={'add'} className="add">
      <div className="value">
        <TextField value={inputValue} onChange={onChangeInputValue} placeholder={props.placeholder} />
      </div>
      <div className="action">
        <Button title="add" onClick={onClickAdd} />
      </div>
    </li>
  );
}

let lastAdded: string = null;

export function EditNicknamesModal(props: EditNicknamesModalProps) {
  const dispatch = useAppDispatch();
  const nicknameSettings: NicknameSettings = useAppSelector(nicknameSettingsSelector);
  const [nicknames, setNicknames] = useState(nicknameSettings.nicknames);
  const [addType, setAddType] = useState(AddType.New);
  const sharedServices = useContext(SharedServicesContext) as SharedServices;
  const { chat } = sharedServices;

  const onAction = (id: string) => {
    switch (id) {
      case SAVE_ACTION_ID:
        dispatch(updateNicknames(nicknames));
        if (!lastAdded && !nicknames.find(n => n === props.selectedNickname)) {
          if (nicknames.length > 0) {
            props.onSave(nicknames[nicknames.length - 1]);
          } else {
            props.onSave(null);
          }
        } else {
          props.onSave(lastAdded || props.selectedNickname);
        }
        break;
    }
  };

  const onAddNickname = (nickname: string) => {
    lastAdded = nickname;
    setNicknames(nicknames.concat([nickname]));
  };

  const onAddExisting = async (userId: string) => {
    const userInfo = await chat.getUserInfo(userId);
    lastAdded = userInfo.nickname;
    setNicknames(nicknames.concat([userInfo.nickname]));
  };

  const createDeleteNicknameFn = (nickname: string) => {
    return () => {
      if (nickname === lastAdded) {
        lastAdded = null;
      }
      setNicknames(nicknames.filter(n => n !== nickname));
    };
  };

  const createOnClickTab = (type: AddType) => {
    return (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.stopPropagation();
      e.preventDefault();
      setAddType(type);
    };
  };

  // TODO: Check with chat service if user exists

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
        <div>
          <ul className="tab">
            <li className={cssCl('tab-item', [addType === AddType.New, 'active'])}>
              <a href="#" className="text-primary" onClick={createOnClickTab(AddType.New)}>
                Add new
              </a>
            </li>
            <li className={cssCl('tab-item', [addType === AddType.ExistingUser, 'active'])}>
              <a href="#" className="text-primary" onClick={createOnClickTab(AddType.ExistingUser)}>
                Add existing
              </a>
            </li>
          </ul>
          <ul className="tab table edit-list edit-channels-add">
            {addType === AddType.New ? (
              <AddRow onAddRow={onAddNickname} placeholder="Nickname" />
            ) : (
              <AddRow onAddRow={onAddExisting} placeholder="User ID" />
            )}
          </ul>
        </div>
      }
      actions={[{ title: 'Save', id: SAVE_ACTION_ID }]}
    />
  );
}
