import React, { useContext, useEffect, useState } from 'react';
import Button from '../atoms/Button';
import ModalDialog from './ModalDialog';
import {
  UserRepository,
  setUsers as updateUsers,
  selector as usersSettingsSeleector,
  UserData,
  getUserData,
} from '../../store/slices/userSettings';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import TextField from '../atoms/TextField';
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
  placeholders: Array<string>;
  onAddRow: (values: Array<string>) => void;
};

function AddRow(props: AddRowProps) {
  console.log("placeholders", props.placeholders);
  const [inputValues, setInputValues] = useState([] as Array<string>);

  const onChangeInputValue = (text: string, fieldIndex:number) => {
    const newValues = inputValues.concat();
    newValues[fieldIndex] = text;
    setInputValues(newValues);
  };

  const createOnChangeFn = (fieldIndex:number) => {
    return (text: string) => {
      onChangeInputValue(text, fieldIndex);
    }
  };

  const onClickAdd = () => {
    props.onAddRow(inputValues);
    clearInputs();
  };

  const clearInputs = () => {
    setInputValues(props.placeholders.map(() => ''));
  }

  useEffect(() => {
    clearInputs();
  }, []);

  return (
    <li key={'add'} className={["add", "n-fields-" + props.placeholders.length].join(' ')}>
      <div className="value">
        {props.placeholders.map((p, i) => (<TextField key={i} value={inputValues[i]} onChange={createOnChangeFn(i)} placeholder={p} />))}
      </div>
      <div className="action">
        <Button title="add" onClick={onClickAdd} />
      </div>
    </li>
  );
}

export default function EditUsersModal(props: EditUsersModalProps) {
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

  const onAddUser = (values:Array<string>) => {
    const [ nickname ] = values;
    const userData:UserData = {userId: chat.generateUserId(nickname), name: nickname };
    if (getUserData(userData.userId, users)) {
      // user already exists - bail
      // TODO: Show error message
      return;
    }
    lastAdded = userData.userId;
    setUsers(users.concat([userData]));
  };

  const onAddExisting = async (values:Array<string>) => {
    const [ userId, token ] = values;
    const userData:UserData = { userId: '', name: '' };
    const userInfo = await chat.getUserInfo(userId);
    if (!userInfo) {
      // user does not exist in Sendbird - bail
      // TODO: Show error message
      return;
    }
    if (getUserData(userInfo.userId, users)) {
      // user already exists - bail
      // TODO: Show error message
      return;
    }
    userData.name = userInfo.nickname;
    userData.userId = userInfo.userId;
    userData.token = token;
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
          <ul className="table edit-list edit-channels-add">
            {addType === AddType.New ? (
              <AddRow onAddRow={onAddUser} placeholders={["Nickname"]} />
            ) : (
              <AddRow onAddRow={onAddExisting} placeholders={["User ID", "Token"]} />
            )}
          </ul>
        </div>
      }
      actions={[{ title: 'Save', id: SAVE_ACTION_ID }]}
    />
  );
}
