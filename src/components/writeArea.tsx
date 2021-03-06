import React, { useContext, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { SharedServices, SharedServicesContext } from '../appcontext';
import { ConnectionStatus } from '../store/slices/uiState';
import * as stateMessages from '../store/slices/messages';
import * as stateUi from '../store/slices/uiState';
import Button from './atoms/Button';
import LayoutColumn from './atoms/LayoutColumn';
import LayoutRow from './atoms/LayoutRow';
import { Message } from '../services/chat';
import * as flashMessages from '../store/flashMessages';

export default function WriteArea() {
  const dispatch = useAppDispatch();
  const uiState: stateUi.UIState = useAppSelector(stateUi.selector);
  const sharedServices = useContext(SharedServicesContext) as SharedServices;
  const [text, setText] = useState('');

  const canSend = () => {
    return uiState.connectionStatus === ConnectionStatus.JoinedChannel &&
      text.length > 0;
  }

  const onChange = (e: React.FormEvent<HTMLTextAreaElement>) => {
    setText(e.currentTarget.value);
  };

  const onClickSend = () => {
    const { chat } = sharedServices;
    if (canSend()) {
      chat.sendMessage(text)
        .then((message:Message) => {
          dispatch(stateMessages.addMessage(message));
        })
        .catch((e) => {
          dispatch(stateUi.addFlashMessage(flashMessages.fromError(e, 'send-error')));
        });
      setText('');
    }
  };

  return (
    <LayoutRow>
      <LayoutColumn size={10}>
        <div className="form-group">
          <textarea className="form-input" id="new-message" rows={3} onChange={onChange} value={text}></textarea>
        </div>
      </LayoutColumn>
      <LayoutColumn size={2} extraClasses={['write-actions']}>
        <Button 
          title="Send" 
          type={canSend() ? 'primary': ''}
          disabled={!canSend()}
          onClick={onClickSend}
          />
      </LayoutColumn>
    </LayoutRow>
  );
}
