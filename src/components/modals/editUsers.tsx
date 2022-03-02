import React, { useContext, useState } from 'react';
import { Button } from '../atoms/button';
import { ModalDialog } from './modalDialog';
import {
  UserRepository,
  setUsers as updateUsers,
  selector as usersSettingsSeleector,
  UserData,
  getUserData,
} from '../../store/slices/userSettings';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { TextField } from '../atoms/textField';
import { cssCl } from '../../util/styling';
import { SharedServices, SharedServicesContext } from '../../appcontext';

let lastAdded: string = null;

type EditUsersModalProps = {
  selectedUserId?: string;
  onClose: () => void;
  onSave: (lastAdded: string) => void;
};

const SAVE_ACTION_ID = 'save';

enum AddType {
  New,
  ExistingUser,
}

type ListingRowProps = {
  user: UserData;
  onDeleteItem: (user: UserData) => void;
};

function ListingRow(props: ListingRowProps) {
  const onClick = () => {
    return props.onDeleteItem(props.user);
  };
  return (
    <li>
      <div className="nickname value" title={props.user.name}>
        {props.user.name}
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

export function EditUsersModal(props: EditUsersModalProps) {
  const dispatch = useAppDispatch();
  const usersSettings: UserRepository = useAppSelector(usersSettingsSeleector);
  const [users, setUsers] = useState(usersSettings.users);
  const [addType, setAddType] = useState(AddType.New);
  const sharedServices = useContext(SharedServicesContext) as SharedServices;
  const { chat } = sharedServices;

  const onAction = (id: string) => {
    switch (id) {
      case SAVE_ACTION_ID:
        dispatch(updateUsers(users));
        if (!lastAdded && !getUserData(props.selectedUserId, users)) {
          if (users.length > 0) {
            props.onSave(users[users.length - 1].userId);
          } else {
            props.onSave(null);
          }
        } else {
          props.onSave(lastAdded || props.selectedUserId);
        }
        break;
    }
  };

  const onAddUser = (nickname: string) => {
    const userData:UserData = {userId: chat.generateUserId(nickname), name: nickname };
    lastAdded = userData.userId;
    setUsers(users.concat([userData]));
  };

  const onAddExisting = async (userId: string) => {
    const userData:UserData = { userId: '', name: '' };
    const userInfo = await chat.getUserInfo(userId);
    if (!userInfo) {
      
      return;
    }
    userData.name = userInfo.nickname;
    userData.userId = userInfo.userId;
    lastAdded = userData.userId;
    setUsers(users.concat([userData]));
  };

  const createDeleteUserFn = (user: UserData) => {
    return () => {
      if (user.userId === lastAdded) {
        lastAdded = null;
      }
      setUsers(users.filter(n => n !== user));
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
      title="Edit users"
      isLarge={false}
      onClose={props.onClose}
      onAction={onAction}
      content={
        <div>
          <ul className="table edit-list edit-channels-items">
            {users.map(c => (
              <ListingRow key={c.userId} user={c} onDeleteItem={createDeleteUserFn(c)} />
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
              <AddRow onAddRow={onAddUser} placeholder="Nickname" />
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
